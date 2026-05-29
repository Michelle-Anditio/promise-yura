import React from "react";
import { motion } from "motion/react";
import { Mic, Lightbulb, Bell, Sparkles, Calendar, Clock, ChevronRight, Sliders, Shield, User, HelpCircle, LogOut, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Chip } from "../components/ui/Chip";
import { Toggle } from "../components/ui/Toggle";
import { ScreenLayout } from "../components/layout/ScreenLayout";
import { YuraMascot } from "../components/brand/YuraMascot";
import { YuraBubble } from "../components/promise/YuraBubble";
import { StatCard } from "../components/promise/StatCard";
import { PromiseItem, UserPreferences } from "../types";

// ============================================================================
// 1. HOME SCREEN
// ============================================================================
interface HomeScreenProps {
  onStartCatch: () => void;
  onTypeThought: () => void;
  onChangeTab: (tab: string) => void;
  showToast: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartCatch,
  onTypeThought,
  onChangeTab,
  showToast,
}) => {
  return (
    <motion.div
      key="Home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout
        headerProps={{
          title: "Promise Yura",
        }}
        bottomNavProps={{
          activeTab: "home",
          onChangeTab: (tab) => {
            if (tab === "add") onStartCatch();
            else if (tab === "promises") onChangeTab("promises");
            else if (tab === "history") onChangeTab("history");
            else if (tab === "profile") onChangeTab("profile");
          },
        }}
      >
        <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-210px)] max-w-md mx-auto">
          <div className="text-center space-y-2 select-none">
            <h1 className="text-3xl font-extrabold text-primary">No promises yet</h1>
            <p className="text-[#484551] font-semibold text-sm">Tell Yura what’s on your mind.</p>
          </div>

          {/* Central Focus Zone Mascot illustration */}
          <div className="w-full py-2">
            <Card className="glass-card rounded-3xl p-6 text-center shadow-[0_20px_40px_rgba(95,82,166,0.08)] flex flex-col items-center border border-white/40">
              <YuraMascot mood="question" size="lg" className="mb-4" />
              <h2 className="text-sm font-extrabold text-[#1b1c17] mb-1">
                Your promise list is empty.
              </h2>
              <p className="text-xs font-medium leading-relaxed text-[#797582] max-w-[280px] text-center select-none px-2">
                Tap the mic and say anything messy
                <span className="block text-[#5f52a6] font-extrabold mt-1">
                  Yura will organize it.
                </span>
              </p>
            </Card>
          </div>

          {/* Light prompt suggestions helper chip */}
          <div className="w-full bg-white rounded-2xl p-4 flex items-start gap-3 border border-[#D8CCFF] soft-shadow select-none">
            <Lightbulb className="text-[#356477] w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">
              Try stating: <span className="text-on-surface font-semibold">"Remind me to pay rent tomorrow and message my lecturer later"</span>
            </p>
          </div>

          {/* Trigger Buttons */}
          <div className="w-full space-y-3.5 pt-4">
            <Button
              onClick={onStartCatch}
              variant="primary"
              className="w-full text-base py-5 h-16 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 font-bold"
              leftIcon={<Mic className="text-white w-5 h-5 font-bold" />}
            >
              Catch a promise
            </Button>
            
            <div className="text-center select-none space-y-1">
              <button
                onClick={onTypeThought}
                className="text-sm font-bold text-primary py-2 px-4 hover:bg-primary-fixed/30 rounded-full transition-colors select-none cursor-pointer"
              >
                Type instead
              </button>
            </div>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// helper function and types for dynamic stats
