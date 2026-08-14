import { ReactNode } from "react";
import { BUTTON_SIZES, ButtonSize } from "@/src/config/ui";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-secondary-bg text-secondary-text hover:bg-secondary-bg-hover",
    outline: "border-2 border-primary text-primary hover:bg-secondary-bg",
    danger: "bg-danger text-white hover:bg-danger/90",
    success: "bg-success text-white hover:bg-success/90",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}
