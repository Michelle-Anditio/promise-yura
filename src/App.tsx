import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Sparkles, Bell } from "lucide-react";
import { PromiseItem, UserPreferences } from "./types";
import { authService, UserSession, mapToUserSession } from "./services/authService";
import { parseMessyThought } from "./services/yuraBrain";
import { db, auth, handleFirestoreError, OperationType } from "./services/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
import { showYuraNotification, registerNotificationServiceWorker } from "./services/notificationHelper";

// Screens
import { SplashScreen, OnboardingScreen, StartupSplashScreen } from "./screens/StaticScreens";
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, PermissionScreen } from "./screens/AuthScreens";
import { ListeningScreen, ProcessingScreen, ReviewPromisesScreen, SavedSuccessScreen } from "./screens/VoiceScreens";
import { MyPromisesScreen, EditPromiseScreen, CheckInScreen, RescheduleScreen, MissedPromiseScreen } from "./screens/PromiseScreens";
import { HomeScreen, HistoryScreen, ProfileScreen, CustomizeYuraScreen } from "./screens/MainScreens";
import { TypeThoughtModal } from "./components/promise/TypeThoughtModal";
import { EditDateTimeModal } from "./components/promise/EditDateTimeModal";
import { UpdateNameModal } from "./components/profile/UpdateNameModal";
import { DeleteAccountModal } from "./components/profile/DeleteAccountModal";
import { LogoutConfirmationModal } from "./components/profile/LogoutConfirmationModal";
import { ExitConfirmationModal } from "./components/profile/ExitConfirmationModal";

const initialPromises: PromiseItem[] = [];
const initialHistory: PromiseItem[] = [];

function normalizeTimeTo24h(timeStr: string): string {
  if (!timeStr) return "";
  const cleaned = timeStr.trim().toUpperCase();
  
  // Try matching HH:MM (e.g., 18:00 or 08:30)
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hr = parseInt(match24[1], 10);
    const min = match24[2];
    return `${String(hr).padStart(2, "0")}:${min}`;
  }
  
  // Try matching HH:MM AM/PM (e.g., "05:00 PM" or "8:30 AM")
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hr = parseInt(match12[1], 10);
    const min = match12[2];
    const meridian = match12[3];
    if (meridian === "PM" && hr < 12) {
      hr += 12;
    } else if (meridian === "AM" && hr === 12) {
      hr = 0;
    }
    return `${String(hr).padStart(2, "0")}:${min}`;
  }
  return "";
}

function getPromiseDueDate(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  const lowerDate = dateStr.toLowerCase().trim();
  if (lowerDate.includes("every")) return null; // Repeat patterns ignored for scheduling in this MVP
  
  const now = new Date();
  let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (lowerDate === "tomorrow") {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lowerDate === "today" || lowerDate === "later today") {
    // Keep today's date
  } else {
    // Check if it matches YYYY-MM-DD
    const matchYMD = lowerDate.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
    if (matchYMD) {
      const y = parseInt(matchYMD[1], 10);
      const m = parseInt(matchYMD[2], 10) - 1;
      const d = parseInt(matchYMD[3], 10);
      targetDate = new Date(y, m, d);
    }
  }
  
  const normalizedTime = normalizeTimeTo24h(timeStr);
  if (normalizedTime) {
    const parts = normalizedTime.split(":");
    if (parts.length === 2) {
      targetDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      return targetDate;
    }
  }
  return null;
}

function calculateNextReminderAt(dueDate: Date, intensity: "Gentle" | "Normal" | "Annoying" | undefined): string | undefined {
  if (!dueDate) return undefined;

  const inst = intensity || "Normal";
  const nowMs = Date.now();
  const dueMs = dueDate.getTime();

  // Gentle: 15 minutes before + at due time
  // Normal: 30 minutes before + 15 minutes before + at due time
  // Annoying: 60 minutes before + 30 minutes before + 15 minutes before,
  // then every 1 minute starting from 15 minutes before due time.
  const fixedOffsetsInMinutes =
    inst === "Gentle"
      ? [-15, 0]
      : inst === "Normal"
        ? [-30, -15, 0]
        : [-60, -30, -15];

  for (const offset of fixedOffsetsInMinutes) {
    const reminderTime = dueMs + offset * 60 * 1000;
    if (reminderTime > nowMs) {
      return new Date(reminderTime).toISOString();
    }
  }

  if (inst === "Annoying") {
    const annoyingIntervalStartMs = dueMs - 15 * 60 * 1000;

    // If the promise is saved inside the final 15-minute window or after the due time,
    // fire on the next scheduler tick, then continue every 1 minute.
    if (nowMs >= annoyingIntervalStartMs) {
      return new Date(nowMs).toISOString();
    }
  }

  return undefined;
}

function enrichPromiseTimes(p: Partial<PromiseItem>): Partial<PromiseItem> {
  if (!p.dateStr || !p.timeStr) {
    return {
      ...p,
      dueAt: undefined,
      reminderAt: undefined
    };
  }
  const dueDate = getPromiseDueDate(p.dateStr, p.timeStr);
  if (dueDate) {
    const dueAt = dueDate.toISOString();
    const reminderAt = calculateNextReminderAt(dueDate, p.intensity);
    return {
      ...p,
      dueAt,
      reminderAt
    };
  }
  return p;
}

function cleanFirestoreData<T extends object>(data: T): T {
  const clean: any = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean as T;
}

