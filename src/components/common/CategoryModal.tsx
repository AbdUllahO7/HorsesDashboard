"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { CategoryItem, CategoryFormData, CategoryType } from "@/features/categories/types";

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData, id?: string) => Promise<void> | void;
  category?: CategoryItem | null;
  loading?: boolean;
  className?: string;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  loading = false,
  className,
}: CategoryModalProps) {
  const { isRTL } = useTranslation();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    type: "livestock",
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        type: category.type || "livestock",
        description: category.description || "",
      });
    } else {
      setFormData({
        name: "",
        type: "livestock",
        description: "",
      });
    }
  }, [category, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await onSave(formData, category?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-10 text-right shadow-2xl transition-all duration-300",
          className
        )}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className={cn(
            "absolute top-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1E1E2D] transition-colors cursor-pointer",
            isRTL ? "left-6" : "right-6"
          )}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#B8860B]">
            {category ? "تعديل التصنيف" : "اضافة تصنيف جديد"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
                اسم التصنيف
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="اسم التصنيف"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
              />
            </div>

            {/* Category Type */}
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
                النوع
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as CategoryType,
                  }))
                }
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
              >
                <option value="livestock">ماشية</option>
                <option value="supplies">مستلزمات</option>
              </select>
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
              الوصف
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="الوصف"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
              <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-[#B8860B] bg-white px-8 py-2.5 text-xs font-bold text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>إلغاء</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#B8860B] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-2"
            >
              <span>حفظ</span>
            </button>
          
          </div>
        </form>
      </div>
    </div>
  );
}
