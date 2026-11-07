"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, RotateCcw, AlertCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { PaymentRequiringReviewItem } from "@/features/invoices/types";

export interface ResolvePaymentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRequiringReviewItem | null;
  onConfirm: (paymentId: string | number, action: string, notes?: string) => Promise<void>;
  loading?: boolean;
}

export function ResolvePaymentReviewModal({
  isOpen,
  onClose,
  payment,
  onConfirm,
  loading = false,
}: ResolvePaymentReviewModalProps) {
  const { isRTL } = useTranslation();
  const [action, setAction] = useState<"Approve" | "Reject" | "Refund">("Approve");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAction("Approve");
      setNotes("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await onConfirm(payment.paymentId || payment.id, action, notes.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء معالجة الدفعة";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg transform rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300"
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

        {/* Title */}
        <div className="text-center mb-6 pt-1">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD] mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#1E1E2D]">
            معالجة الدفعة المعلقة
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1">
            مراجعة حالة العملية وتحديد القرار الإداري النهائي
          </p>
        </div>

        {/* Payment Summary Box */}
        <div className="rounded-2xl bg-[#F8F9FA] border border-[#EDEEF2] p-4 mb-5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">رقم الدفعة:</span>
            <span className="font-mono font-bold text-[#1E1E2D]">{payment.paymentId || payment.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">العميل:</span>
            <span className="font-semibold text-[#1E1E2D]">{payment.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">المبلغ:</span>
            <span className="font-bold text-[#A6883C]" dir="ltr">
              {Number(payment.amount).toLocaleString()} {payment.currency || "KWD"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">سبب المراجعة:</span>
            <span className="font-medium text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
              {payment.reason || "تأخر التحقق من KNET (Pending)"}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Decision Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-2">
              القرار الإداري للدفعة *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction("Approve")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer gap-1.5",
                  action === "Approve"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-2xs"
                    : "border-[#EDEEF2] bg-white text-[#6B7280] hover:bg-[#F8F9FA]"
                )}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>اعتماد الدفع</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("Reject")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer gap-1.5",
                  action === "Reject"
                    ? "border-red-600 bg-red-50 text-red-700 shadow-2xs"
                    : "border-[#EDEEF2] bg-white text-[#6B7280] hover:bg-[#F8F9FA]"
                )}
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>رفض وإلغاء</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("Refund")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer gap-1.5",
                  action === "Refund"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs"
                    : "border-[#EDEEF2] bg-white text-[#6B7280] hover:bg-[#F8F9FA]"
                )}
              >
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>استرجاع المبلغ</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">
              ملاحظات القرار
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل أي تفاصيل تم التحقق منها عبر بوابة الدفع أو كشف الحساب..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#A6883C] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDEEF2]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-[#EDEEF2] bg-[#F8F9FA] px-6 py-2.5 text-xs font-bold text-[#6B7280] hover:bg-[#E5E7EB] transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "rounded-xl px-6 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 shadow-2xs",
                action === "Approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : action === "Reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {loading ? "جاري الحفظ..." : "تأكيد القرار"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

