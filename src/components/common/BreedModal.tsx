"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, XCircle } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { BreedItem } from "@/features/categories/types";

export interface BreedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, id?: string | number) => Promise<void> | void;
  breed?: BreedItem | null;
  loading?: boolean;
  className?: string;
}

export function BreedModal({
  isOpen,
  onClose,
  onSave,
  breed,
  loading = false,
  className,
}: BreedModalProps) {
  const { isRTL } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (breed) {
      setName(breed.name || "");
    } else {
      setName("");
    }
  }, [breed, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name.trim(), breed?.id);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300",
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
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#B8860B]">
            {breed ? "تعديل سلالة الخيل" : "إضافة سلالة خيل جديدة"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
              اسم السلالة
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عربي أصيل، ثوروبريد، أندلسي..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-[#B8860B] bg-white px-6 py-2.5 text-xs font-bold text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>إلغاء</span>
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-xl bg-[#B8860B] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-2"
            >
              <span>{loading ? "جاري الحفظ..." : "حفظ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
