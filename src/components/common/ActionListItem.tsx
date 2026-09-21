"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { Badge, BadgeVariant } from "./Badge";

export interface ActionListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }> | React.ReactNode;
  badgeText?: string | number;
  badgeIcon?: React.ReactNode;
  badgeVariant?: BadgeVariant;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ActionListItem({
  title,
  subtitle,
  icon,
  badgeText,
  badgeIcon,
  badgeVariant = "gold",
  href,
  onClick,
  className,
}: ActionListItemProps) {
  const { isRTL } = useTranslation();

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }>;
    return <IconComponent className="h-6 w-6" strokeWidth={1.8} size={24} />;
  };

  const itemContent = (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[82px] items-center justify-between rounded-2xl bg-white px-5 py-3.5 shadow-2xs transition-all duration-200 hover:bg-[#FDFBF7]",
        isRTL ? "border-r-[5px] border-r-[#B8860B]" : "border-l-[5px] border-l-[#B8860B]",
        href || onClick ? "cursor-pointer hover:shadow-xs" : "",
        className
      )}
    >
      {/* 1. Leading Side: Circular Icon + Details */}
      <div className="flex items-center gap-4">
        {/* Perfect Circle Icon Container from Figma */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] transition-transform duration-200 group-hover:scale-105">
          {renderIcon()}
        </div>

        {/* Text Details */}
        <div className={cn("flex flex-col", isRTL ? "text-right" : "text-left")}>
          <h3 className="text-sm md:text-[15px] font-bold text-[#1E1E2D] group-hover:text-black">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#8E8E93] mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 2. Trailing Side: Pill Badge from Figma */}
      {badgeText !== undefined && (
        <Badge variant={badgeVariant} icon={badgeIcon} size="lg">
          {badgeText}
        </Badge>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {itemContent}
      </Link>
    );
  }

  return itemContent;
}
