/**
 * Promise Yura Notification Helper
 * 
 * DESIGN PHILOSOPHY & LIMITATIONS:
 * 1. Open-App Reminders: Local client-side scheduling handles notifications 
 *    when the app is open in a browser tab.
 * 2. Closed-App/Background Reminders: True closed-app push notifications (e.g. when 
 *    the browser/device is asleep) require a Firebase Cloud Messaging (FCM) or Web Push 
 *    backend service coupled with subscription management.
 */

let swRegistration: ServiceWorkerRegistration | null = null;


/**
 * Registers the Promise Yura service worker for mobile-ready notifications.
 */
export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("[NotificationHelper] Service worker is not supported in this environment.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("[NotificationHelper] Service Worker registered successfully:", registration);
    
    // Always call update to get the latest version
    await registration.update();
    
    swRegistration = registration;
    return registration;
  } catch (error) {
    console.error("[NotificationHelper] Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Returns the active Service Worker registration if already initialized.
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    if (reg) {
      swRegistration = reg;
    }
    return reg;
  } catch {
    return null;
  }
}

interface YuraNotificationOptions {
  body?: string;
  tag?: string;
  data?: any;
}

/**
 * Shows a system notification safely on both Mobile and Desktop browsers.
 * - Resolves the "Illegal constructor" exception on mobile browsers by preferring SW Registration.
 * - Falls back cleanly to standard desktop constructors.
 */
export async function showYuraNotification(title: string, options: YuraNotificationOptions = {}): Promise<boolean> {
  const finalOptions: any = {
    body: options.body || "",
    icon: "/icons/notification-yura.png?v=6",
    badge: "/icons/notification-yura.png?v=6",
    tag: options.tag || "yura-general",
    data: options.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  console.log(`[NotificationHelper] Dispatching notification "${title}" with options:`, finalOptions);

  // 1. Double check permission status
  if (typeof Notification === "undefined") {
    console.warn("[NotificationHelper] Notification API is fully unsupported.");
    return false;
  }

  console.log("[NotificationHelper] Current browser notification permission state:", Notification.permission);
  if (Notification.permission !== "granted") {
    console.warn(`[NotificationHelper] Notification permission is "${Notification.permission}", skipped.`);
    return false;
  }

  // 2. Try standard new Notification first (works beautifully on desktop and preserves the synchronous user-gesture)
  try {
    console.log("[NotificationHelper] Creating new Notification synchronously to preserve user gesture...");
    const notif = new Notification(title, finalOptions);
    console.log("[NotificationHelper] Synced Notification constructor succeeded:", notif);
    
    // Play open-app chime sound since notification succeeded
    playYuraChime();
    return true;
  } catch (err: any) {
    console.warn("[NotificationHelper] Standard Notification constructor failed or was illegal (common on mobile):", err);
    
    // 3. Fallback to Service Worker showNotification (crucial on Mobile/Android Chrome)
    try {
      console.log("[NotificationHelper] Retrieving ServiceWorker registration for mobile fallback...");
      const reg = await getServiceWorkerRegistration();
      if (reg && "showNotification" in reg) {
        console.log("[NotificationHelper] Trying ServiceWorker showNotification fallback...");
        await reg.showNotification(title, finalOptions);
        console.log("[NotificationHelper] Sw ShowNotification completed successfully.");
        
        // Play open-app chime sound
        playYuraChime();
        return true;
      } else {
        console.warn("[NotificationHelper] ServiceWorker showNotification fallback is unavailable (no registration or not supported).");
      }
    } catch (swError) {
      console.error("[NotificationHelper] ServiceWorker showNotification failed:", swError);
    }
  }

  return false;
}

/**
 * Synthesizes a lovely double-tone gentle chime using native Web Audio API in-browser.
 * Respects browser autoplay permissions and fails gracefully without loading external files.
 */
export function playYuraChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Double-tone soft chime: E5 -> A5
    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Note 2: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, now + 0.12);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.65);

    console.log("[NotificationHelper] Synthesized chime dispatched successfully.");
  } catch (err) {
    console.log("[NotificationHelper] Synthesized chime blocked or failed to play:", err);
  }
}

