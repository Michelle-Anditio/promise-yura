import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, CheckCircle2, RotateCw, Chrome, Settings2, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface NotificationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const getBrowserInstructions = () => {
  if (typeof navigator === "undefined") {
    return {
      browser: "Other Browsers",
      isChromeDesktop: false,
      isChromeAndroid: false,
      isSafariIOS: false,
      steps: [
        "Tap the settings/lock icon next to the address bar.",
        "Find Notifications and change it from 'Block' to 'Allow'.",
        "Refresh Promise Yura."
      ]
    };
  }

  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua) && !/OPR|Opera/i.test(ua) && !/CriOS/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAndroid && isChrome) {
    return {
      browser: "Chrome Android",
      isChromeDesktop: false,
      isChromeAndroid: true,
      isSafariIOS: false,
      steps: [
        "Tap the three dots (Menu icon) in the top-right corner of Chrome.",
        "Tap the info ⓘ button at the top, or go to Settings > Site settings.",
        "Tap Notifications and switch them from Blocked to Allowed.",
        "Refresh Promise Yura to apply changes."
      ]
    };
  } else if (isChrome) {
    return {
      browser: "Chrome Desktop",
      isChromeDesktop: true,
      isChromeAndroid: false,
      isSafariIOS: false,
      steps: [
        "Click the site settings/sliders icon (or lock 🔒 icon) immediately to the left of the address bar at the top.",
        "Locate Notifications and change the selection from 'Block' to 'Allow'.",
        "If you don't see it, click 'Site settings' to access all permissions, then toggle Notifications to 'Allow'.",
        "Refresh Promise Yura to apply changes."
      ]
    };
  } else if (isIOS || isSafari) {
    return {
      browser: "Safari / iOS Devices",
      isChromeDesktop: false,
      isChromeAndroid: false,
      isSafariIOS: true,
      steps: [
        "Open your device's primary Settings app (grey gears icon).",
        "Scroll down to 'Notifications', find the browser or added shortcut, and toggle 'Allow Notifications' on.",
        "For Safari: Tap the (aA) or lock icon in the address bar, check 'Website Settings', and verify Notifications permission.",
        "Refresh Promise Yura to activate nudges."
      ]
    };
  } else {
    return {
      browser: "Your Web Browser",
      isChromeDesktop: false,
      isChromeAndroid: false,
      isSafariIOS: false,
      steps: [
        "Click the lock/settings icon located to the left of the URL address bar.",
        "Look for 'Notifications' or 'Permissions'.",
        "Change the permission from 'Block' to 'Allow'.",
        "Refresh Promise Yura to apply changes."
      ]
    };
  }
};

export const NotificationHelpModal: React.FC<NotificationHelpModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { browser, isChromeDesktop, isChromeAndroid, isSafariIOS, steps } = getBrowserInstructions();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#3a354d]/45 backdrop-blur-md"
            id="notif-help-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-[#D8CCFF] rounded-3xl shadow-[0_24px_50px_-12px_rgba(50,40,90,0.12)]"
            id="notif-help-modal-container"
          >
            {/* Playful Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#b2a4ff]/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <HelpCircle className="w-5 h-5 font-black" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-black text-on-surface tracking-tight" id="notif-help-title">
                      How to Unblock Alerts
                    </h3>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      Simple guide for <span className="text-primary font-bold">{browser}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-[#b2a4ff]/8 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer select-none"
                  aria-label="Close modal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Informative Step-by-Step UI */}
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Yura can’t ask again because the browser blocked notifications. You can turn them back on from site settings.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#413d52] text-left pl-1">
                    Follow these simple steps:
                  </p>

                  <div className="space-y-2">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-left text-xs font-semibold text-on-surface-variant bg-primary-container/5 hover:bg-primary-container/10 p-3 rounded-2xl border border-[#D8CCFF] transition-colors">
                        <span className="w-5 h-5 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed select-text">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="button"
                  size="md"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-xs font-bold border-[#D8CCFF]"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="md"
                  onClick={() => {
                    onRefresh();
                  }}
                  className="flex-1 text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-sm flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
