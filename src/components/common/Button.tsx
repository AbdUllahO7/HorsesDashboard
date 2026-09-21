"use client";

import React from "react";
import { cn } from "@/core/utils/cn";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "gold" | "outline" | "ghost" | "danger" | "secondary";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  gold: "bg-[#B59E5F] text-black hover:bg-[#A38B47] border border-transparent font-semibold shadow-xs",
  outline: "border border-[#EADBBD] bg-[#FAF4E6] text-[#A6883C] hover:bg-[#F3E7C9] font-semibold",
  secondary: "border border-[#EDEEF2] bg-white text-[#1E1E2D] hover:bg-[#F9FAFB]",
  ghost: "bg-transparent text-[#6C7280] hover:bg-[#F3F4F8] hover:text-[#1E1E2D]",
  danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-xs rounded-xl gap-2",
  lg: "px-5 py-2.5 text-sm rounded-xl gap-2.5",
  icon: "p-2 rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "gold",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
