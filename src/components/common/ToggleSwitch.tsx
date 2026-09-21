"use client";

import React from "react";
import { cn } from "@/core/utils/cn";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: "green" | "gold";
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  color = "green",
  className,
}: ToggleSwitchProps) {
  const activeColor =
    color === "green"
      ? "bg-[#22C55E] border-[#22C55E]"
      : "bg-[#B8860B] border-[#B8860B]";

  return (
    <button
      type="button"
      role="switch"
      dir="ltr"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? activeColor : "bg-[#E5E7EB] border-[#E5E7EB]",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}

