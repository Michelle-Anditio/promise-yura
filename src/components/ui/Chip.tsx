import React from "react";

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onClick,
  icon,
  className = "",
}) => {
  const baseStyle = "px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer selection:bg-transparent";
  const activeStyle = active
    ? "bg-primary text-white shadow-md shadow-primary/20"
    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors";

  return (
    <button className={`${baseStyle} ${activeStyle} ${className}`} onClick={onClick}>
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {label}
    </button>
  );
};
