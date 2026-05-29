import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface UpdateNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => Promise<void>;
  currentName: string;
}

export const UpdateNameModal: React.FC<UpdateNameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
}) => {
  const [nameInput, setNameInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNameInput(currentName);
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a valid display name.");
      return;
    }
    if (trimmed.length > 30) {
      setErrorMsg("Name must be 30 characters or less.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await onSave(trimmed);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to update profile name. Please try again.");
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
            onClick={onClose}
            className="absolute inset-0 bg-[#3a354d]/45 backdrop-blur-md"
            id="update-name-modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-neutral-creamDark/60 rounded-3xl shadow-[0_24px_50px_-12px_rgba(58,53,77,0.22)]"
            id="update-name-modal-container"
          >
            {/* Elegant top color band */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-[#ffd9e5] to-secondary" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header Title */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-on-surface tracking-tight" id="update-name-modal-title">
                    Update Profile Name
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                    Choose a custom display name for your Yura Reminders space.
                  </p>
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

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest pl-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      placeholder="Your name"
                      autoFocus
                      maxLength={30}
                      className="w-full px-4 h-12 text-sm font-bold border border-[#D8CCFF] rounded-2xl bg-white focus:bg-white focus:border-primary/60 focus:ring-4 focus:ring-primary/10 leading-relaxed text-on-surface outline-none transition-all pl-11 hover:border-[#b2a4ff]/60 shadow-sm"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary pointer-events-none" />
                  </div>
                </div>

                {/* Error warning notification state */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 text-xs font-bold text-error px-1"
                    >
                      <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                      <p>{errorMsg}</p>
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
                    className="text-xs font-extrabold hover:bg-[#b2a4ff]/8 border-0 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    className="text-xs font-black shadow-md shadow-primary/10 px-6 h-11 bg-gradient-to-r from-primary to-primary-container"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
