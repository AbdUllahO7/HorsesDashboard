"use client";

import React, { useEffect } from "react";
import { X, Check, ShieldAlert, User, Phone, Mail, FileText } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { ReportTicketItem } from "@/features/reports/types";

export interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportTicketItem | null;
  onResolve?: (report: ReportTicketItem) => Promise<void> | void;
  onDismiss?: (report: ReportTicketItem) => Promise<void> | void;
  loading?: boolean;
  className?: string;
}

export function ReportDetailsModal({
  isOpen,
  onClose,
  report,
  onResolve,
  onDismiss,
  loading = false,
  className,
}: ReportDetailsModalProps) {
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

  if (!isOpen || !report) return null;

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
          "relative z-10 w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto",
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

        {/* Modal Header */}
        <div className="text-center mb-6 pt-1">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold text-[#B8860B]">تفاصيل البلاغ</h2>
          </div>
          <p className="text-xs text-[#8E8E93] mt-1">
            تاريخ البلاغ: {report.createdAt}
          </p>
        </div>

        {/* Parties Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Reporter Card */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-[#FAF4E8]/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E1E2D] pb-1 border-b border-[#EADBBD]/40">
              <User className="h-4 w-4 text-[#A6883C]" />
              <span>مقدم البلاغ</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#6B7280]">
              <p><span className="text-[#1E1E2D] font-semibold">الاسم:</span> {report.reporterName}</p>
              <p><span className="text-[#1E1E2D] font-semibold">الهاتف:</span> <span dir="ltr">{report.reporterPhone || "0595121088"}</span></p>
              <p><span className="text-[#1E1E2D] font-semibold">البريد:</span> {report.reporterEmail || "user@gmail.com"}</p>
            </div>
          </div>

          {/* Reported User Card */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-rose-50/40 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] pb-1 border-b border-rose-100">
              <ShieldAlert className="h-4 w-4 text-[#DC2626]" />
              <span>المبلغ عليه</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#6B7280]">
              <p><span className="text-[#1E1E2D] font-semibold">الاسم:</span> {report.reportedUserName}</p>
              <p><span className="text-[#1E1E2D] font-semibold">الهاتف:</span> <span dir="ltr">{report.reportedUserPhone || "0595121099"}</span></p>
              <p><span className="text-[#1E1E2D] font-semibold">البريد:</span> {report.reportedUserEmail || "reported@gmail.com"}</p>
            </div>
          </div>
        </div>

        {/* Reason Card */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 mb-6 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E1E2D]">
            <FileText className="h-4 w-4 text-[#A6883C]" />
            <span>سبب البلاغ والملاحظات</span>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed pt-1">
            {report.reason}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F0F2F5]">
          <button
            type="button"
            disabled={loading}
            onClick={() => onResolve && onResolve(report)}
            className="flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2 text-xs font-bold text-white hover:bg-[#059669] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Check className="h-4 w-4" />
            <span>قبول البلاغ</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onDismiss && onDismiss(report)}
            className="flex items-center gap-2 rounded-xl border border-[#EF4444] bg-white px-5 py-2 text-xs font-bold text-[#EF4444] hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span>رفض البلاغ</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2 text-xs font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
