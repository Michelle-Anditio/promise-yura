import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { YuraMascot } from "../brand/YuraMascot";

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#3a354d]/45 backdrop-blur-md"
            id="exit-modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-neutral-creamDark/60 rounded-3xl shadow-[0_24px_50px_-12px_rgba(58,53,77,0.22)]"
            id="exit-modal-container"
          >
            {/* Elegant top color band */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ffd9e5] via-primary to-secondary" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header Title */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <YuraMascot mood="love" size="xs" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-on-surface tracking-tight" id="exit-modal-title">
                      Exit Promise Yura?
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Yura will keep your promises safe until you return.
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

              {/* Informative visual mascot */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <YuraMascot mood="normal" size="md" className="yura-float -mt-1" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  className="text-xs font-extrabold hover:bg-neutral-creamLight border-0 h-11 px-5"
                >
                  Stay
                </Button>
                <Button
                  type="button"
                  onClick={onConfirm}
                  variant="primary"
                  size="md"
                  className="text-xs font-black shadow-md shadow-primary/10 px-6 h-11 bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-1.5 min-w-[100px]"
                >
                  Exit
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
