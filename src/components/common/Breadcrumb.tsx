"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  pageTitle?: string;
  parentTitle?: string;
  parentHref?: string;
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({
  pageTitle,
  parentTitle,
  parentHref = "/",
  items,
  className,
}: BreadcrumbProps) {
  const { t, isRTL } = useTranslation();
  const resolvedParentTitle = parentTitle || t("nav.dashboard", "لوحة التحكم");
  const separator = isRTL ? ">" : "/";

  if (items && items.length > 0) {
    return (
      <div className={cn("flex items-center justify-start text-xs text-[#8E8E93] font-medium gap-1.5", className)}>
        {items.map((item, idx) => {
          const isFirst = idx === 0;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="opacity-60">{separator}</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-[#1E1E2D] transition-colors",
                    isFirst ? "text-[#1E1E2D] font-bold" : "text-[#8E8E93]"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isFirst ? "text-[#1E1E2D] font-bold" : "text-[#8E8E93]")}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-start text-xs text-[#8E8E93] font-medium gap-1.5", className)}>
      <span className="text-[#1E1E2D] font-bold">{pageTitle}</span>
      <span className="opacity-60">{separator}</span>
      {parentHref ? (
        <Link href={parentHref} className="hover:text-[#1E1E2D] transition-colors text-[#8E8E93]">
          {resolvedParentTitle}
        </Link>
      ) : (
        <span>{resolvedParentTitle}</span>
      )}
    </div>
  );
}

