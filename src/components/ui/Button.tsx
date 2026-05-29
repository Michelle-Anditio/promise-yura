import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  pill = true,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-sans font-semibold tracking-wide transition-all duration-300 active:scale-[0.96] ease-out select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4.5 text-base",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:opacity-93",
    secondary: "bg-secondary-fixed text-on-secondary-fixed-variant shadow-md shadow-secondary/10 hover:bg-secondary-container",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant shadow-sm hover:bg-tertiary-container hover:text-white",
    danger: "bg-error text-white shadow-md shadow-error/10 hover:bg-red-700",
    outline: "border-2 border-primary text-primary hover:bg-primary/5 bg-transparent",
    ghost: "bg-transparent text-primary hover:bg-primary/5 shadow-none",
  };

  const pillStyle = pill ? "rounded-full" : "rounded-2xl";

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${pillStyle} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};
