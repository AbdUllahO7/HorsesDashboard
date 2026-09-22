"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, UploadCloud, XCircle } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { AdItem, AdFormData, AdType } from "@/features/ads/types";

export interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdFormData, id?: string) => Promise<void> | void;
  ad?: AdItem | null;
  loading?: boolean;
  className?: string;
}

export function AdModal({
  isOpen,
  onClose,
  onSave,
  ad,
  loading = false,
  className,
}: AdModalProps) {
  const { isRTL } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    type: "popup",
    duration: "5 ثواني",
    imageUrl: "",
  });

  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.categoryName || ad.title || "",
        type: ad.type || "popup",
        duration: ad.duration || "5 ثواني",
        imageUrl: ad.imageUrl || "",
      });
    } else {
      setFormData({
        title: "",
        type: "popup",
        duration: "5 ثواني",
        imageUrl: "",
      });
    }
  }, [ad, isOpen]);

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
    if (!formData.title.trim()) return;
    await onSave(formData, ad?.id !== undefined ? String(ad.id) : undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, imageUrl: url, imageFile: file }));
    }
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

        {/* Modal Title in Gold */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#B8860B]">
            {ad ? "تعديل الاعلان" : "اضافة اعلان جديد"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Image Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-[#FAFAFA] hover:bg-[#FAF4E8]/40 hover:border-[#B8860B] transition-all p-8 cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {formData.imageUrl ? (
              <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-[#EDEEF2] bg-[#FAF4E8] flex items-center justify-center">
                <img
                  src={formData.imageUrl}
                  alt="معاينة الإعلان"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded-md">
                  انقر للتغيير
                </span>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-2xs group-hover:scale-105 transition-transform text-[#8E8E93] group-hover:text-[#B8860B] mb-2">
                  <UploadCloud className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <p className="text-xs text-[#8E8E93] group-hover:text-[#1E1E2D] font-medium transition-colors">
                  ارفع صورة الاعلان
                </p>
              </>
            )}
          </div>

          {/* Form Fields: Category Name & Ad Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category / Ad Name */}
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
                اسم التصنيف
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="اسم التصنيف"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
              />
            </div>

            {/* Ad Type */}
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
                نوع الاعلان
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as AdType,
                  }))
                }
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
              >
                <option value="popup">popup</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#B8860B] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <span>{ad ? "حفظ" : "اضافة"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-[#B8860B] bg-white px-8 py-2.5 text-xs font-bold text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>إلغاء</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
