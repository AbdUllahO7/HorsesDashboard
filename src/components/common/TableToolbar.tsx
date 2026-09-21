"use client";

import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";

export interface FilterTab<T = string> {
  id: T;
  label: string;
  count?: number;
}

export interface TableToolbarProps<T = string> {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  onSortClick?: () => void;
  sortLabel?: string;
  showSort?: boolean;
  tabs?: FilterTab<T>[];
  activeTab?: T;
  onTabChange?: (tabId: T) => void;
  extraActions?: React.ReactNode;
  className?: string;
}

export function TableToolbar<T = string>({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  showSearch = true,
  onSortClick,
  sortLabel,
  showSort = true,
  tabs,
  activeTab,
  onTabChange,
  extraActions,
  className,
}: TableToolbarProps<T>) {
  const { t, isRTL } = useTranslation();
  const resolvedSearchPlaceholder = searchPlaceholder || t("common.searchPlaceholder", "ابحث هنا...");
  const resolvedSortLabel = sortLabel || t("common.filter", "فرز");
  return (
    <div
      className={cn(
        "flex flex-col-reverse lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6",
        className
      )}
    >
      {/* Right Side: Search & Sort Controls */}
      <div className="flex items-center gap-2.5">
        {showSort && (
          <button
            type="button"
            onClick={onSortClick}
            title="فرز النتائج"
            className="flex items-center gap-1.5 rounded-md border border-[#EADBBD] bg-[#FAF4E6] px-3.5 py-1.5 text-xs font-bold text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{resolvedSortLabel}</span>
          </button>
        )}

        {showSearch && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={resolvedSearchPlaceholder}
              className="w-full rounded-md border border-[#E5E7EB] bg-white py-1.5 pr-3 pl-9 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B59E5F] transition-all"
            />
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-[#9CA3AF]" />
          </div>
        )}

        {extraActions}
      </div>

      {/* Left Side: Filter Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={String(tab.id)}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "px-6.5 py-3.5 text-xs font-semibold rounded-sm border transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-[#B8860B] text-white border-[#B8860B] shadow-2xs"
                    : "border-[#E5E7EB] bg-white text-[#4A4E5A] hover:bg-[#F9FAFB]"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "mr-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
                      isActive ? "bg-white/20 text-white" : "bg-stone-100 text-[#4A4E5A]"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
