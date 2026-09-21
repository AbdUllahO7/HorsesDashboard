"use client";

import React, { useState } from "react";
import { cn } from "@/core/utils/cn";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

export type ColumnAlign = "right" | "center" | "left";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  sortable?: boolean;
  align?: ColumnAlign;
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  keyExtractor?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  className?: string;
  tableClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "لا توجد نتائج مطابقة",
  loadingMessage = "جاري تحميل البيانات...",
  keyExtractor,
  onRowClick,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
  onSort,
  className,
  tableClassName,
}: DataTableProps<T>) {
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>(undefined);
  const [internalSortOrder, setInternalSortOrder] = useState<"asc" | "desc">("asc");

  const currentSortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;
  const currentSortOrder = externalSortOrder !== undefined ? externalSortOrder : internalSortOrder;

  const handleHeaderClick = (column: Column<T>) => {
    if (!column.sortable) return;

    if (onSort) {
      onSort(column.key);
    } else {
      if (internalSortBy === column.key) {
        setInternalSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setInternalSortBy(column.key);
        setInternalSortOrder("asc");
      }
    }
  };

  const alignClasses: Record<ColumnAlign, { header: string; cell: string }> = {
    right: { header: "text-right justify-start", cell: "text-right" },
    center: { header: "text-center justify-center", cell: "text-center" },
    left: { header: "text-left justify-end", cell: "text-left" },
  };

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-[#EDEEF2] bg-white", className)}>
      <table className={cn("w-full text-right text-xs", tableClassName)}>
        {/* Table Header */}
        <thead className="bg-[#F8F9FC] text-[#8E8E93] border-b border-[#EDEEF2]">
          <tr>
            {columns.map((column) => {
              const align = column.align || "right";
              const isSorted = currentSortBy === column.key;

              return (
                <th
                  key={column.key}
                  onClick={() => handleHeaderClick(column)}
                  className={cn(
                    "py-3.5 px-4 font-semibold whitespace-nowrap transition-colors select-none",
                    column.sortable && "cursor-pointer hover:text-[#1E1E2D]",
                    column.headerClassName
                  )}
                >
                  <div className={cn("flex items-center gap-1", alignClasses[align].header)}>
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="shrink-0">
                        {isSorted ? (
                          currentSortOrder === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-[#B8860B]" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[#B8860B]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#EDEEF2] bg-white">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-[#8E8E93]">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#B59E5F]" />
                  <p className="text-xs font-medium">{loadingMessage}</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-[#8E8E93] font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const rowKey = keyExtractor
                ? keyExtractor(item, rowIndex)
                : (item as any)?.id || rowIndex.toString();

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "hover:bg-[#FCFCFE] transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column) => {
                    const align = column.align || "right";
                    const value = (item as any)?.[column.key];

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          "py-4 px-4 whitespace-nowrap",
                          alignClasses[align].cell,
                          column.className
                        )}
                      >
                        {column.render ? column.render(item, rowIndex) : (value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
