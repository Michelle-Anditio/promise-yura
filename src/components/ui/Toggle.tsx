import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
}) => {
  return (
    <div className={`flex items-center justify-between ${label ? "p-4 bg-surface-container-high/40 rounded-xl" : ""}`}>
      {label && (
        <div className="flex flex-col pr-4">
          <span className="text-sm font-bold text-on-surface">{label}</span>
          {description && (
            <span className="text-xs text-on-surface-variant">{description}</span>
          )}
        </div>
      )}
      <label className="relative inline-flex items-center cursor-pointer select-none animate-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-14 h-7 rounded-full transition-colors relative ${
            checked ? "bg-primary" : "bg-outline-variant"
          }`}
        >
          <div
            className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${
              checked ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </div>
      </label>
    </div>
  );
};
