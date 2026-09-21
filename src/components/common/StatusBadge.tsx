import React from "react";
import { cn } from "@/core/utils/cn";
import { SellerStatus } from "@/features/listings/types";

export interface StatusBadgeProps {
  status: SellerStatus | string;
  customLabel?: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  active: {
    label: "نشط",
    bg: "bg-[#E8F8F0]",
    text: "text-[#10B981]",
    border: "border-[#A7F3D0]",
  },
  blocked: {
    label: "محظور",
    bg: "bg-[#FEF2F2]",
    text: "text-[#EF4444]",
    border: "border-[#FECACA]",
  },
  pending: {
    label: "قيد المراجعة",
    bg: "bg-[#FFFBEB]",
    text: "text-[#F59E0B]",
    border: "border-[#FDE68A]",
  },
  inactive: {
    label: "غير نشط",
    bg: "bg-[#F3F4F6]",
    text: "text-[#6B7280]",
    border: "border-[#E5E7EB]",
  },
};

export function StatusBadge({ status, customLabel, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;
  const displayLabel = customLabel || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-semibold tracking-wide transition-colors",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
