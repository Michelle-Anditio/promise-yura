import React from "react";
import { Clock, Heart, CheckCircle2, Calendar, Edit3, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export interface PromiseCardProps {
  title: string;
  category?: string;
  dateStr?: string;
  timeStr?: string;
  dueAt?: string;
  priority?: "Low" | "Medium" | "High";
  status: "upcoming" | "needs check-in" | "needs detail" | "done" | "missed";
  onCheckIn?: () => void;
  onEdit?: () => void;
  onAddDetails?: () => void;
  onEditDateTime?: () => void;
  className?: string;
}

function formatPromiseDateTime(dueAt?: string): string {
  if (!dueAt) return "Needs date/time";
  const date = new Date(dueAt);
  if (isNaN(date.getTime())) return "Needs date/time";

  const now = new Date();
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;

  if (isSameDay(date, now)) {
    return `Today · ${timeStr}`;
  } else if (isSameDay(date, tomorrow)) {
    return `Tomorrow · ${timeStr}`;
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const dayNum = date.getDate();

  if (date.getFullYear() === now.getFullYear()) {
    return `${weekday}, ${month} ${dayNum} · ${timeStr}`;
  } else {
    return `${month} ${dayNum}, ${date.getFullYear()} · ${timeStr}`;
  }
}

export const PromiseCard: React.FC<PromiseCardProps> = ({
  title,
  category = "PROMISE",
  dateStr = "Today",
  timeStr = "",
  dueAt,
  priority = "Medium",
  status,
  onCheckIn,
  onEdit,
  onAddDetails,
  onEditDateTime,
  className = "",
}) => {
  const getBadgeColor = () => {
    switch (status) {
      case "upcoming":
        return "tertiary";
      case "needs check-in":
        return "secondary";
      case "needs detail":
        return "danger";
      case "done":
        return "success";
      case "missed":
        return "danger";
      default:
        return "neutral";
    }
  };

  const getBadgeText = () => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "needs check-in":
        return "Needs Check-in";
      case "needs detail":
        return "Needs Detail";
      case "done":
        return "Checked in! (Kept)";
      case "missed":
        return "Missed";
      default:
        return "Pending";
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case "upcoming":
        return "border-l-4 border-l-tertiary-container";
      case "needs check-in":
        return "border-l-4 border-l-secondary-container";
      case "needs detail":
        return "border-l-4 border-l-error/30 border-dashed";
      case "done":
        return "border-l-4 border-l-emerald-400 opacity-80 bg-emerald-50/10";
      case "missed":
        return "border-l-4 border-l-red-400 opacity-90 bg-red-50/5";
      default:
        return "border-l-4 border-l-surface-container-highest";
    }
  };

  return (
    <Card className={`${getBorderColor()} ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1 pr-6 flex-1">
          <Badge color={getBadgeColor()}>{getBadgeText()}</Badge>
          <h3 className="text-xl font-bold text-on-surface leading-snug tracking-tight">
            {title}
          </h3>
        </div>
        <div className="p-2 bg-surface-container-low rounded-full flex items-center justify-center">
          {status === "needs detail" ? (
            <AlertCircle className="w-5 h-5 text-error" />
          ) : status === "needs check-in" ? (
            <Heart className="w-5 h-5 text-secondary" />
          ) : status === "missed" ? (
            <Clock className="w-5 h-5 text-error" />
          ) : status === "done" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Calendar className="w-5 h-5 text-primary" />
          )}
        </div>
      </div>

      {/* Date & Muted Subtitles */}
      <div className="flex items-center gap-3 mb-4 text-sm text-on-surface-variant font-medium select-none flex-wrap">
        {dueAt ? (
          <button
            type="button"
            onClick={onEditDateTime}
            className="flex items-center gap-1.5 text-xs text-on-surface font-bold hover:text-primary transition-colors cursor-pointer"
            id={`edit-datetime-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{formatPromiseDateTime(dueAt)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onEditDateTime}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold hover:text-primary transition-colors cursor-pointer"
            id={`edit-datetime-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <Clock className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span>Needs date/time</span>
          </button>
        )}
        
        {priority && (
          <div className="flex items-center gap-1 opacity-80 pl-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs uppercase font-extrabold text-outline">{priority} Priority</span>
          </div>
        )}
      </div>

      {/* Actions Grid */}
      <div className="flex gap-2.5 mt-2">
        {status === "needs detail" && onAddDetails ? (
          <Button variant="secondary" className="flex-grow shadow-sm" onClick={onAddDetails}>
            Add time
          </Button>
        ) : status !== "done" && status !== "missed" && onCheckIn ? (
          <Button variant="primary" className="flex-grow shadow-md bg-gradient-to-r from-primary to-primary-container" onClick={onCheckIn}>
            Check in
          </Button>
        ) : status === "missed" && onCheckIn ? (
          <Button variant="secondary" className="flex-grow opacity-90 shadow-sm" onClick={onCheckIn}>
            Check in late
          </Button>
        ) : (
          <div className="flex-grow text-xs text-on-surface-variant/70 italic flex items-center">
            {status === "done" ? "Kept on schedule!" : "Awaiting check-in"}
          </div>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            className="w-13 h-13 flex items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed hover:bg-primary-container/30 transition-colors active:scale-90 select-none cursor-pointer"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
};
export default PromiseCard;