// ============================================================================
const getCompletionDate = (p: PromiseItem): string | null => {
  if (p.status !== "done") return null;
  const dateToUse = p.updatedAt || p.createdAt || p.dueAt;
  if (dateToUse) {
    try {
      const d = new Date(dateToUse);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch {
      // safe fallback
    }
  }
  if (p.dateStr) {
    const cleanD = p.dateStr.trim();
    const matchYMD = cleanD.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
    if (matchYMD) {
      const y = matchYMD[1];
      const m = matchYMD[2].padStart(2, "0");
      const d = matchYMD[3].padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  return null;
};

export const calculatePromiseStats = (promises: PromiseItem[]) => {
  const kept = promises.filter((p) => p.status === "done").length;
  
  const missed = promises.filter((p) => {
    if (p.status === "missed") return true;
    if (p.status !== "done" && p.status !== "needs detail" && p.dueAt) {
      return new Date(p.dueAt).getTime() < Date.now();
    }
    return false;
  }).length;

  const completedDates = new Set<string>();
  promises.forEach((p) => {
    const dStr = getCompletionDate(p);
    if (dStr) {
      completedDates.add(dStr);
    }
  });

  let streak = 0;
  if (completedDates.size > 0) {
    const sortedDates = Array.from(completedDates).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const newestDateStr = sortedDates[0];
    if (newestDateStr === todayStr || newestDateStr === yesterdayStr) {
      let currentRefDate = new Date(newestDateStr);
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const nextDateStr = sortedDates[i];
        const nextDate = new Date(nextDateStr);
        const diffTime = currentRefDate.getTime() - nextDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          currentRefDate = nextDate;
        } else if (diffDays === 0) {
          continue;
        } else {
          break;
        }
      }
    }
  }

  const totalClosed = kept + missed;
  const completionRate = totalClosed > 0 ? Math.round((kept / totalClosed) * 100) : 0;

  return { kept, missed, streak, completionRate };
};

// ============================================================================
// 2. HISTORY SCREEN
// ============================================================================
interface HistoryScreenProps {
  historyFilter: "All" | "Kept" | "Missed" | "This week";
  setHistoryFilter: (filter: "All" | "Kept" | "Missed" | "This week") => void;
  filteredHistoryList: PromiseItem[];
  promises: PromiseItem[];
  showToast: (msg: string) => void;
  onStartCatch: () => void;
  onChangeTab: (tab: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyFilter,
  setHistoryFilter,
  filteredHistoryList,
  promises,
  showToast,
  onStartCatch,
  onChangeTab,
}) => {
  const { kept, missed, streak, completionRate } = calculatePromiseStats(promises);

  return (
    <motion.div
      key="History"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout
        headerProps={{
          title: "Promise History",
        }}
        bottomNavProps={{
          activeTab: "history",
          onChangeTab: (tab) => {
            if (tab === "add") onStartCatch();
            else if (tab === "home") onChangeTab("home");
            else if (tab === "promises") onChangeTab("promises");
            else if (tab === "profile") onChangeTab("profile");
          },
        }}
      >
        <div className="space-y-5 max-w-md mx-auto pb-10">
          <div className="space-y-1 mt-1 select-none">
            <h2 className="text-2xl font-black text-on-surface">Promise History</h2>
            <p className="text-xs text-on-surface-variant">See what you kept with Yura.</p>
          </div>

          {/* Bento Style Bento Grid statistics panel */}
          <div className="grid grid-cols-2 gap-3 pb-2 select-none animate-none">
            <div className="col-span-2">
              <StatCard title="Promises kept" value={kept} icon="stars" variant="primary" description={`Follow-through rate: ${completionRate}%`} />
            </div>
            <StatCard title="Check-in streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} icon="calendar_today" variant="tertiary" />
            <StatCard title="Missed goals" value={missed} icon="event_busy" variant="secondary" />
          </div>

          {/* Filter chip list */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
            {(["All", "Kept", "Missed", "This week"] as const).map((filter) => (
              <Chip
                key={filter}
                label={filter}
                active={historyFilter === filter}
                onClick={() => setHistoryFilter(filter)}
              />
            ))}
          </div>

          {/* History Lists */}
          {filteredHistoryList.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white border border-[#D8CCFF] rounded-3xl space-y-4">
              <YuraMascot mood="sad" size="md" className="mx-auto" />
              <h3 className="text-lg font-extrabold text-[#1b1c17]" id="history-empty-title">History feels pristine</h3>
              <p className="text-xs text-[#797582] max-w-[260px] mx-auto leading-relaxed" id="history-empty-desc">
                No archived or completed promises match your selection. Start small, Yura is here to back you up!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 pt-2 select-none animate-none">
              {filteredHistoryList.map((hist) => (
                <div
                  key={hist.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-[#D8CCFF] flex items-center justify-between transition-all active:scale-[0.99]"
                >
                  <div className="space-y-1 text-left">
                    <p className="text-sm font-bold text-on-surface">{hist.title}</p>
                    <p className="text-[11px] font-semibold text-outline tracking-wider">{hist.dateStr || "Recently"}</p>
                  </div>

                  {hist.status === "done" ? (
                    <div className="bg-[#88b7cc]/20 text-[#14495a] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-xs select-none">
                      <CheckCircle2 className="w-4 h-4 text-[#14495a]" />
                      <span>Kept</span>
                    </div>
                  ) : (
                    <div className="bg-rose-100 text-[#ba1a1a] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold text-xs select-none">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white leading-none text-[10px] flex items-center justify-center font-black">X</span>
                      <span>Missed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Encouragement bottom card layout */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#e5deff] to-[#ffd9e5] p-6 rounded-2xl shadow-md border border-white/40 flex flex-col items-center text-center space-y-3 pt-6 select-none mt-6 animate-none">
            <YuraMascot mood="love" size="sm" />
            <p className="text-base font-bold text-primary max-w-[220px]">
              Progress counts, even when it’s messy.
            </p>
            <div className="w-full h-2.5 bg-white/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(95,82,166,0.3)] transition-all duration-500" 
                style={{ width: `${completionRate}%` }} 
              />
            </div>
            <p className="text-[10px] font-bold text-primary/70 uppercase">{completionRate}% Overall Completion</p>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 3. PROFILE SCREEN
// ============================================================================
interface ProfileScreenProps {
  displayName: string;
  email: string;
  avatarUrl?: string;
  promises: PromiseItem[];
  onCustomizeYura: () => void;
  onPermissionsCheck: () => void;
  onUpdateName: () => void;
  onDeleteAccountClick: () => void;
  onLogout: () => void;
  onStartCatch: () => void;
  onChangeTab: (tab: string) => void;
  showToast: (msg: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  displayName,
  email,
  avatarUrl,
  promises,
  onCustomizeYura,
  onPermissionsCheck,
  onUpdateName,
  onDeleteAccountClick,
  onLogout,
  onStartCatch,
  onChangeTab,
  showToast,
}) => {
  const { kept, streak } = calculatePromiseStats(promises);

  return (
    <motion.div
      key="Profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout
        headerProps={{
          title: "Profile",
        }}
        bottomNavProps={{
          activeTab: "profile",
          onChangeTab: (tab) => {
            if (tab === "add") onStartCatch();
            else if (tab === "home") onChangeTab("home");
            else if (tab === "promises") onChangeTab("promises");
            else if (tab === "history") onChangeTab("history");
          },
        }}
      >
        <div className="space-y-6 max-w-sm mx-auto pb-10">
          {/* Profile header visual badge container layout info */}
          <Card className="glass-card rounded-[32px] p-6 text-center shadow-lg flex flex-col items-center border border-white/50 select-none">
            <div className="w-20 h-20 rounded-full bg-primary-fixed/30 p-1 border-2 border-primary-fixed shadow-sm flex items-center justify-center">
              {avatarUrl ? (
                <img
                  alt="Promise Keeper avatar"
                  className="w-full h-full object-cover rounded-full"
                  src={avatarUrl}
                  referrerPolicy="no-referrer"
                />
              ) : (() => {
                const getInitial = () => {
                  if (displayName && displayName.trim().length > 0) {
                    return displayName.trim().charAt(0).toUpperCase();
                  }
                  if (email && email.trim().length > 0) {
                    return email.trim().charAt(0).toUpperCase();
                  }
                  return "Y";
                };
                const initial = getInitial();
                const getAvatarStyles = (letter: string) => {
                  const code = letter.charCodeAt(0);
                  const index = code % 3;
                  if (index === 0) {
                    return {
                      bg: "bg-primary-fixed",
                      text: "text-on-primary-fixed"
                    };
                  } else if (index === 1) {
                    return {
                      bg: "bg-secondary-fixed",
                      text: "text-on-secondary-fixed"
                    };
                  } else {
                    return {
                      bg: "bg-tertiary-fixed",
                      text: "text-on-tertiary-fixed"
                    };
                  }
                };
                const styles = getAvatarStyles(initial);
                return (
                  <div className={`w-full h-full rounded-full flex items-center justify-center font-display text-3xl font-black shadow-inner ${styles.bg} ${styles.text}`}>
                    {initial}
                  </div>
                );
              })()}
            </div>
            <h3 className="text-xl font-bold mt-3 text-primary">{displayName}</h3>
            <p className="text-xs text-[#797582]">{email}</p>
            
            <div className="grid grid-cols-2 gap-3 w-full mt-4 border-t border-[#D8CCFF]/35 pt-4">
              <div className="bg-primary-fixed/30 rounded-xl p-2 animate-none">
                <span className="block text-lg font-black text-primary" id="profile-kept-count">{kept}</span>
                <span className="text-[10px] text-on-surface-variant font-extrabold uppercase">Promises Kept</span>
              </div>
              <div className="bg-secondary-fixed/50 rounded-xl p-2 animate-none">
                <span className="block text-lg font-black text-secondary" id="profile-streak-count">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
                <span className="text-[10px] text-on-surface-variant font-extrabold uppercase">Streak Count</span>
              </div>
            </div>
          </Card>

          {/* Settings list header */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-widest text-[#797582] px-2 select-none">General Settings</h4>
            
            <div className="bg-white rounded-2xl border border-[#D8CCFF] shadow-sm overflow-hidden flex flex-col text-sm divide-y divide-[#D8CCFF]/40 animate-none">
              <button
                onClick={onCustomizeYura}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-[#b2a4ff]/8 active:bg-[#b2a4ff]/15 transition-colors select-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Sliders className="text-primary w-5 h-5" />
                  <span className="font-bold">Customize Yura Reminders</span>
                </div>
                <ChevronRight className="text-[#797582] w-4 h-4" />
              </button>

              <button
                onClick={onPermissionsCheck}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-[#b2a4ff]/8 active:bg-[#b2a4ff]/15 transition-colors select-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Shield className="text-tertiary w-5 h-5" />
                  <span className="font-bold">System Permissions Check</span>
                </div>
                <ChevronRight className="text-[#797582] w-4 h-4" />
              </button>

              <button
                onClick={onUpdateName}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-[#b2a4ff]/8 active:bg-[#b2a4ff]/15 transition-colors select-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <User className="text-[#797582] w-5 h-5" />
                  <span className="font-bold">Update Profile Name</span>
                </div>
                <ChevronRight className="text-[#797582] w-4 h-4" />
              </button>

              <button
                onClick={onDeleteAccountClick}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-rose-50/50 active:bg-rose-100/50 transition-colors select-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="text-[#ba1a1a] w-5 h-5" />
                  <span className="font-bold text-[#ba1a1a]">Delete Account</span>
                </div>
                <ChevronRight className="text-rose-700 w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-6 animate-none">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full h-14 font-extrabold border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};

// ============================================================================
// 4. CUSTOMIZE YURA SCREEN
// ============================================================================
interface CustomizeYuraScreenProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  showToast: (msg: string) => void;
  onApply: () => void;
  onBack: () => void;
}

export const CustomizeYuraScreen: React.FC<CustomizeYuraScreenProps> = ({
  preferences,
  setPreferences,
  showToast,
  onApply,
  onBack,
}) => {
  return (
    <motion.div
      key="CustomizeYura"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ScreenLayout headerProps={{ title: "Yura Customization", onBack: onBack }}>
        <div className="space-y-6 max-w-sm mx-auto pb-10">
          <p className="text-sm text-on-surface-variant leading-relaxed">Customize message tone, voice triggers, and notifications styles.</p>

          {/* Reminder intensity block choice toggle */}
          <div className="space-y-3 select-none">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-primary px-2">Yura Message Tone</h4>
            <div className="grid grid-cols-3 gap-2">
              {(["Sweet", "Direct", "Playful"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => {
                    setPreferences((prev) => ({ ...prev, messageTone: tone }));
                    showToast(`Tone updated to ${tone}!`);
                  }}
                  className={`py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    preferences.messageTone === tone
                      ? "bg-primary-container text-on-primary-container border-primary shadow-sm"
                      : "bg-white text-[#797582] border-[#D8CCFF] hover:bg-[#b2a4ff]/8"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Toggles */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-primary px-2 select-none">Voice Capture Setup</h4>
            <Toggle
              label="Voice Input Enabled"
              description="Dictation processing active during micro captures."
              checked={preferences.voiceInputEnabled}
              onChange={(val) => {
                setPreferences((prev) => ({ ...prev, voiceInputEnabled: val }));
                showToast(`Voice input set: ${val ? "ON" : "OFF"}`);
              }}
            />
          </div>

          {/* Notifications setup Style choosing */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-primary px-2 select-none">Nudge Notification Style</h4>
            
            <div className="flex flex-col gap-2">
              {(["Soft nudge", "Repeated nudge", "Check-in required"] as const).map((opt) => (
                <label
                  key={opt}
                  onClick={() => {
                    setPreferences((prev) => ({ ...prev, notificationStyle: opt }));
                    showToast(`Notification standard: ${opt}`);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition-all ${
                    preferences.notificationStyle === opt
                      ? "bg-white border-primary shadow-sm"
                      : "bg-white/60 border-[#D8CCFF]/60"
                  }`}
                >
                  <span className="text-xs font-bold text-on-surface-variant">{opt}</span>
                  <input
                    type="radio"
                    name="notifStyleOptions"
                    checked={preferences.notificationStyle === opt}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary focus:ring-primary focus:ring-opacity-20 bg-background pointer-events-none"
                  />
                </label>
              ))}
            </div>
            
            {/* Friendly Sound Limitation Message */}
            <div className="p-3 border border-[#D8CCFF] rounded-xl bg-white soft-shadow text-left mt-2">
              <p className="text-[10px] text-[#797582] font-medium leading-relaxed flex items-start gap-1.5 select-none">
                <span className="text-xs">🔊</span>
                <span>
                  <strong>Note on Sounds:</strong> Sound depends on your phone/browser notification settings. Standard alert sounds are managed natively by the OS platform.
                </span>
              </p>
            </div>
          </div>

          {/* Cute sleeping sleeping widget decorative element */}
          <div className="flex flex-col items-center justify-center pt-8 select-none opacity-90 animate-none">
            <YuraMascot mood="sleeping" size="md" />
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#797582] mt-2 text-center">Yura is resting peacefully</p>
          </div>

          {/* Debug/Test Yura Mascot Mood Sandbox Grid (development preview verify) */}
          {!!(import.meta as any).env?.DEV && (
            <div className="border border-primary/20 rounded-2xl p-4 bg-primary/5 space-y-3">
              <h5 className="text-xs font-black text-primary uppercase tracking-wider text-center">
                🛠️ YURA MASCOT MOOD SANDBOX
              </h5>
              <p className="text-[10px] text-center font-semibold text-on-surface-variant leading-relaxed">
                Development Preview verify: verifying all uploaded mascot expression assets load.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {(["normal", "sleeping", "question", "listening", "concern", "processing", "wink", "celebrating", "supportive", "love", "sad"] as const).map((m) => (
                  <div key={m} className="p-2 border border-primary-container/30 bg-white rounded-xl flex flex-col items-center justify-center text-center">
                    <YuraMascot mood={m} size="xs" className="mb-1" />
                    <span className="text-[9px] font-extrabold text-[#797582] truncate w-full">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 animate-none font-semibold text-sm">
            <Button onClick={onApply} variant="primary" className="w-full h-15 bg-primary">
              Apply Preferences
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </motion.div>
  );
};
