"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/core/utils/cn";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Layers,
  Inbox,
} from "lucide-react";
import { useTranslation } from "@/i18n";

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
  // Selection and Bulk Actions Props
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[], selectedItems: T[]) => void;
  renderBulkActions?: (
    selectedIds: string[],
    selectedItems: T[],
    clearSelection: () => void
  ) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage,
  keyExtractor,
  onRowClick,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
  onSort,
  className,
  tableClassName,
  selectable = false,
  selectedIds: externalSelectedIds,
  onSelectionChange,
  renderBulkActions,
}: DataTableProps<T>) {
  const { t, isRTL } = useTranslation();
  const resolvedEmptyMessage = emptyMessage || t("common.noData", "لا توجد نتائج مطابقة");

  const [internalSortBy, setInternalSortBy] = useState<string | undefined>(undefined);
  const [internalSortOrder, setInternalSortOrder] = useState<"asc" | "desc">("asc");
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

  const currentSortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;
  const currentSortOrder = externalSortOrder !== undefined ? externalSortOrder : internalSortOrder;

  // Active selected IDs
  const activeSelectedIds = externalSelectedIds !== undefined ? externalSelectedIds : internalSelectedIds;

  const getItemId = (item: T, index: number): string => {
    if (keyExtractor) return keyExtractor(item, index);
    return (item as any)?.id ? String((item as any).id) : String(index);
  };

  const allItemIds = useMemo(() => {
    return data.map((item, index) => getItemId(item, index));
  }, [data]);

  const selectedItems = useMemo(() => {
    return data.filter((item, index) => activeSelectedIds.includes(getItemId(item, index)));
  }, [data, activeSelectedIds]);

  const isAllSelected = data.length > 0 && allItemIds.every((id) => activeSelectedIds.includes(id));
  const isSomeSelected = activeSelectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    const nextIds = checked ? [...allItemIds] : [];
    if (onSelectionChange) {
      const nextItems = checked ? [...data] : [];
      onSelectionChange(nextIds, nextItems);
    } else {
      setInternalSelectedIds(nextIds);
    }
  };

  const handleSelectRow = (id: string, item: T, checked: boolean) => {
    let nextIds: string[];
    if (checked) {
      nextIds = Array.from(new Set([...activeSelectedIds, id]));
    } else {
      nextIds = activeSelectedIds.filter((itemKey) => itemKey !== id);
    }

    if (onSelectionChange) {
      const nextItems = data.filter((d, idx) => nextIds.includes(getItemId(d, idx)));
      onSelectionChange(nextIds, nextItems);
    } else {
      setInternalSelectedIds(nextIds);
    }
  };

  const clearSelection = () => {
    if (onSelectionChange) {
      onSelectionChange([], []);
    } else {
      setInternalSelectedIds([]);
    }
  };

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
    right: {
      header: isRTL ? "text-right justify-start" : "text-right justify-end",
      cell: "text-right",
    },
    center: {
      header: "text-center justify-center",
      cell: "text-center",
    },
    left: {
      header: isRTL ? "text-left justify-end" : "text-left justify-start",
      cell: "text-left",
    },
  };

  return (
    <div className="relative">
      <div className={cn("overflow-x-auto rounded-2xl border border-[#ECE4D9] bg-white shadow-2xs", className)}>
        <table className={cn("w-full text-xs", isRTL ? "text-right" : "text-left", tableClassName)}>
          {/* Table Header */}
          <thead className="bg-[#FAF6EF] text-[#5E4E42] border-b border-[#ECE4D9]">
            <tr>
              {/* Optional Selection Checkbox Column Header */}
              {selectable && (
                <th className="py-3.5 px-4 w-12 select-none">
                  <label className="relative flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-4.5 h-4.5 rounded border border-[#D9CDBD] bg-white peer-checked:bg-[#8B5E3C] peer-checked:border-[#8B5E3C] flex items-center justify-center transition-all shadow-2xs">
                      {isAllSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      {isSomeSelected && <div className="w-2 h-0.5 bg-[#8B5E3C] rounded-full" />}
                    </div>
                  </label>
                </th>
              )}

              {columns.map((column) => {
                const align = column.align || "right";
                const isSorted = currentSortBy === column.key;

                return (
                  <th
                    key={column.key}
                    onClick={() => handleHeaderClick(column)}
                    className={cn(
                      "py-3.5 px-4 font-bold text-[#2F241C] whitespace-nowrap transition-colors select-none",
                      column.sortable && "cursor-pointer hover:text-[#8B5E3C]",
                      column.headerClassName
                    )}
                  >
                    <div className={cn("flex items-center gap-1.5", alignClasses[align].header)}>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="shrink-0">
                          {isSorted ? (
                            currentSortOrder === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-[#8B5E3C]" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-[#8B5E3C]" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-[#8F7E72] opacity-40 hover:opacity-100" />
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
          <tbody className="divide-y divide-[#ECE4D9]/60 bg-white">
            {loading ? (
              /* Enhanced Skeleton Shimmer Loading Rows */
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  {selectable && (
                    <td className="py-4 px-4 w-12 text-center">
                      <div className="w-4 h-4 rounded bg-[#EFE9E0] mx-auto" />
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td key={`skeleton-col-${colIdx}`} className="py-4 px-4">
                      <div
                        className={cn(
                          "h-3.5 rounded-md bg-[#EFE9E0]",
                          colIdx === 0 ? "w-28" : colIdx === 1 ? "w-36" : "w-20"
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="py-14 text-center text-[#8F7E72]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] border border-[#E0CEBE] flex items-center justify-center text-[#8B5E3C] shadow-2xs">
                      <Inbox className="h-6 w-6 opacity-70" />
                    </div>
                    <p className="text-xs font-bold text-[#2F241C] mt-1">{resolvedEmptyMessage}</p>
                    <p className="text-[11px] text-[#8F7E72]">جرّب تغيير فلاتر البحث أو إضافة بيانات جديدة</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => {
                const rowKey = getItemId(item, rowIndex);
                const isSelected = activeSelectedIds.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "transition-colors",
                      isSelected
                        ? "bg-[#FAF4EB]/70 hover:bg-[#FAF4EB]"
                        : "hover:bg-[#FCFAF7]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {/* Row Checkbox Column */}
                    {selectable && (
                      <td
                        className="py-4 px-4 w-12 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="relative flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowKey, item, e.target.checked)}
                            className="peer sr-only"
                          />
                          <div
                            className={cn(
                              "w-4.5 h-4.5 rounded border flex items-center justify-center transition-all shadow-2xs",
                              isSelected
                                ? "bg-[#8B5E3C] border-[#8B5E3C] text-white"
                                : "border-[#D9CDBD] bg-white hover:border-[#8B5E3C]"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </label>
                      </td>
                    )}

                    {columns.map((column) => {
                      const align = column.align || "right";
                      const value = (item as any)?.[column.key];

                      return (
                        <td
                          key={column.key}
                          className={cn(
                            "py-4 px-4 whitespace-nowrap text-[#2F241C]",
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

      {/* Floating Animated Bulk Actions Dock Bar */}
      {selectable && activeSelectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
          <div className="flex items-center gap-3 bg-[#2F241C] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#8B5E3C]/40 backdrop-blur-md">
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#8B5E3C] text-white text-xs font-bold">
                {activeSelectedIds.length}
              </span>
              <span className="text-xs font-semibold">عناصر محددة</span>
            </div>

            {/* Custom bulk action slot */}
            {renderBulkActions && (
              <div className="flex items-center gap-2">
                {renderBulkActions(activeSelectedIds, selectedItems, clearSelection)}
              </div>
            )}

            {/* Default select all page / clear button */}
            <div className="flex items-center gap-2 pr-1 border-r border-white/20">
              {!isAllSelected && (
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="flex items-center gap-1 text-xs text-[#EFE9E0] hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#C88F45]" />
                  <span>تحديد كل الصفحة ({data.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={clearSelection}
                className="flex items-center gap-1 text-xs text-stone-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="إلغاء التحديد"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>إلغاء</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
