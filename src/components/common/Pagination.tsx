"use client";

import React from "react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const { isRTL } = useTranslation();

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 text-xs font-medium text-[#8E8E93]",
        className
      )}
    >
      {/* 1. Page Count Info (if helpful for accessibility / info) */}
      <div className="text-xs text-[#8E8E93]">
        <span>{isRTL ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
      </div>

      {/* 2. Controls & Page Circular Pills (matching Figma) */}
      <div className="flex items-center gap-2">
        {/* Previous Button (Pill) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="rounded-full border border-[#E2E4EB] bg-white px-5 py-2 text-xs font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1E1E2D] disabled:cursor-not-allowed disabled:opacity-40 transition-all cursor-pointer shadow-xs"
        >
          {isRTL ? "السابق" : "Prev"}
        </button>

        {/* Page numbers (Perfect Circles) */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
                isActive
                  ? "bg-[#B8860B] text-white shadow-xs"
                  : "border border-[#E2E4EB] bg-white text-[#4A4E5A] hover:bg-[#F9FAFB] hover:text-[#1E1E2D]"
              )}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button (Pill) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="rounded-full border border-[#E2E4EB] bg-white px-5 py-2 text-xs font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1E1E2D] disabled:cursor-not-allowed disabled:opacity-40 transition-all cursor-pointer shadow-xs"
        >
          {isRTL ? "التالي" : "Next"}
        </button>
      </div>
    </div>
  );
}

