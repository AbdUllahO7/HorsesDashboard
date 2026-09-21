"use client";

import React, { useEffect } from "react";
import { X, Check } from "lucide-react";
import { ComplaintReviewItem } from "@/features/reviews/types";
import { StatusBadge } from "./StatusBadge";

export interface ComplaintDetailsModalProps {
  complaint: ComplaintReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (id: string) => Promise<void> | void;
  onReject?: (id: string) => Promise<void> | void;
  actionLoading?: boolean;
}

export function ComplaintDetailsModal({
  complaint,
  isOpen,
  onClose,
  onResolve,
  onReject,
  actionLoading = false,
}: ComplaintDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300"
      >
        {/* Close Button Top Left (RTL) */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1E1E2D] transition-colors"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#B59E5F]">
              {complaint.subject || "وصف مضلل للمزاد"}
            </h2>
            <StatusBadge status={complaint.status} customLabel={complaint.statusLabel} />
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1.5 font-medium">
            تاريخ الإندمام {complaint.joinedDateHijri || complaint.joinedDate}
          </p>
        </div>

        {/* Cards Container */}
        <div className="space-y-4">
          {/* Top Card: Details & Actions */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 sm:p-6 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Actions Column (Left in LTR, Right in RTL depending on layout) */}
              <div className="md:col-span-1 flex flex-col gap-2.5 order-2 md:order-1">
                <h4 className="text-xs font-bold text-[#1E1E2D] text-center mb-1">الإجراءات</h4>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onResolve && onResolve(complaint.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#10B981] bg-white px-3 py-2 text-xs font-bold text-[#10B981] hover:bg-[#E8F8F0] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-4 w-4 text-[#10B981]" strokeWidth={2.2} />
                  <span>وضع علامة كمحلول</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onReject && onReject(complaint.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#EF4444] bg-white px-3 py-2 text-xs font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-4 w-4 text-[#EF4444]" strokeWidth={2.2} />
                  <span>رفض الشكوى</span>
                </button>
              </div>

              {/* Complaint Text Details */}
              <div className="md:col-span-2 space-y-2 order-1 md:order-2">
                <h4 className="text-xs font-bold text-[#1E1E2D]">تفاصيل الشكوى</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {complaint.description ||
                    "كان يذكر إعلان المزاد أن عمر الأغنام عامين، ولكن عند التسليم بدت الأغنام أكبر سناً بكثير. حالة الحيوانات لا تتطابق مع الصور التي قدمت في القائمة. أشعر أن هذا إعلان كاذب وأود التحقيق في هذا الأمر."}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Card: Related Information */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <h4 className="text-xs font-bold text-[#1E1E2D] mb-1">المعلومات ذات الصلة</h4>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="font-semibold text-[#1E1E2D]">اسم التاجر :</span>
                <span>{complaint.sellerStore || complaint.sellerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="font-semibold text-[#1E1E2D]">اسم العميل :</span>
                <span>{complaint.customerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="font-semibold text-[#1E1E2D]">رقم الجوال :</span>
                <span dir="ltr">{complaint.customerPhone || "+966500000000"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
