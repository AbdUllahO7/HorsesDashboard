"use client";

import React, { useEffect } from "react";
import {
  X,
  Check,
  ShieldAlert,
  User,
  Phone,
  Mail,
  FileText,
  Video,
  Clock,
  Tag,
  AlertCircle,
  Store,
  Loader2,
} from "lucide-react";
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
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
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
        {/* Close Button Top (RTL sensitive) */}
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

        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-[#EDEEF2] mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C] shrink-0 shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-[#1E1E2D]">تفاصيل البلاغ</h2>
              <span className="text-xs font-mono font-bold bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD] px-2.5 py-0.5 rounded-full">
                #{report.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF9EB] text-[#D97706] border border-[#FDE68A]">
                {report.statusLabel || "قيد المراجعة"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#8E8E93] flex-wrap pt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>تاريخ البلاغ: <strong>{report.createdAt}</strong></span>
              </span>
              {report.liveStreamId && (
                <span className="flex items-center gap-1 font-semibold text-[#A6883C]">
                  <Video className="w-3.5 h-3.5" />
                  <span>رقم البث المباشر: #{report.liveStreamId}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Parties Grid (مقدم البلاغ والمبلغ عليه) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Reporter Card (مقدم البلاغ) */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-[#FAF8F2] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADBBD]/60">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E1E2D]">
                <div className="w-6 h-6 rounded-lg bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C]">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span>مقدم البلاغ (الشاكي)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#EADBBD] text-[#A6883C]">
                مستخدم
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8E8E93] shrink-0">الاسم:</span>
                <span className="font-bold text-[#1E1E2D] truncate">
                  {report.reporterName || "مستخدم المنصة"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8E8E93] shrink-0">الهاتف:</span>
                <span className="font-mono font-bold text-[#1E1E2D] direction-ltr" dir="ltr">
                  {report.reporterPhone || "0595121088"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8E8E93] shrink-0">البريد:</span>
                <span className="font-medium text-[#1E1E2D] truncate" dir="ltr">
                  {report.reporterEmail || "reporter@gmail.com"}
                </span>
              </div>
            </div>
          </div>

          {/* Reported User Card (المبلغ عليه) */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-red-200">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <div className="w-6 h-6 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                  <Store className="h-3.5 w-3.5" />
                </div>
                <span>المبلغ عليه (المشكو في حقه)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-red-200 text-red-700">
                بائع / إسطبل
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8E8E93] shrink-0">الاسم:</span>
                <span className="font-bold text-red-900 truncate">
                  {report.reportedUserName || "إسطبل الأريج"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8E8E93] shrink-0">الهاتف:</span>
                <span className="font-mono font-bold text-[#1E1E2D] direction-ltr" dir="ltr">
                  {report.reportedUserPhone || "0595121099"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#8E8E93] shrink-0">البريد:</span>
                <span className="font-medium text-[#1E1E2D] truncate" dir="ltr">
                  {report.reportedUserEmail || "reported@gmail.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reason & Violation Details Box */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 mb-6 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDEEF2]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E1E2D]">
              <FileText className="h-4 w-4 text-[#A6883C]" />
              <span>سبب البلاغ وتفاصيل المخالفة</span>
            </div>
            {(report.reasonLabel || report.category) && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#A6883C] bg-[#FAF4E6] border border-[#EADBBD] px-2.5 py-1 rounded-lg shadow-2xs">
                <Tag className="w-3 h-3" />
                <span>{report.reasonLabel || report.category}</span>
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2] text-xs text-[#1E1E2D] leading-relaxed">
            <p className="font-medium">{report.reason}</p>
            {report.notes && report.notes !== report.reason && (
              <p className="mt-2 text-[11px] text-[#8E8E93] pt-2 border-t border-[#EDEEF2]">
                ملاحظات إضافية: {report.notes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-[#EDEEF2]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-bold text-[#6B7280] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            إغلاق
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onDismiss && onDismiss(report)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#EF4444] bg-white text-xs font-bold text-[#EF4444] hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span>رفض وتجاهل البلاغ</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onResolve && onResolve(report)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#10B981] text-xs font-bold text-white hover:bg-[#059669] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>قبول البلاغ وإيقاف البث</span>
          </button>
        </div>
      </div>
    </div>
  );
}
