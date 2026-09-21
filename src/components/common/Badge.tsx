import React from "react";
import { cn } from "@/core/utils/cn";

export type BadgeVariant = "gold" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  gold: "bg-[#FAF4E8] text-[#A6883C] border-[#EADBBD]",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-stone-100 text-stone-700 border-stone-200",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2.5 py-1 text-[11px] rounded-lg gap-1.5",
  md: "px-3.5 py-1.5 text-xs rounded-xl gap-2",
  lg: "px-4 py-2 text-[13px] rounded-xl gap-2",
};

export function Badge({
  children,
  variant = "gold",
  icon,
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border font-semibold transition-colors",
        badgeVariants[variant],
        sizeStyles[size],
        className
      )}
    >
      <span>{children}</span>
      {icon && <span className="shrink-0 text-[#A6883C]">{icon}</span>}
    </span>
  );
}
