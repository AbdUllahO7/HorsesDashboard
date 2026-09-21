"use client";

import React, { useEffect } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";

export interface ApproveAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  className?: string;
}

export function ApproveAccountModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  className,
}: ApproveAccountModalProps) {
  const { isRTL } = useTranslation();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl transition-all duration-300",
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

        {/* Circular Gold Icon with Checkmark */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#B8860B] text-white shadow-md mb-5">
          <Check className="h-10 w-10 stroke-[3]" />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-bold text-[#1E1E2D] mb-1.5">
          تأكيد قبول المستخدم
        </h3>
        <p className="text-xs text-[#8E8E93] mb-6">
          هل أنت متأكد من قبول المستخدم وتفعيل حسابه ضمن النظام
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-[#B8860B] py-2.5 px-6 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {loading ? "جاري القبول..." : "قبول"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] py-2.5 px-6 text-xs font-bold text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1E1E2D] transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
