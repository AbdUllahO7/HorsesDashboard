"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { TrendingUp, TrendingDown } from "lucide-react";

export type StatCardVariant = "gold" | "emerald" | "blue" | "amber" | "rose";

export interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }> | React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: StatCardVariant;
  iconPosition?: "right" | "left";
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<
  StatCardVariant,
  {
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    hoverBorder: string;
  }
> = {
  gold: {
    iconBg: "bg-[#FAF4E8]",
    iconBorder: "border-[#EADBBD]",
    iconColor: "text-[#B59E5F]",
    hoverBorder: "hover:border-[#EADBBD]",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconBorder: "border-emerald-200",
    iconColor: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300",
  },
  blue: {
    iconBg: "bg-blue-50",
    iconBorder: "border-blue-200",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-300",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-200",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-300",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconBorder: "border-rose-200",
    iconColor: "text-rose-600",
    hoverBorder: "hover:border-rose-300",
  },
};

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  variant = "gold",
  iconPosition = "right",
  href,
  onClick,
  loading = false,
  className,
}: StatCardProps) {
  const { isRTL } = useTranslation();
  const styles = variantStyles[variant] || variantStyles.gold;

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return icon;
    }

    const IconComponent = icon as React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }>;
    return <IconComponent className="h-6 w-6" strokeWidth={1.8} size={24} />;
  };

  const isIconOnRight = isRTL ? iconPosition === "right" : iconPosition === "left";

  const content = (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-start gap-5 rounded-2xl border border-[#EDEEF2] bg-white p-5 shadow-2xs transition-all duration-200",
        styles.hoverBorder,
        href || onClick ? "cursor-pointer hover:shadow-xs hover:-translate-y-0.5" : "",
        className
      )}
    >
      {/* 1. Icon Container (On Right in RTL) */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105",
          styles.iconBg,
          styles.iconBorder,
          styles.iconColor,
          !isIconOnRight ? "order-last" : "order-first"
        )}
      >
        {renderIcon()}
      </div>

      {/* 2. Text Section (On Left in RTL) */}
      <div
        className={cn(
          "flex flex-col",
          isIconOnRight ? (isRTL ? "text-left" : "text-right") : (isRTL ? "text-right" : "text-left")
        )}
      >
        <span className="text-xs font-medium text-[#8E8E93] transition-colors group-hover:text-[#4A4E5A]">
          {title}
        </span>

        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-stone-100" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-[#1E1E2D]">
              {value}
            </span>
          )}

          {trend && !loading && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
        </div>

        {subtitle && !loading && (
          <span className="mt-1 text-[11px] text-[#A0A4B5]">{subtitle}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
