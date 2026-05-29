import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface EditDateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dateStr: string, timeStr: string, dueAtIso: string) => void;
  promiseTitle: string;
  initialDueAt?: string;
}

const getTodayLocalDateStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const EditDateTimeModal: React.FC<EditDateTimeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  promiseTitle,
  initialDueAt,
}) => {
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      if (initialDueAt) {
        try {
          const d = new Date(initialDueAt);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dayNum = String(d.getDate()).padStart(2, "0");
            const hrs = String(d.getHours()).padStart(2, "0");
            const mins = String(d.getMinutes()).padStart(2, "0");
            
            setDateInput(`${y}-${m}-${dayNum}`);
            setTimeInput(`${hrs}:${mins}`);
            return;
          }
        } catch {
          // ignore parsing error
        }
      }
      
      // Default to today/next hour if no initial dueAt
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const dayNum = String(now.getDate()).padStart(2, "0");
      setDateInput(`${y}-${m}-${dayNum}`);
      
      const nextHour = (now.getHours() + 1) % 24;
      setTimeInput(`${String(nextHour).padStart(2, "0")}:00`);
    }
  }, [isOpen, initialDueAt]);

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!dateInput) {
      setErrorMsg("Please select a valid date.");
      return;
    }
    if (!timeInput) {
      setErrorMsg("Please select a valid time.");
      return;
    }

    try {
      // Build exactly local timezone date from inputs
      const [yearStr, monthStr, dayStr] = dateInput.split("-");
      const [hourStr, minStr] = timeInput.split(":");
      
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
        setErrorMsg("The selected date or time combination is invalid.");
        return;
      }

      // Past date check in local timezone
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDateOnly = new Date(combinedDate.getFullYear(), combinedDate.getMonth(), combinedDate.getDate());

      if (selectedDateOnly < todayStart) {
        setErrorMsg("Selected date cannot be in the past.");
        return;
      }

      // Past time check on same day
      if (selectedDateOnly.getTime() === todayStart.getTime()) {
        if (combinedDate < now) {
          setErrorMsg("Selected time is in the past. Please set a future time.");
          return;
        }
      }

      const isoStr = combinedDate.toISOString();
      const optionsDate: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
      const formattedDateStr = combinedDate.toLocaleDateString("en-US", optionsDate); // E.g., "Mon, May 27"
      
      let hr = combinedDate.getHours();
      const min = String(combinedDate.getMinutes()).padStart(2, "0");
      const ampm = hr >= 12 ? "PM" : "AM";
      hr = hr % 12;
      hr = hr ? hr : 12;
      const formattedTimeStr = `${hr}:${min} ${ampm}`; // E.g., "11:00 AM"

      onSave(formattedDateStr, formattedTimeStr, isoStr);
    } catch {
      setErrorMsg("Could not process the date-time selection.");
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
            id="date-time-modal-overlay"
          />

          {/* Modal Modal dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden bg-white border border-neutral-creamDark/60 rounded-3xl shadow-[0_24px_50px_-12px_rgba(58,53,77,0.22)]"
            id="date-time-modal-container"
          >
            {/* Soft pink gradient header underline */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary via-primary-container to-secondary" />

            <div className="p-6 pt-7 space-y-5">
              {/* Header section with Promise item title */}
              <div className="flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <h3 className="text-lg font-black text-on-surface tracking-tight" id="date-time-modal-title">
                    Schedule Promise
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 font-medium leading-relaxed">
                    Setting reminder trigger for: <span className="text-primary font-bold">"{promiseTitle}"</span>
                  </p>
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

              {/* Form Inputs */}
              <form onSubmit={handleSaveClick} className="space-y-4">
                {/* Date Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest pl-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateInput}
                      min={getTodayLocalDateStr()}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full px-4 h-12 text-sm font-bold border border-[#D8CCFF] rounded-2xl bg-white focus:bg-white focus:border-primary/60 focus:ring-4 focus:ring-primary/10 leading-relaxed text-on-surface outline-none transition-all pl-11 hover:border-[#b2a4ff]/60 shadow-sm"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary pointer-events-none" />
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant/80 uppercase tracking-widest pl-2">
                    Due Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      className="w-full px-4 h-12 text-sm font-bold border border-[#D8CCFF] rounded-2xl bg-white focus:bg-white focus:border-primary/60 focus:ring-4 focus:ring-primary/10 leading-relaxed text-on-surface outline-none transition-all pl-11 hover:border-[#b2a4ff]/60 shadow-sm"
                    />
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary pointer-events-none" />
                  </div>
                </div>

                {/* Local validation warning info */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-2 text-xs font-bold text-error px-1 py-1"
                    >
                      <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                      <p>{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Trigger buttons */}
                <div className="flex items-center justify-end gap-3 pt-3">
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
                    className="text-xs font-black shadow-md shadow-primary/10 px-6 h-11 bg-gradient-to-r from-primary to-primary-container"
                  >
                    Save
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
