import React from "react";
import { Sparkles, Calendar, Clock, HelpCircle } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: "stars" | "calendar_today" | "event_busy" | string;
  variant?: "primary" | "secondary" | "tertiary" | "neutral";
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = "primary",
  description,
  className = "",
}) => {
  const styles = {
    primary: "bg-primary-fixed text-on-primary-fixed shadow-sm shadow-primary-fixed/30",
    secondary: "bg-secondary-fixed text-on-secondary-fixed shadow-sm shadow-secondary-fixed/30",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed shadow-sm shadow-tertiary-fixed/30",
    neutral: "bg-surface-container-high text-on-surface-variant shadow-none border border-surface-variant",
  };

  const textMutedColors = {
    primary: "text-on-primary-fixed-variant opacity-80",
    secondary: "text-on-secondary-fixed-variant opacity-80",
    tertiary: "text-on-tertiary-fixed-variant opacity-80",
    neutral: "text-[#797582]",
  };

  const renderIcon = () => {
    switch (icon) {
      case "stars":
        return <Sparkles className="w-5 h-5 flex-shrink-0" />;
      case "calendar_today":
        return <Calendar className="w-5 h-5 flex-shrink-0" />;
      case "event_busy":
        return <Clock className="w-5 h-5 flex-shrink-0" />;
      default:
        return <HelpCircle className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className={`p-4 rounded-2xl flex flex-col justify-between h-30 transition-transform ${styles[variant]} ${className}`}>
      <span className="mb-2 self-start flex items-center justify-center">
        {renderIcon()}
      </span>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${textMutedColors[variant]}`}>
          {title}
        </p>
        <p className="text-2xl font-black leading-none mt-0.5">{value}</p>
        {description && (
          <p className="text-[10px] select-none opacity-80 leading-none mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
export default StatCard;
