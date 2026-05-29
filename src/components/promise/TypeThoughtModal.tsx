import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Feather, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

interface TypeThoughtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (thought: string) => void;
  defaultValue?: string;
}

export const TypeThoughtModal: React.FC<TypeThoughtModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValue = "",
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      setErrorMsg("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setErrorMsg("Please write down something for Yura to catch first!");
      return;
    }
    onSubmit(inputValue);
    setInputValue("");
    setErrorMsg("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#3a354d]/40 backdrop-blur-md"
            id="type-thought-modal-overlay"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.45 }}
            className="relative w-full max-w-md overflow-hidden bg-white border border-neutral-creamDark/60 rounded-3xl shadow-[0_24px_64px_-16px_rgba(58,53,77,0.18)]"
            id="type-thought-modal-container"
          >
            {/* Soft Pastel Accent Header Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary-container" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header Details */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Feather className="text-primary w-5 h-5" />
                    <h3 className="text-xl font-black text-on-surface tracking-tight" id="type-thought-modal-title">
                      Type your messy thought
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed" id="type-thought-modal-helper">
                    Write it messy. <span className="text-primary font-bold">Yura will organize it.</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-neutral-creamLight text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer select-none"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Textarea Input Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    autoFocus
                    placeholder="E.g., Remind me to call Mom today around 5pm, and keep water bottle on desk..."
                    value={inputValue}
                    onChange={handleTextChange}
                    className="w-full h-36 p-4 text-sm font-medium border border-[#D8CCFF] rounded-2xl bg-white focus:bg-white focus:border-primary/60 focus:ring-4 focus:ring-primary/10 leading-relaxed text-on-surface placeholder-on-surface-variant/55 resize-none outline-none transition-all duration-300 hover:border-[#b2a4ff]/60 shadow-sm"
                    id="type-thought-textarea"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-[10px] select-none font-bold text-primary bg-primary-container/20 rounded-full border border-primary/10">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    <span>Yura Brain AI Active</span>
                  </div>
                </div>

                {/* Inline Error messages */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs font-bold text-error px-1"
                      id="type-thought-error"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onClose}
                    className="text-xs font-extrabold hover:bg-neutral-creamLight border-0 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="text-xs font-black shadow-md shadow-primary/10 px-6 h-11"
                  >
                    Continue
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
