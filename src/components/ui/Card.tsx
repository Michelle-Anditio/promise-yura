import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  glass = true,
  glow = false,
  ...props
}) => {
  const baseStyle = "border border-[#D8CCFF] p-5 rounded-2xl relative overflow-hidden transition-all duration-300";
  const glassStyle = glass ? "glass-card soft-shadow" : "bg-white shadow-sm";
  const glowStyle = glow ? "ambient-glow" : "";

  return (
    <div className={`${baseStyle} ${glassStyle} ${glowStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};