export default function App() {
  // Screens state management
  const [currentScreen, setCurrentScreenState] = useState<string>("Splash");
  const [screenHistory, setScreenHistory] = useState<string[]>([]);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isTypeThoughtModalOpen, setIsTypeThoughtModalOpen] = useState(false);
  const [isEditDateTimeModalOpen, setIsEditDateTimeModalOpen] = useState(false);
  const [isUpdateNameModalOpen, setIsUpdateNameModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [startupSplashDone, setStartupSplashDone] = useState(false);

  const setCurrentScreen = (nextScreen: string | ((prev: string) => string)) => {
    const resolvedNext = typeof nextScreen === "function" ? nextScreen(currentScreen) : nextScreen;
    if (resolvedNext === currentScreen) return;

    const isRoot = ["Home", "MyPromises", "History", "Profile"].includes(resolvedNext);
    if (isRoot) {
      setScreenHistory([resolvedNext]);
    } else {
      setScreenHistory(prev => {
        if (prev[prev.length - 1] === currentScreen) return prev;
        return [...prev, currentScreen];
      });
    }

    setCurrentScreenState(resolvedNext);
    window.history.pushState({ screen: resolvedNext }, resolvedNext);
  };

  const handleExitApp = () => {
    setIsExitModalOpen(false);
    window.close();
    window.location.href = "about:blank";
  };

  // Minimum startup splash duration timer (1.8 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartupSplashDone(true);
      console.log("[Splash] Minimum stay timer reached.");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Sync PWA / Browser back button
  useEffect(() => {
    window.history.replaceState({ screen: "Splash" }, "Splash");

    const handlePopState = () => {
      // 1. Closable Modals Checklist: Close any open dialogs first
      if (isTypeThoughtModalOpen) {
        setIsTypeThoughtModalOpen(false);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }
      if (isEditDateTimeModalOpen) {
        setIsEditDateTimeModalOpen(false);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }
      if (isUpdateNameModalOpen) {
        setIsUpdateNameModalOpen(false);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }
      if (isDeleteAccountModalOpen) {
        setIsDeleteAccountModalOpen(false);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }
      if (isLogoutModalOpen) {
        setIsLogoutModalOpen(false);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }
      if (isExitModalOpen) {
        setIsExitModalOpen(false);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }

      // 2. Are we currently on a root screen?
      const isRoot = ["Home", "MyPromises", "History", "Profile"].includes(currentScreen);
      if (isRoot) {
        setIsExitModalOpen(true);
        window.history.pushState({ screen: currentScreen }, currentScreen);
        return;
      }

      // 3. Navigate back through state history stack if populated
      if (screenHistory.length > 0) {
        const prev = screenHistory[screenHistory.length - 1];
        setScreenHistory(history => history.slice(0, -1));
        setCurrentScreenState(prev);
      } else {
        const authScreens = ["Login", "Register", "ForgotPassword", "Onboarding", "Permission", "Splash"];
        if (authScreens.includes(currentScreen)) {
          window.history.pushState({ screen: currentScreen }, currentScreen);
        } else {
          setCurrentScreenState("Home");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    currentScreen,
    screenHistory,
    isTypeThoughtModalOpen,
    isEditDateTimeModalOpen,
    isUpdateNameModalOpen,
    isDeleteAccountModalOpen,
    isLogoutModalOpen,
    isExitModalOpen
  ]);
  const [yuraReminderBanner, setYuraReminderBanner] = useState<{ title: string; subtitle: string } | null>(null);
  const [promises, setPromises] = useState<PromiseItem[]>(initialPromises);
  const [historyList, setHistoryList] = useState<PromiseItem[]>(initialHistory);
  
  // Simulated database inputs
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    messageTone: "Sweet",
    voiceInputEnabled: true,
    notificationStyle: "Soft nudge"
  });

  // Flow specifics
  const [inputThought, setInputThought] = useState("");
  const [typedThoughtDraft, setTypedThoughtDraft] = useState("");
  const [editDateTimePromiseId, setEditDateTimePromiseId] = useState<string | null>(null);
  const [detectedDrafts, setDetectedDrafts] = useState<PromiseItem[]>([]);
  const [activeOnboardingSlide, setActiveOnboardingSlide] = useState(0);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(authService.getCurrentUser());
  
  // Filter inside Tab:My Promises
  const [promiseFilter, setPromiseFilter] = useState<"All" | "Today" | "Needs detail" | "Done">("All");
  
  // Filter inside Tab:History List
  const [historyFilter, setHistoryFilter] = useState<"All" | "Kept" | "Missed" | "This week">("All");

  // Interaction logs / state parameters
  const [processingState, setProcessingState] = useState<number>(0); // 0 = Finding, 1 = details, 2 = preparing
  const [followUpPromiseId, setFollowUpPromiseId] = useState<string | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState("");

  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Listen to beforeinstallprompt event to make application installable
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser from showing automatic prompt so we can display our custom UI
      e.preventDefault();
      // Store the event so we can trigger it later on user gesture
      setDeferredPrompt(e);
      console.log("[PWA] Captured beforeinstallprompt event!");
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App installed successfully!");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Listen for real Firebase auth changes and sync screens automatically
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let name = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
        try {
          // Check for custom displayName stored in Firestore users collection
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data && data.displayName) {
              name = data.displayName;
            }
          }
        } catch (err) {
          console.error("[Auth] Error fetching user profile from Firestore:", err);
        }

        const session: UserSession = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: name,
          avatarUrl: firebaseUser.photoURL || undefined
        };
        setCurrentSession(session);
        setAuthResolved(true);

        // If manually logging in / registering, forward to Home immediately.
        // On Splash start, we let the startup splash coordinator effect handle the timing gate transition.
        if (currentScreen === "Login" || currentScreen === "Register") {
          setCurrentScreen("Home");
        }
      } else {
        setCurrentSession(null);
        setAuthResolved(true);
        // Redirect to Login if on any private screen
        const publicScreens = ["Splash", "Onboarding", "Login", "Register", "ForgotPassword"];
        if (!publicScreens.includes(currentScreen)) {
          setCurrentScreen("Login");
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [currentScreen]);

  // Startup splash completion handler for authenticated users
  useEffect(() => {
    if (startupSplashDone && authResolved && currentSession && currentScreen === "Splash") {
      console.log("[Splash] Auth resolved and minimum stay timer completed. Transitioning to Home...");
      setCurrentScreen("Home");
    }
  }, [startupSplashDone, authResolved, currentSession, currentScreen]);

  // Sync promises with Firestore in real-time
  useEffect(() => {
    if (!currentSession) {
      setPromises([]);
      setHistoryList([]);
      return;
    }

    const { uid } = currentSession;
    const promisesRef = collection(db, "users", uid, "promises");

    const unsubscribeSnapshot = onSnapshot(
      promisesRef,
      (querySnapshot) => {
        const items: PromiseItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            title: data.title || "",
            dateStr: data.dateStr || "",
            timeStr: data.timeStr || "",
            priority: data.priority || "Medium",
            status: data.status || "upcoming",
            notes: data.notes || "",
            category: data.category || "",
            intensity: data.intensity || "Normal",
            dueAt: data.dueAt || undefined,
            reminderAt: data.reminderAt || undefined,
            originalText: data.originalText || "",
            needsDetails: data.needsDetails ?? (data.status === "needs detail"),
            createdAt: data.createdAt || undefined,
            updatedAt: data.updatedAt || undefined
          });
        });

        setPromises(items);
        setHistoryList(items.filter(item => item.status === "done" || item.status === "missed"));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/promises`);
      }
    );

    return () => {
      unsubscribeSnapshot();
    };
  }, [currentSession]);

  // Auth Form parameters
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  // Edit Form parameters
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [editNotes, setEditNotes] = useState("");
  const [editIntensity, setEditIntensity] = useState<"Gentle" | "Normal" | "Annoying">("Normal");
  const [editCategory, setEditCategory] = useState("PROMISE");

  // Custom toast notification trigger
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Real-time background browser notifications check
  // TODO: Implement FCM (Firebase Cloud Messaging) and a background Cloud / Cron Worker
  // to ensure notifications can still be pushed to the client when the browser is fully closed.
  // Currently, this is a fully functional MVP scheduling engine that operates on active local browser sessions.
  const notifiedPromisesRef = React.useRef<Set<string>>(new Set());
  const promisesRef = React.useRef<PromiseItem[]>(promises);
  const currentSessionRef = React.useRef<any>(currentSession);

  useEffect(() => {
    promisesRef.current = promises;
  }, [promises]);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  useEffect(() => {
    console.log("[Scheduler] Notification scheduler mounted/loaded. Browser permission status:", typeof Notification !== "undefined" ? Notification.permission : "not supported");

    // Register the Notification Service Worker for Mobile browsers
    registerNotificationServiceWorker()
      .then((reg) => {
        if (reg) {
          console.log("[App] Service Worker registration initialized:", reg);
        }
      })
      .catch((err) => {
        console.error("[App] Service Worker registration failed:", err);
      });

    const interval = setInterval(() => {
      const nowMs = Date.now();
      const currentPromises = promisesRef.current;
      const session = currentSessionRef.current;

      console.log(`[SchedulerTick] Tick run at ${new Date().toISOString()}. Checked count: ${currentPromises.length} promises.`);

      currentPromises.forEach(async (promise) => {
        const completed = promise.status === "done" || promise.status === "completed";
        const dueDateObj = (promise.dateStr && promise.timeStr) ? getPromiseDueDate(promise.dateStr, promise.timeStr) : null;

        console.log(`[SchedulerTick] Promise entry details:
          - Title: "${promise.title}"
          - Stored dueAt: ${promise.dueAt || "N/A"}
          - Stored Status: "${promise.status}" (Completed: ${completed})
          - Verify valid dueAt object: ${dueDateObj ? "VALID/PARSED" : "INVALID/MISSING"}
        `);

        // Verify completed promises are skipped
        if (promise.status !== "upcoming") {
          console.log(`[SchedulerTick] Skipping "${promise.title}": Promise completed/inactive status is "${promise.status}".`);
          return;
        }

        // If reminderAt is not set, compute it lazily so we don't skip uninitialized schedules
        let nextReminder = promise.reminderAt;
        if (!nextReminder && dueDateObj) {
          nextReminder = calculateNextReminderAt(dueDateObj, promise.intensity);
          console.log(`[SchedulerTick] Lazily calculated nextReminder for "${promise.title}": ${nextReminder || "none (all offsets in the past)"}`);
        } else {
          console.log(`[SchedulerTick] Existing stored reminderAt for "${promise.title}": ${nextReminder || "none"}`);
        }

        if (nextReminder) {
          const reminderTime = new Date(nextReminder).getTime();
          const isPastOrNow = nowMs >= reminderTime;

          console.log(`[SchedulerTick] Evaluating schedule trigger match for "${promise.title}":
            - Scheduled Reminder: ${nextReminder} (${new Date(reminderTime).toLocaleTimeString()})
            - Current Local Time: ${new Date(nowMs).toISOString()} (${new Date(nowMs).toLocaleTimeString()})
            - Status: ${isPastOrNow ? "PAST/NOW (Should trigger notification)" : "FUTURE (Still pending)"}
          `);
          
          // Trigger if the scheduled time is here or slightly passed
          if (isPastOrNow) {
            const notificationKey = `${promise.id}-${nextReminder}`;
            if (notifiedPromisesRef.current.has(notificationKey)) {
              console.log(`[SchedulerTick] Skipping Notification for "${promise.title}": Already dispatched key "${notificationKey}" in current session.`);
              return;
            }

            // Generate cute playful Yura-style notification copy based on user requirements
            const templates = [
              `Yura is staring at your promise 👀: "${promise.title}"`,
              `Tiny promise check-in time!: "${promise.title}"`,
              `Your promise is coming up soon: "${promise.title}"`,
              `Psst… don’t let this promise escape: "${promise.title}"`
            ];
            const randomText = templates[Math.floor(Math.random() * templates.length)];

            try {
              console.log(`[SchedulerTick] Calling showYuraNotification() for promise: "${promise.title}" with reminder: ${nextReminder}`);
              
              // Trigger mobile-safe and desktop-fallback browser notification
              showYuraNotification("Yura Reminder ⏰", {
                body: randomText
              });
              
              // Trigger in-app interactive cute fallback banner
              const inAppTemplates = [
                "Yura is staring at your promise 👀",
                "Psst… your promise is waiting.",
                "Tiny promise check-in time! ✨",
                "Keep your word, Yura is watching! 🐾"
              ];
              const randomSubtitle = inAppTemplates[Math.floor(Math.random() * inAppTemplates.length)];
              setYuraReminderBanner({
                title: promise.title,
                subtitle: randomSubtitle
              });

              // Auto-dismiss the interactive banner after 6 seconds
              const timer = setTimeout(() => {
                setYuraReminderBanner(null);
              }, 6000);
              
              notifiedPromisesRef.current.add(notificationKey);
              console.log(`[Notification] Triggered playful nudge browser alert and in-app banner for: ${promise.title} at ${nextReminder}`);

              // Calculate the NEXT valid reminder time after the current notification fires.
              // Gentle and Normal progress through fixed offsets.
              // Annoying uses fixed offsets first (-60, -30, -15), then switches to every 1 minute
              // from 15 minutes before due time until the promise leaves "upcoming".
              const nextDueDate = dueDateObj || (promise.dateStr && promise.timeStr ? getPromiseDueDate(promise.dateStr, promise.timeStr) : null);
              let nextReminderStr: string | undefined;

              if (promise.intensity === "Annoying" && nextDueDate) {
                const annoyingIntervalStartMs = nextDueDate.getTime() - 15 * 60 * 1000;

                if (nowMs >= annoyingIntervalStartMs) {
                  nextReminderStr = new Date(nowMs + 60 * 1000).toISOString();
                } else {
                  nextReminderStr = calculateNextReminderAt(nextDueDate, promise.intensity);
                }
              } else {
                nextReminderStr = nextDueDate ? calculateNextReminderAt(nextDueDate, promise.intensity) : undefined;
              }

              const updatedPromise: PromiseItem = {
                ...promise,
                reminderAt: nextReminderStr
              };

              // Persist the updated reminder key to prevent infinite loops and progress schedule sequence
              if (session) {
                const { uid } = session;
                await setDoc(doc(db, "users", uid, "promises", promise.id), cleanFirestoreData(updatedPromise));
              } else {
                setPromises((prev) => prev.map(p => p.id === promise.id ? updatedPromise : p));
              }
            } catch (err) {
              console.warn("Browser notification delivery failed:", err);
            }
          }
        }
      });
    }, 10000); // Check every 10s

    return () => {
      console.log("[Scheduler] Dismounting scheduler interval.");
      clearInterval(interval);
    };
  }, []);

  // Automated loading steps simulation for PROCESSING page
  useEffect(() => {
    if (currentScreen === "Processing") {
      setProcessingState(0);
      const t1 = setTimeout(() => {
        setProcessingState(1);
      }, 1500);
      const t2 = setTimeout(() => {
        setProcessingState(2);
      }, 3000);
      const t3 = setTimeout(() => {
        // Complete processing, redirect to Review Drafts screen
        setCurrentScreen("ReviewPromises");
      }, 4500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [currentScreen]);

  // Handle Voice Catch trigger action
  const handleStartCatchProcedure = () => {
    // Clear out speech input so that it starts cleanly
    setInputThought("");
    setCurrentScreen("Listening");
  };

  const handleFinishListeningFlow = async (directThought?: string) => {
    const thoughtToParse = typeof directThought === "string" ? directThought : inputThought;
    setCurrentScreen("Processing");
    // Generate structured items via Brain Service
    const drafts = await parseMessyThought(thoughtToParse);
    
    // Set parsed models including complete metadata attributes
    const parsedPromiseDrafts = drafts.map((d, index) => {
      const itemPartial: Partial<PromiseItem> = {
        title: d.title,
        dateStr: d.dateStr,
        timeStr: d.timeStr,
        intensity: d.intensity || "Normal",
      };
      const enriched = enrichPromiseTimes(itemPartial);
      return {
        id: `draft-${index}-${Date.now()}`,
        title: d.title,
        dateStr: d.dateStr,
        timeStr: d.timeStr,
        priority: d.priority,
        status: (d.needsDetails ? "needs detail" as const : "upcoming" as const),
        notes: d.notes,
        intensity: d.intensity,
        originalText: thoughtToParse,
        needsDetails: d.needsDetails,
        dueAt: enriched.dueAt,
        reminderAt: enriched.reminderAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    setDetectedDrafts(parsedPromiseDrafts);
  };

  // Trigger Save Drafts flow
  const handleSaveAllCapturedPromises = async () => {
    if (currentSession) {
      const { uid } = currentSession;
      try {
        for (const draft of detectedDrafts) {
          const itemPartial: Partial<PromiseItem> = {
            title: draft.title,
            dateStr: draft.dateStr,
            timeStr: draft.timeStr || "",
            priority: draft.priority,
            intensity: draft.intensity || "Normal",
          };
          const enriched = enrichPromiseTimes(itemPartial);

          const cleanDraft: PromiseItem = {
            id: draft.id,
            title: draft.title,
            dateStr: draft.dateStr,
            timeStr: draft.timeStr || "",
            priority: draft.priority,
            status: draft.status,
            notes: draft.notes || "",
            category: draft.category || "",
            intensity: draft.intensity || "Normal",
            originalText: draft.originalText || inputThought,
            needsDetails: draft.needsDetails ?? (draft.status === "needs detail"),
            dueAt: enriched.dueAt,
            reminderAt: enriched.reminderAt,
            createdAt: draft.createdAt || new Date().toISOString(),
            updatedAt: draft.updatedAt || new Date().toISOString()
          };
          console.log(`[Firestore] Saving captured promise document to path: users/${uid}/promises/${draft.id}`);
          await setDoc(doc(db, "users", uid, "promises", draft.id), cleanFirestoreData(cleanDraft));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${uid}/promises`);
      }
    } else {
      console.warn("[Firestore] User is not logged in. Saving captured promises to local state instead.");
      setPromises((prev) => [...prev, ...detectedDrafts]);
    }
    setDetectedDrafts([]);
    setCurrentScreen("SavedSuccess");
  };

  // Edit promise setup
  const loadEditPromiseForm = (id: string) => {
    const item = promises.find(p => p.id === id) || detectedDrafts.find(d => d.id === id);
    if (item) {
      setCurrentEditingId(id);
      setEditTitle(item.title);

      let initDate = "";
      let initTime = "";

      if (item.dueAt) {
        try {
          const d = new Date(item.dueAt);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dayNum = String(d.getDate()).padStart(2, "0");
            const hrs = String(d.getHours()).padStart(2, "0");
            const mins = String(d.getMinutes()).padStart(2, "0");
            initDate = `${y}-${m}-${dayNum}`;
            initTime = `${hrs}:${mins}`;
          }
        } catch {
          // ignore
        }
      }

      if (!initDate && item.dateStr) {
        const matchYMD = item.dateStr.trim().match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
        if (matchYMD) {
          initDate = item.dateStr.trim();
        } else {
          // Resolve relative words e.g. "Today" or "Tomorrow" to date format
          const now = new Date();
          if (item.dateStr.toLowerCase().includes("tomorrow")) {
            now.setDate(now.getDate() + 1);
          }
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, "0");
          const dayNum = String(now.getDate()).padStart(2, "0");
          initDate = `${y}-${m}-${dayNum}`;
        }
      }

      if (!initDate) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const dayNum = String(now.getDate()).padStart(2, "0");
        initDate = `${y}-${m}-${dayNum}`;
      }

      if (!initTime && item.timeStr) {
        const normalized = normalizeTimeTo24h(item.timeStr);
        if (normalized) {
          initTime = normalized;
        }
      }

      setEditDate(initDate);
      setEditTime(initTime);
      setEditPriority(item.priority);
      setEditNotes(item.notes || "");
      setEditIntensity(item.intensity || "Normal");
      setEditCategory(item.category || "PROMISE");
      setCurrentScreen("EditPromise");
    }
  };

  const handleTypeInstead = () => {
    // Generate a unique dynamic ID for the new promise draft
    const newId = `promise_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCurrentEditingId(newId);
    setEditTitle("");
    
    // Choose date: default to today (YYYY-MM-DD format)
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    setEditDate(`${y}-${m}-${d}`);
    
    // Default to next hour in HH:MM format
    const nextHour = (now.getHours() + 1) % 24;
    setEditTime(`${String(nextHour).padStart(2, "0")}:00`);
    
    setEditPriority("Medium");
    setEditNotes("");
    setEditIntensity("Normal");
    setEditCategory("PROMISE");
    
    setCurrentScreen("EditPromise");
  };

  const handleOpenEditDateTime = (id: string) => {
    setEditDateTimePromiseId(id);
    setIsEditDateTimeModalOpen(true);
  };

  const handleCloseEditDateTime = () => {
    setIsEditDateTimeModalOpen(false);
    setEditDateTimePromiseId(null);
  };

  const handleSaveProfileName = async (newName: string) => {
    try {
      await authService.updateProfileName(newName);
      setCurrentSession(prev => prev ? { ...prev, displayName: newName } : null);
      showToast("Profile name updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile name:", err);
      showToast("Error updating profile name. Please try again.");
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      
      // Clean and reset all session states & profile parameters
      setCurrentSession(null);
      setPromises([]);
      setHistoryList([]);
      setCurrentEditingId(null);
      setDetectedDrafts([]);
      setInputThought("");
      setTypedThoughtDraft("");
      setEditDateTimePromiseId(null);
      setFollowUpPromiseId(null);
      setCustomTimeInput("");
      setPreferences({
        messageTone: "Sweet",
        voiceInputEnabled: true,
        notificationStyle: "Soft nudge"
      });
      
      // Clear sensitive inputs and error states on successful logout
      setAuthPassword("");
      setAuthError("");
      
      showToast("Signed out successfully");
      setCurrentScreen("Login");
    } catch (err: any) {
      console.error("[LogoutGate] Logout execution error:", err);
      showToast(err?.message || "Failed to sign out. Please try again.");
      throw err;
    }
  };

  const handleSaveEditDateTime = async (dateStr: string, timeStr: string, dueAtIso: string) => {
    setIsEditDateTimeModalOpen(false);
    if (!editDateTimePromiseId) return;

    const promise = promises.find(p => p.id === editDateTimePromiseId);
    if (!promise) return;

    const nextDueDate = new Date(dueAtIso);
    const updatedReminderAt = calculateNextReminderAt(nextDueDate, promise.intensity || "Normal");
    const updatedStatus = promise.status === "needs detail" ? "upcoming" : promise.status;

    const updatedPromise: PromiseItem = {
      ...promise,
      dateStr,
      timeStr,
      dueAt: dueAtIso,
      reminderAt: updatedReminderAt,
      status: updatedStatus,
      needsDetails: updatedStatus === "needs detail",
      updatedAt: new Date().toISOString()
    };

    if (currentSession) {
      const { uid } = currentSession;
      try {
        await setDoc(doc(db, "users", uid, "promises", editDateTimePromiseId), cleanFirestoreData(updatedPromise));
        
        // Update local state immediately for instant feedback
        setPromises(prev => prev.map(p => p.id === editDateTimePromiseId ? updatedPromise : p));
        
        showToast("Reminder schedule updated successfully!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}/promises/${editDateTimePromiseId}`);
      }
    } else {
      setPromises(prev => prev.map(p => p.id === editDateTimePromiseId ? updatedPromise : p));
      showToast("Reminder schedule updated locally!");
    }
    
    setEditDateTimePromiseId(null);
  };

  const saveEditPromiseForm = async () => {
    if (!currentEditingId) return;
    const isDraft = detectedDrafts.some(d => d.id === currentEditingId);
    const existingPromise = promises.find(p => p.id === currentEditingId) || detectedDrafts.find(d => d.id === currentEditingId);

    // Validation 5 & 6
    if (!editDate) {
      showToast("Please select a date.");
      return;
    }

    if (editTime) {
      try {
        const [yearStr, monthStr, dayStr] = editDate.split("-");
        const [hourStr, minStr] = editTime.split(":");
        const combinedDate = new Date(
          parseInt(yearStr, 10),
          parseInt(monthStr, 10) - 1,
          parseInt(dayStr, 10),
          parseInt(hourStr, 10),
          parseInt(minStr, 10),
          0,
          0
        );

        if (isNaN(combinedDate.getTime())) {
          showToast("The selected date or time combination is invalid.");
          return;
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const selectedDateOnly = new Date(combinedDate.getFullYear(), combinedDate.getMonth(), combinedDate.getDate());

        if (selectedDateOnly < todayStart) {
          showToast("Selected date cannot be in the past.");
          return;
        }

        if (selectedDateOnly.getTime() === todayStart.getTime()) {
          if (combinedDate < now) {
            showToast("Selected time is in the past. Please set a future time.");
            return;
          }
        }
      } catch (err) {
        showToast("Invalid date-time selection.");
        return;
      }
    } else {
      try {
        const [yearStr, monthStr, dayStr] = editDate.split("-");
        const combinedDate = new Date(
          parseInt(yearStr, 10),
          parseInt(monthStr, 10) - 1,
          parseInt(dayStr, 10),
          0,
          0,
          0,
          0
        );
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (combinedDate < todayStart) {
          showToast("Selected date cannot be in the past.");
          return;
        }
      } catch {
        showToast("Invalid date selection.");
        return;
      }
    }

    const newStatus = editTime === "" 
      ? "needs detail" as const 
      : (existingPromise 
          ? (existingPromise.status === "needs detail" ? "upcoming" as const : existingPromise.status) 
          : "upcoming" as const);

    const itemPartial: Partial<PromiseItem> = {
      title: editTitle,
      dateStr: editDate,
      timeStr: editTime,
      priority: editPriority,
      intensity: editIntensity,
    };
    const enriched = enrichPromiseTimes(itemPartial);

    let finalDateStr = editDate;
    let finalTimeStr = editTime;

    if (enriched.dueAt) {
      const date = new Date(enriched.dueAt);
      if (!isNaN(date.getTime())) {
        const now = new Date();
        const isSameDay = (d1: Date, d2: Date) => {
          return d1.getFullYear() === d2.getFullYear() &&
                 d1.getMonth() === d2.getMonth() &&
                 d1.getDate() === d2.getDate();
        };

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        if (isSameDay(date, now)) {
          finalDateStr = "Today";
        } else if (isSameDay(date, tomorrow)) {
          finalDateStr = "Tomorrow";
        } else {
          const optionsDate: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
          finalDateStr = date.toLocaleDateString("en-US", optionsDate); // E.g., "Mon, May 27"
        }

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        finalTimeStr = `${hours}:${minutes} ${ampm}`; // E.g., "11:30 AM"
      }
    }

    const updated: PromiseItem = {
      id: currentEditingId,
      title: editTitle,
      dateStr: finalDateStr,
      timeStr: finalTimeStr,
      priority: editPriority,
      status: newStatus,
      notes: editNotes,
      intensity: editIntensity,
      category: editCategory || "PROMISE",
      originalText: existingPromise?.originalText || editTitle,
      needsDetails: newStatus === "needs detail",
      dueAt: enriched.dueAt,
      reminderAt: enriched.reminderAt,
      createdAt: existingPromise?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isDraft) {
      setDetectedDrafts((prev) =>
        prev.map((item) => {
          if (item.id === currentEditingId) {
            return {
              ...item,
              title: editTitle,
              dateStr: finalDateStr,
              timeStr: finalTimeStr,
              priority: editPriority,
              status: newStatus,
              notes: editNotes,
              intensity: editIntensity,
              category: editCategory || "PROMISE",
              originalText: item.originalText || editTitle,
              needsDetails: newStatus === "needs detail",
              dueAt: enriched.dueAt,
              reminderAt: enriched.reminderAt,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        })
      );
      setCurrentEditingId(null);
      showToast("Draft updated!");
      setCurrentScreen("ReviewPromises");
      return;
    }

    if (currentSession) {
      const { uid } = currentSession;
      try {
        console.log(`[Firestore] Saving promise document at path: users/${uid}/promises/${currentEditingId}`);
        await setDoc(doc(db, "users", uid, "promises", currentEditingId), cleanFirestoreData(updated));
        
        // Update local state immediately for instant feedback
        setPromises((prev) => {
          const exists = prev.some(p => p.id === currentEditingId);
          if (exists) {
            return prev.map(p => p.id === currentEditingId ? updated : p);
          } else {
            return [...prev, updated];
          }
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${uid}/promises/${currentEditingId}`);
      }
    } else {
      console.warn("[Firestore] User is not logged in. Saving promise in local state instead.");
      setPromises((prev) => {
        const exists = prev.some(p => p.id === currentEditingId);
        if (exists) {
          return prev.map(p => p.id === currentEditingId ? updated : p);
        } else {
          return [...prev, updated];
        }
      });
    }

    setCurrentEditingId(null);
    showToast("Promise updated in Yura's list!");
    setCurrentScreen("MyPromises");
  };

  const deletePromisesById = async (id: string) => {
    if (currentSession) {
      const { uid } = currentSession;
      try {
        await deleteDoc(doc(db, "users", uid, "promises", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${uid}/promises/${id}`);
      }
    } else {
      setPromises((prev) => prev.filter(p => p.id !== id));
    }
    setCurrentEditingId(null);
    showToast("Promise dismissed.");
    setCurrentScreen("MyPromises");
  };

  const handleConfirmDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user session found to delete.");
    }
    const uid = user.uid;

    console.log(`[App] Beginning database wipe and account deletion for: ${uid}`);

    // 1. Delete all user promises from Firestore if possible
    try {
      for (const p of promises) {
        try {
          await deleteDoc(doc(db, "users", uid, "promises", p.id));
        } catch (e) {
          console.error(`[App] Error deleting promise ${p.id} for user ${uid}:`, e);
        }
      }
    } catch (e) {
      console.error("[App] Failed to delete subcollection elements:", e);
    }

    // 2. Delete user profile doc if possible
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (e) {
      console.error(`[App] Error deleting user profile doc under users/${uid}:`, e);
    }

    // 3. Delete Firebase Auth user account
    try {
      await user.delete();
    } catch (err) {
      console.error("[App] Auth user deletion failed:", err);
      throw err; // bubble up so the modal can handle re-auth errors nicely
    }

    // 4. Reset local store settings, clear inputs/error states, and direct path to Login screen
    setCurrentSession(null);
    setPromises([]);
    setHistoryList([]);
    
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
    setAuthName("");

    setCurrentScreen("Login");
    showToast("Your account has been deleted.");
  };

  // Render content helpers
  const filteredPromises = promises.filter(p => {
    if (promiseFilter === "All") return p.status !== "done" && p.status !== "missed";
    if (promiseFilter === "Today") return p.dateStr.toLowerCase().includes("today") && p.status !== "done" && p.status !== "missed";
    if (promiseFilter === "Needs detail") return p.status === "needs detail" || p.timeStr === "";
    if (promiseFilter === "Done") return p.status === "done";
    return true;
  });

  const getFilteredHistoryList = () => {
    const overduePromises = promises.filter(p => {
      if (p.status !== "done" && p.status !== "missed" && p.status !== "needs detail" && p.dueAt) {
        return new Date(p.dueAt).getTime() < Date.now();
      }
      return false;
    });

    const unifiedHistory = [...historyList];
    overduePromises.forEach(op => {
      if (!unifiedHistory.some(h => h.id === op.id)) {
        unifiedHistory.push({ ...op, status: "missed" });
      }
    });

    return unifiedHistory.filter(h => {
      if (historyFilter === "All") return true;
      if (historyFilter === "Kept") return h.status === "done";
      if (historyFilter === "Missed") return h.status === "missed";
      if (historyFilter === "This week") return h.dateStr !== "Last month";
      return true;
    });
  };

  return (
    <div className="font-sans antialiased text-neutral-text bg-neutral-background min-h-[100dvh] flex flex-col">
      
      {/* Dynamic Toast Element */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white text-xs px-5 py-3 rounded-full shadow-lg border border-primary-container flex items-center gap-2 select-none font-semibold animate-bounce">
          <Sparkles className="w-4.5 h-4.5 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Interactive Yura Banner Fallback */}
      {yuraReminderBanner && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-[92%] sm:w-[420px] bg-white border border-[#D8CCFF] p-4 rounded-3xl shadow-xl flex items-start gap-4 animate-slide-in-top transition-all">
          <div className="relative flex-shrink-0 w-11 h-11 bg-[#5f52a6]/10 rounded-full flex items-center justify-center border border-[#5f52a6]/10">
            <img src="/logo.png?v=yura-new" alt="Yura" className="w-8 h-8 object-contain" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white flex items-center justify-center animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-black">!</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-[10px] font-black text-[#5f52a6] tracking-wider uppercase leading-none mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#5f52a6] animate-pulse" />
              {yuraReminderBanner.subtitle}
            </h4>
            <p className="text-sm font-extrabold text-[#2a2438] leading-tight break-words">
              {yuraReminderBanner.title}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setYuraReminderBanner(null)}
            className="flex-shrink-0 p-1.5 hover:bg-[#b2a4ff]/10 text-[#797582]/70 hover:text-[#5f52a6] rounded-full transition-all focus:outline-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Dynamic PWA Soft Banner */}
      {deferredPrompt && showInstallBanner && ["Home", "MyPromises", "History", "Profile"].includes(currentScreen) && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[105] w-[92%] sm:w-[420px] bg-gradient-to-r from-[#e5dffd] via-[#f2edff] to-[#faf8ff] border-2 border-[#5f52a6]/45 p-3.5 rounded-2xl shadow-[0_16px_40px_rgba(95,82,166,0.28)] flex items-center justify-between gap-3 animate-slide-in-top transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 bg-[#5f52a6]/20 rounded-xl flex items-center justify-center border-2 border-[#5f52a6]/35 shadow-sm">
              <img src="/icons/icon-192.png?v=6" alt="Promise Yura App Icon" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-black text-[#3c2f80] tracking-tight leading-none mb-1">Install Promise Yura</h4>
              <p className="text-[10.5px] text-[#332e3d] font-bold">Instant nudges & offline companion!</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={async () => {
                const promptEvent = deferredPrompt;
                if (!promptEvent) return;
                // Trigger the installer dialog prompt
                promptEvent.prompt();
                // Wait for the user option choice
                const { outcome } = await promptEvent.userChoice;
                console.log(`[PWA] Install prompt outcome: ${outcome}`);
                // Clear state
                setDeferredPrompt(null);
              }}
              className="text-[11px] font-black bg-[#5f52a6] hover:bg-[#4d4193] text-white px-3.5 py-1.5 rounded-full shadow-md shadow-[#5f52a6]/20 hover:scale-[1.03] transition-all duration-200 cursor-pointer focus:outline-none"
            >
              Install
            </button>
            <button
              onClick={() => {
                setShowInstallBanner(false);
                showToast("Install badge hidden.");
              }}
              className="p-1.5 hover:bg-[#5f52a6]/10 text-[#797582]/70 hover:text-primary rounded-full transition-all cursor-pointer focus:outline-none"
              aria-label="Close panel"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {(!startupSplashDone || !authResolved) && (
          <StartupSplashScreen />
        )}

        {startupSplashDone && authResolved && currentScreen === "Splash" && (
          <SplashScreen
            onGetStarted={() => {
              setCurrentScreen("Onboarding");
              setActiveOnboardingSlide(0);
            }}
          />
        )}

        {currentScreen === "Onboarding" && (
          <OnboardingScreen
            activeSlide={activeOnboardingSlide}
            onSetSlide={setActiveOnboardingSlide}
            onSkip={() => setCurrentScreen("Login")}
            onDone={() => setCurrentScreen("Login")}
          />
        )}

        {currentScreen === "Login" && (
          <LoginScreen
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authError={authError}
            setAuthError={setAuthError}
            onLoginSuccess={(user) => {
              setCurrentSession(user);
              setCurrentScreen("Permission");
              setAuthPassword("");
              setAuthError("");
            }}
            onGoToRegister={() => {
              setAuthError("");
              setAuthPassword("");
              setCurrentScreen("Register");
            }}
            onGoToForgotPassword={() => setCurrentScreen("ForgotPassword")}
            onGoogleSignIn={async () => {
               setAuthError("");
               try {
                 console.log("[Auth] Initiating Google Sign-In popup flow...");
                 const user = await authService.loginWithGoogle();
                 setCurrentSession(user);
                 setCurrentScreen("Permission");
                 setAuthPassword("");
                 setAuthError("");
               } catch (err: any) {
                 console.error("[Auth] Google Sign-In Error details:", err);
                 const errorMsg = String(err?.message || err?.code || err);
                 if (
                   errorMsg.includes("popup-closed-by-user") || 
                   errorMsg.includes("cancelled-popup-request") ||
                   errorMsg.includes("cancelled") ||
                   errorMsg.includes("cancel")
                 ) {
                   setAuthError("Google sign-in was cancelled. Please try again.");
                 } else if (errorMsg.includes("popup-blocked")) {
                   setAuthError("Google pop-up was blocked. Please enable pop-ups for this site or use email sign-in.");
                 } else if (errorMsg.includes("unauthorized-domain") || err?.code === "auth/unauthorized-domain") {
                   const hostname = typeof window !== "undefined" ? window.location.hostname : "your custom hostname";
                   setAuthError(`Domain unauthorized: Google Sign-In is blocked for "${hostname}". Please go to your Firebase Console -> Authentication -> Settings -> Authorized Domains and add "${hostname}" to allow sign-in.`);
                 } else {
                   setAuthError(`Google Auth Error: ${errorMsg}`);
                 }
               }
             }}
          />
        )}

        {currentScreen === "Register" && (
          <RegisterScreen
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authName={authName}
            setAuthName={setAuthName}
            authError={authError}
            setAuthError={setAuthError}
            onRegisterSuccess={(user) => {
              setCurrentSession(user);
              setCurrentScreen("Permission");
              setAuthPassword("");
              setAuthError("");
              setAuthName("");
            }}
            onGoToLogin={() => {
              setAuthError("");
              setAuthPassword("");
              setCurrentScreen("Login");
            }}
          />
        )}

        {currentScreen === "ForgotPassword" && (
          <ForgotPasswordScreen
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            showToast={showToast}
            onGoToLogin={() => {
              setAuthError("");
              setAuthPassword("");
              setCurrentScreen("Login");
            }}
          />
        )}

        {currentScreen === "Permission" && (
          <PermissionScreen
            onConfirm={() => {
              showToast("Permissions setup complete!");
              setCurrentScreen("Home");
            }}
          />
        )}

        {currentScreen === "Home" && (
          <HomeScreen
            onStartCatch={handleStartCatchProcedure}
            onTypeThought={handleTypeInstead}
            onChangeTab={(tab) => {
              if (tab === "home") setCurrentScreen("Home");
              else if (tab === "promises") setCurrentScreen("MyPromises");
              else if (tab === "history") setCurrentScreen("History");
              else if (tab === "profile") setCurrentScreen("Profile");
            }}
            showToast={showToast}
          />
        )}

        {currentScreen === "Listening" && (
          <ListeningScreen
            inputThought={inputThought}
            setInputThought={setInputThought}
            onCancel={() => setCurrentScreen("Home")}
            onDone={handleFinishListeningFlow}
            onTypeInstead={handleTypeInstead}
          />
        )}

        {currentScreen === "Processing" && (
          <ProcessingScreen
            inputThought={inputThought}
            processingState={processingState}
            onCancel={() => setCurrentScreen("Home")}
          />
        )}

        {currentScreen === "ReviewPromises" && (
          <ReviewPromisesScreen
            inputThought={inputThought}
            detectedDrafts={detectedDrafts}
            setDetectedDrafts={setDetectedDrafts}
            onEditPromise={loadEditPromiseForm}
            onAskFollowUp={() => {
              const missing = detectedDrafts.find(d => d.timeStr === "" || d.dateStr === "");
              if (missing) {
                loadEditPromiseForm(missing.id);
              } else if (detectedDrafts.length > 0) {
                loadEditPromiseForm(detectedDrafts[0].id);
              }
            }}
            onSaveAll={handleSaveAllCapturedPromises}
            onBack={() => setCurrentScreen("Home")}
          />
        )}

        {currentScreen === "SavedSuccess" && (
          <SavedSuccessScreen
            onContinue={() => {
              setCurrentScreen("MyPromises");
              showToast("Welcome to your promises vault!");
            }}
          />
        )}

        {currentScreen === "MyPromises" && (
          <MyPromisesScreen
            filteredPromises={filteredPromises}
            promiseFilter={promiseFilter}
            setPromiseFilter={setPromiseFilter}
            onEdit={loadEditPromiseForm}
            onAddDetails={(id) => {
              loadEditPromiseForm(id);
            }}
            onCheckIn={(id) => {
              setCurrentEditingId(id);
              setCurrentScreen("CheckIn");
            }}
            onEditDateTime={handleOpenEditDateTime}
            onChangeTab={(tab) => {
              if (tab === "add") handleStartCatchProcedure();
              else if (tab === "home") setCurrentScreen("Home");
              else if (tab === "history") setCurrentScreen("History");
              else if (tab === "profile") setCurrentScreen("Profile");
            }}
          />
        )}

        {currentScreen === "EditPromise" && (
          <EditPromiseScreen
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDate={editDate}
            setEditDate={setEditDate}
            editTime={editTime}
            setEditTime={setEditTime}
            editPriority={editPriority}
            setEditPriority={setEditPriority}
            editNotes={editNotes}
            setEditNotes={setEditNotes}
            editIntensity={editIntensity}
            setEditIntensity={setEditIntensity}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            onSave={saveEditPromiseForm}
            onDismiss={() => {
              const isDraft = detectedDrafts.some(d => d.id === currentEditingId);
              if (isDraft) {
                setDetectedDrafts(prev => prev.filter(d => d.id !== currentEditingId));
                setCurrentEditingId(null);
                showToast("Draft dismissed.");
                setCurrentScreen("ReviewPromises");
              } else {
                const exists = promises.some(p => p.id === currentEditingId);
                if (exists && currentEditingId) {
                  deletePromisesById(currentEditingId);
                } else {
                  setCurrentEditingId(null);
                  setCurrentScreen("Home");
                }
              }
            }}
            onBack={() => {
              const isDraft = detectedDrafts.some(d => d.id === currentEditingId);
              if (isDraft) {
                setCurrentScreen("ReviewPromises");
              } else {
                const exists = promises.some(p => p.id === currentEditingId);
                if (exists) {
                  setCurrentScreen("MyPromises");
                } else {
                  setCurrentEditingId(null);
                  setCurrentScreen("Home");
                }
              }
            }}
          />
        )}

        {currentScreen === "CheckIn" && (
          <CheckInScreen
            currentEditingId={currentEditingId}
            promises={promises}
            messageTone={preferences.messageTone}
            onConfirmDone={async () => {
              if (!currentEditingId) return;
              const item = promises.find(p => p.id === currentEditingId);
              if (item) {
                const updated: PromiseItem = { ...item, status: "done" };
                if (currentSession) {
                  const { uid } = currentSession;
                  try {
                    await setDoc(doc(db, "users", uid, "promises", currentEditingId), cleanFirestoreData(updated));
                  } catch (err) {
                    handleFirestoreError(err, OperationType.WRITE, `users/${uid}/promises/${currentEditingId}`);
                  }
                } else {
                  setPromises(prev => prev.map(p => p.id === currentEditingId ? { ...p, status: "done" } : p));
                  setHistoryList(prev => [
                    { ...item, status: "done", dateStr: "Completed Just now" },
                    ...prev
                  ]);
                }
                showToast(`Fantastic check-in! Streak up!`);
              }
              setCurrentEditingId(null);
              setCurrentScreen("SavedSuccess");
            }}
            onMarkMissed={async () => {
              if (!currentEditingId) return;
              const item = promises.find(p => p.id === currentEditingId);
              if (item) {
                const updated: PromiseItem = { ...item, status: "missed" };
                if (currentSession) {
                  const { uid } = currentSession;
                  try {
                    await setDoc(doc(db, "users", uid, "promises", currentEditingId), cleanFirestoreData(updated));
                  } catch (err) {
                    handleFirestoreError(err, OperationType.WRITE, `users/${uid}/promises/${currentEditingId}`);
                  }
                } else {
                  setPromises(prev => prev.map(p => p.id === currentEditingId ? { ...p, status: "missed" } : p));
                  setHistoryList(prev => [
                    { ...item, status: "missed", dateStr: "Missed" },
                    ...prev
                  ]);
                }
                showToast(`Marked as missed. Keep visual focus!`);
              }
              setCurrentEditingId(null);
              setCurrentScreen("MyPromises");
            }}
            onRemindLater={() => {
              showToast("Nudge delayed for 1 hour.");
              setCurrentScreen("MyPromises");
            }}
            onGoToReschedule={() => {
              setCurrentScreen("Reschedule");
            }}
            onBack={() => setCurrentScreen("MyPromises")}
          />
        )}

        {currentScreen === "Reschedule" && (
          <RescheduleScreen
            customTimeInput={customTimeInput}
            setCustomTimeInput={setCustomTimeInput}
            onInstantReschedule={async (dateStr, timeStr, status) => {
              if (currentEditingId) {
                const item = promises.find(p => p.id === currentEditingId);
                if (item) {
                  const itemPartial: Partial<PromiseItem> = {
                    title: item.title,
                    dateStr,
                    timeStr,
                    priority: item.priority,
                    intensity: item.intensity || "Normal",
                  };
                  const enriched = enrichPromiseTimes(itemPartial);

                  const updated: PromiseItem = { 
                    ...item, 
                    dateStr, 
                    timeStr, 
                    status,
                    dueAt: enriched.dueAt,
                    reminderAt: enriched.reminderAt
                  };
                  if (currentSession) {
                    const { uid } = currentSession;
                    try {
                      await setDoc(doc(db, "users", uid, "promises", currentEditingId), cleanFirestoreData(updated));
                    } catch (err) {
                      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/promises/${currentEditingId}`);
                    }
                  } else {
                    setPromises(prev => prev.map(p => p.id === currentEditingId ? updated : p));
                  }
                }
              }
              showToast(`Rescheduled to ${dateStr}!`);
              setCurrentScreen("MyPromises");
            }}
            onCustomReschedule={async () => {
              if (!customTimeInput) {
                showToast("Please select quick reschedule option or write slot.");
                return;
              }
              if (currentEditingId) {
                const item = promises.find(p => p.id === currentEditingId);
                if (item) {
                  const dateStr = "Today"; // Default custom quick reschedule to today's local context
                  const itemPartial: Partial<PromiseItem> = {
                    title: item.title,
                    dateStr,
                    timeStr: customTimeInput,
                    priority: item.priority,
                    intensity: item.intensity || "Normal",
                  };
                  const enriched = enrichPromiseTimes(itemPartial);

                  const updated: PromiseItem = { 
                    ...item, 
                    dateStr, 
                    timeStr: customTimeInput,
                    dueAt: enriched.dueAt,
                    reminderAt: enriched.reminderAt
                  };
                  if (currentSession) {
                    const { uid } = currentSession;
                    try {
                      await setDoc(doc(db, "users", uid, "promises", currentEditingId), cleanFirestoreData(updated));
                    } catch (err) {
                      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/promises/${currentEditingId}`);
                    }
                  } else {
                    setPromises(prev => prev.map(p => p.id === currentEditingId ? updated : p));
                  }
                }
              }
              showToast(`Rescheduled for ${customTimeInput}`);
              setCurrentScreen("MyPromises");
            }}
            onBack={() => setCurrentScreen("CheckIn")}
          />
        )}

        {currentScreen === "MissedPromise" && (
          <MissedPromiseScreen
            onCompleteLate={() => {
              showToast("Marked Done late. Keep active streak!");
              setCurrentScreen("MyPromises");
            }}
            onGoToReschedule={() => setCurrentScreen("Reschedule")}
            onDismiss={() => setCurrentScreen("MyPromises")}
          />
        )}

        {currentScreen === "History" && (
          <HistoryScreen
            historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter}
            filteredHistoryList={getFilteredHistoryList()}
            promises={promises}
            showToast={showToast}
            onStartCatch={handleStartCatchProcedure}
            onChangeTab={(tab) => {
              if (tab === "home") setCurrentScreen("Home");
              else if (tab === "promises") setCurrentScreen("MyPromises");
              else if (tab === "history") setCurrentScreen("History");
              else if (tab === "profile") setCurrentScreen("Profile");
            }}
          />
        )}

        {currentScreen === "Profile" && (
          <ProfileScreen
            displayName={currentSession?.displayName || "User"}
            email={currentSession?.email || "user@example.com"}
            avatarUrl={currentSession?.avatarUrl}
            promises={promises}
            onCustomizeYura={() => setCurrentScreen("CustomizeYura")}
            onPermissionsCheck={() => setCurrentScreen("Permission")}
            onUpdateName={() => setIsUpdateNameModalOpen(true)}
            onDeleteAccountClick={() => setIsDeleteAccountModalOpen(true)}
            onLogout={() => {
              setIsLogoutModalOpen(true);
            }}
            onStartCatch={handleStartCatchProcedure}
            onChangeTab={(tab) => {
              if (tab === "home") setCurrentScreen("Home");
              else if (tab === "promises") setCurrentScreen("MyPromises");
              else if (tab === "history") setCurrentScreen("History");
              else if (tab === "profile") setCurrentScreen("Profile");
            }}
            showToast={showToast}
          />
        )}

        {currentScreen === "CustomizeYura" && (
          <CustomizeYuraScreen
            preferences={preferences}
            setPreferences={setPreferences}
            showToast={showToast}
            onApply={() => setCurrentScreen("Profile")}
            onBack={() => setCurrentScreen("Profile")}
          />
        )}
      </AnimatePresence>

      <TypeThoughtModal
        isOpen={isTypeThoughtModalOpen}
        onClose={() => setIsTypeThoughtModalOpen(false)}
        onSubmit={(thought) => {
          setIsTypeThoughtModalOpen(false);
          setInputThought(thought);
          handleFinishListeningFlow(thought);
        }}
        defaultValue={typedThoughtDraft}
      />

      <EditDateTimeModal
        isOpen={isEditDateTimeModalOpen}
        onClose={handleCloseEditDateTime}
        onSave={handleSaveEditDateTime}
        promiseTitle={promises.find(p => p.id === editDateTimePromiseId)?.title || ""}
        initialDueAt={promises.find(p => p.id === editDateTimePromiseId)?.dueAt}
      />

      <UpdateNameModal
        isOpen={isUpdateNameModalOpen}
        onClose={() => setIsUpdateNameModalOpen(false)}
        onSave={handleSaveProfileName}
        currentName={currentSession?.displayName || ""}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirmDelete={handleConfirmDeleteAccount}
      />

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleExitApp}
      />
    </div>
  );
}
