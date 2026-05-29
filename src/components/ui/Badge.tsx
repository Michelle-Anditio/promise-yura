import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = "primary",
  className = "",
}) => {
  const badgeColors = {
    primary: "bg-primary-fixed text-primary font-bold",
    secondary: "bg-secondary-fixed text-on-secondary-fixed-variant font-bold",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold",
    success: "bg-tertiary-container/30 text-to-on-tertiary-container font-bold",
    warning: "bg-secondary-container text-on-secondary-container font-bold",
    danger: "bg-error-container text-on-error-container font-bold",
    neutral: "bg-surface-container-high text-on-surface-variant font-medium",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider select-none ${badgeColors[color]} ${className}`}
    >
      {children}
    </span>
  );
};
