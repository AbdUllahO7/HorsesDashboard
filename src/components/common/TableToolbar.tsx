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
            className="flex items-center gap-1.5 rounded-xl border border-[#E0CEBE] bg-[#F8F1EA] px-3.5 py-2 text-xs font-bold text-[#8B5E3C] hover:bg-[#F0E3D3] transition-colors cursor-pointer shadow-2xs"
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
              className="w-full rounded-xl border border-[#ECE4D9] bg-white py-2 pr-3.5 pl-9 text-xs text-[#2F241C] placeholder-[#8F7E72] outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/15 transition-all shadow-2xs"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8F7E72]" />
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
                  "px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-2xs",
                  isActive
                    ? "bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs"
                    : "border-[#ECE4D9] bg-white text-[#5E4E42] hover:bg-[#FAF4EB] hover:text-[#8B5E3C]"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "mr-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                      isActive ? "bg-white/20 text-white" : "bg-[#FAF4EB] text-[#8B5E3C]"
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
