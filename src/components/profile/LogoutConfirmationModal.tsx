import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, LogOut, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { YuraMascot } from "../brand/YuraMascot";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error("[LogoutCallback] Failed to sign out:", err);
      setErrorMsg(err?.message || "Something went wrong while signing out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="absolute inset-0 bg-[#3a354d]/45 backdrop-blur-md"
            id="logout-modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-neutral-creamDark/60 rounded-3xl shadow-[0_24px_50px_-12px_rgba(58,53,77,0.22)]"
            id="logout-modal-container"
          >
            {/* Elegant top color band */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ffd9e5] via-primary to-secondary" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header Title */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <YuraMascot mood="sleeping" size="xs" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-on-surface tracking-tight" id="logout-modal-title">
                      Sign Out?
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Your promises will be waiting when you return.
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-neutral-creamLight text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer select-none"
                    aria-label="Close modal"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              {/* Error warning notification state */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 text-xs font-bold text-error px-1 bg-rose-50 border border-rose-100 p-2.5 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                    <p className="text-[11px] leading-snug">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-xs font-extrabold hover:bg-[#b2a4ff]/8 border-0 h-11 px-5"
                >
                  Stay
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="text-xs font-black shadow-md shadow-primary/10 px-6 h-11 bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 text-white border-[#ba1a1a] flex items-center justify-center gap-1.5 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
