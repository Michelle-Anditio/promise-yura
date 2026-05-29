import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { YuraMascot } from "../brand/YuraMascot";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setErrorMsg("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  const canDelete = confirmText.trim() === "DELETE";

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) {
      setErrorMsg("Please type DELETE to confirm.");
      return;
    }

    setIsDeleting(true);
    setErrorMsg("");
    try {
      await onConfirmDelete();
      onClose();
    } catch (err: any) {
      console.error("[DeleteAccountModal] Error during account deletion:", err);
      if (err?.code === "auth/requires-recent-login" || String(err).includes("requires-recent-login")) {
        setErrorMsg("Deleting your account requires a recent login. Please click active logout, log back in, and immediately try again.");
      } else {
        setErrorMsg(err?.message || "An unexpected error occurred while deleting your account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
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
            id="delete-account-modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-rose-100 rounded-3xl shadow-[0_24px_50px_-12px_rgba(186,26,26,0.15)]"
            id="delete-account-modal-container"
          >
            {/* Dangerous Red Top Band */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ba1a1a]" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header Title with warning icon */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <YuraMascot mood="sad" size="xs" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#ba1a1a] tracking-tight" id="delete-account-modal-title">
                      Delete Your Account
                    </h3>
                    <p className="text-xs text-on-surface-variant font-semibold">
                      This action is permanent and dangerous.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-rose-50 text-on-surface-variant hover:text-[#ba1a1a] transition-colors cursor-pointer select-none"
                  aria-label="Close modal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Centered large sad warning mascot */}
              <YuraMascot mood="sad" size="md" className="mx-auto" />

              {/* Warnings List */}
              <div className="bg-rose-50/50 rounded-2xl p-4.5 border border-rose-100 space-y-2.5 text-xs font-medium text-rose-900 select-none">
                <p className="font-extrabold flex items-center gap-1.5 text-[#ba1a1a]">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Please be aware of the following:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Your user profile, streaking records, and all data will be permanently wiped.</li>
                  <li>Every saved, active, and completed Promise under your account will be deleted forever.</li>
                  <li>This action is absolute and <strong className="font-extrabold text-[#ba1a1a]">cannot be undone</strong>.</li>
                </ul>
              </div>

              {/* Form Input */}
              <form onSubmit={handleDeleteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold text-on-surface-variant/90 uppercase tracking-wider pl-1">
                    To confirm, please type <span className="text-[#ba1a1a] font-black select-all">DELETE</span> below:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Type DELETE"
                    maxLength={30}
                    className="w-full h-12 text-center text-sm font-black tracking-widest border border-rose-200 rounded-2xl bg-white focus:bg-white focus:border-[#ba1a1a] focus:ring-4 focus:ring-rose-100 leading-relaxed text-on-surface outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Error warning */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-start gap-2 text-xs font-bold text-[#ba1a1a] px-1 bg-rose-50 p-2.5 rounded-xl border border-rose-100"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                      <p className="leading-tight">{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="text-xs font-extrabold hover:bg-[#b2a4ff]/8 border-0 h-11"
                  >
                    Keep Account
                  </Button>
                  <Button
                    type="submit"
                    variant={canDelete ? "danger" : "ghost"}
                    disabled={!canDelete || isDeleting}
                    className={`text-xs font-black shadow-md px-6 h-11 rounded-xl transition-all ${
                      canDelete && !isDeleting
                        ? "bg-[#ba1a1a] hover:bg-[#921313] text-white shadow-rose-200 active:scale-[0.98]"
                        : "bg-[#faf9ff] text-[#797582]/40 border border-neutral-creamDark/10 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete"}
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
