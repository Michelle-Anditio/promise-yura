import React from "react";
import { ArrowLeft, Settings, Bell } from "lucide-react";
import { YuraMascot } from "../brand/YuraMascot";

export interface HeaderProps {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: string;
  actionType?: "settings" | "skip" | "notification";
  onSkip?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  onAction,
  actionIcon,
  actionType = "skip",
  onSkip,
}) => {
  return (
    <header className="sticky top-0 left-0 w-full z-10 bg-background/80 backdrop-blur-xl border-b border-surface-container/30">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container/40 text-primary active:scale-90 transition-transform select-none cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 font-bold" />
            </button>
          ) : (
            <YuraMascot mood="normal" size="xs" className="hover:scale-105 transition-transform" />
          )}
          <h1 className="text-xl font-bold text-primary tracking-tight select-none">
            {title}
          </h1>
        </div>

        {/* Action element customized */}
        {actionType === "skip" && onSkip ? (
          <button
            onClick={onSkip}
            className="text-sm font-semibold text-neutral-textMuted hover:text-primary active:scale-95 transition-all outline-none py-1.5 px-3 rounded-full hover:bg-primary/5 select-none cursor-pointer"
          >
            Skip
          </button>
        ) : actionType === "settings" && onAction ? (
          <button
            onClick={onAction}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform select-none cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : actionType === "notification" && onAction ? (
          <button
            onClick={onAction}
            className="w-10 h-10 flex items-center justify-center text-primary hover:opacity-80 active:scale-90 transition-transform relative select-none cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary" />
          </button>
        ) : null}
      </div>
    </header>
  );
};
export default Header;
