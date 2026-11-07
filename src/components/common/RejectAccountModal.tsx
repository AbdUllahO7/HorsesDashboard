"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";

export type RejectionActionType = "amendment" | "reject";

export interface RejectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, actionType: RejectionActionType) => Promise<void> | void;
  loading?: boolean;
  className?: string;
  initialActionType?: RejectionActionType;
}

export function RejectAccountModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  className,
  initialActionType = "amendment",
}: RejectAccountModalProps) {
  const { isRTL } = useTranslation();
  const [reason, setReason] = useState<string>("");
  const [actionType, setActionType] = useState<RejectionActionType>(initialActionType);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setActionType(initialActionType);
      setErrorText(null);
    }
  }, [isOpen, initialActionType]);

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

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setErrorText("الملاحظة إجبارية عند اتخاذ هذا القرار لتوضيح السبب للمستخدم");
      return;
    }
    setErrorText(null);
    onConfirm(trimmed, actionType);
  };

  const isAmendment = actionType === "amendment";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
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

        {/* Circular Icon */}
        <div
          className={cn(
            "mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white shadow-md mb-4 transition-colors",
            isAmendment ? "bg-[#D97706]" : "bg-[#DC2626]"
          )}
        >
          {isAmendment ? (
            <RefreshCw className="h-9 w-9 stroke-[2.5]" />
          ) : (
            <AlertTriangle className="h-10 w-10 stroke-[2.5]" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1E1E2D] mb-1.5">
          {isAmendment ? "طلب تعديل المستندات" : "تأكيد رفض طلب التوثيق"}
        </h3>
        <p className="text-xs text-[#8E8E93] mb-4">
          {isAmendment
            ? "سيتم إشعار المستخدم بالملاحظة ليتمكن من إعادة رفع المستندات مجاناً دون دفع جديد"
            : "سيتم رفض طلب التوثيق بالكامل وإشعار المستخدم بالسبب"}
        </p>

        {/* Action Type Selector */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-2xl bg-[#F8F9FA] border border-[#EDEEF2]">
          <button
            type="button"
            onClick={() => setActionType("amendment")}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
              isAmendment
                ? "bg-[#D97706] text-white shadow-xs"
                : "text-[#6B7280] hover:text-[#1E1E2D]"
            )}
          >
            طلب تعديل (إعادة رفع)
          </button>
          <button
            type="button"
            onClick={() => setActionType("reject")}
            className={cn(
              "py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
              !isAmendment
                ? "bg-[#DC2626] text-white shadow-xs"
                : "text-[#6B7280] hover:text-[#1E1E2D]"
            )}
          >
            رفض نهائي
          </button>
        </div>

        {/* Reason Input (MANDATORY) */}
        <div className="text-right mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA]">
              ملاحظة إجبارية *
            </span>
            <label className="block text-xs font-bold text-[#1E1E2D]">
              {isAmendment ? "ملاحظات التعديل المطلوبة" : "سبب الرفض"}
            </label>
          </div>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setErrorText(null);
            }}
            placeholder={
              isAmendment
                ? "مثال: صورة البطاقة غير واضحة من الخلف، يرجى إعادة التقاط صورة واضحة ومطابقة..."
                : "أدخل سبب الرفض الإجباري ليظهر للمستخدم..."
            }
            className={cn(
              "w-full rounded-2xl border bg-white p-3.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none transition-colors resize-none",
              errorText
                ? "border-[#DC2626] focus:border-[#DC2626]"
                : "border-[#E5E7EB] focus:border-[#B8860B]"
            )}
          />
          {errorText && (
            <p className="text-[11px] font-semibold text-[#DC2626] mt-1 text-right">
              {errorText}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={loading || !reason.trim()}
            onClick={handleConfirm}
            className={cn(
              "flex-1 rounded-2xl py-2.5 px-6 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs",
              isAmendment
                ? "bg-[#D97706] hover:bg-[#B45309]"
                : "bg-[#DC2626] hover:bg-[#B91C1C]"
            )}
          >
            {loading
              ? "جاري المعالجة..."
              : isAmendment
              ? "إرسال طلب التعديل"
              : "تأكيد الرفض"}
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
