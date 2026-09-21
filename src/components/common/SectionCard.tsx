"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface SectionCardProps {
  title: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }> | React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function SectionCard({
  title,
  icon,
  actionText,
  actionHref,
  onActionClick,
  children,
  loading = false,
  className,
}: SectionCardProps) {
  const { isRTL } = useTranslation();

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ComponentType<{ className?: string; strokeWidth?: number; size?: number }>;
    return <IconComponent className="h-8 w-8" strokeWidth={1.8} size={20} />;
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl  bg-white p-6 shadow-2xs transition-all",
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#F0F1F5] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          {icon && <span className=" shrink-0">{renderIcon()}</span>}
          <h2 className="text-sm font-bold text-[#1E1E2D]">{title}</h2>
        </div>

        {actionText && (
          <div>
            {actionHref ? (
              <Link
                href={actionHref}
                className="flex items-center gap-1 text-xs font-medium text-[#8E8E93] hover:text-[#B59E5F] transition-colors"
              >
                <span>{actionText}</span>
                {isRTL ? (
                  <ChevronLeft className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Link>
            ) : onActionClick ? (
              <button
                onClick={onActionClick}
                className="flex items-center gap-1 text-xs font-medium text-[#8E8E93] hover:text-[#B59E5F] transition-colors"
              >
                <span>{actionText}</span>
                {isRTL ? (
                  <ChevronLeft className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Section Body */}
      <div className="flex-1">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-[#8E8E93]">
            <Loader2 className="h-6 w-6 animate-spin text-[#B59E5F]" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
