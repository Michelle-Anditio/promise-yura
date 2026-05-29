import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, AlertCircle, Mic } from "lucide-react";
import { Button } from "../ui/Button";

interface MicrophoneHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getMicInstructions = () => {
  if (typeof navigator === "undefined") {
    return {
      browser: "Other Browsers",
      steps: [
        "Tap the settings/lock icon next to the address bar.",
        "Find Microphone under Permissions.",
        "Change it from 'Block' to 'Allow'.",
        "Return to Promise Yura and try again."
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
      steps: [
        "Tap the site settings/lock icon left of the address bar at the top.",
        "Tap 'Permissions' or 'Site settings'.",
        "Find Microphone and set it to 'Allowed'.",
        "Return to Promise Yura and try again."
      ]
    };
  } else if (isChrome) {
    return {
      browser: "Chrome Desktop",
      steps: [
        "Click the layout settings (or lock 🔒 icon) on the left side of the URL field.",
        "Find 'Microphone' and change the option to 'Allow'.",
        "Return to Promise Yura and try again."
      ]
    };
  } else if (isIOS || isSafari) {
    return {
      browser: "Safari / iOS Devices",
      steps: [
        "Tap the 'aA' icon or lock icon next to the search address bar.",
        "Tap 'Website Settings'.",
        "Locate 'Microphone' and change it to 'Allow'.",
        "Return to Promise Yura and try again."
      ]
    };
  } else {
    return {
      browser: "Your Web Browser",
      steps: [
        "Tap the settings or lock icon next to the address bar.",
        "Look for 'Site Settings' or 'Permissions'.",
        "Change 'Microphone' to 'Allow'.",
        "Return to Promise Yura and try again."
      ]
    };
  }
};

export const MicrophoneHelpModal: React.FC<MicrophoneHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { browser, steps } = getMicInstructions();

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
            id="mic-help-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-neutral-creamMedium rounded-3xl shadow-[0_24px_50px_-12px_rgba(50,40,90,0.12)]"
            id="mic-help-modal-container"
          >
            {/* Soft Purple Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

            <div className="p-6 pt-7 space-y-5 text-left">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-creamLight flex items-center justify-center text-primary flex-shrink-0">
                    <Mic className="w-5 h-5 font-black" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-on-surface tracking-tight" id="mic-help-title">
                      How to Enable Mic
                    </h3>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      Simple guide for <span className="text-primary font-bold">{browser}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-neutral-creamLight text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer select-none"
                  aria-label="Close modal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Informative Step-by-Step UI */}
              <div className="space-y-4">
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900 font-medium">
                  <AlertCircle className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Yura can’t hear you because the microphone is blocked by your browser settings. Follow these quick steps to fix it.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#413d52] pl-1">
                    Instruction Steps:
                  </p>

                  <div className="space-y-2">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-xs font-semibold text-on-surface-variant bg-neutral-creamLight/30 hover:bg-neutral-creamLight/50 p-3 rounded-2xl border border-neutral-creamDark/10 transition-colors">
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
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  size="md"
                  onClick={onClose}
                  className="w-full text-xs font-black bg-primary text-white hover:bg-primary-hover shadow-sm"
                >
                  Got It, Thanks!
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
