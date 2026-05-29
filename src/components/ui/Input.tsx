import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconInteractive?: boolean;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  rightIconInteractive = false,
  className = "",
  wrapperClassName = "",
  ...props
}) => {
  return (
    <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-xs font-semibold px-4 text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary flex items-center justify-center pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          className={`w-full h-15 rounded-xl bg-white/95 border border-[#D8CCFF] px-6 text-on-surface text-base focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/60 focus:bg-white transition-all placeholder:text-outline-variant/80 hover:border-[#b2a4ff]/60 ${
            leftIcon ? "pl-12" : ""
          } ${rightIcon ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-primary flex items-center justify-center ${
            rightIconInteractive ? "pointer-events-auto" : "pointer-events-none"
          }`}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-error font-medium px-4">{error}</p>
      )}
    </div>
  );
};
