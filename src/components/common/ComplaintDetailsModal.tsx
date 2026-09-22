"use client";

import React, { useEffect } from "react";
import { X, Check, Trash2, Star, User, Phone, Store, MessageSquare } from "lucide-react";
import { ComplaintReviewItem } from "@/features/reviews/types";
import { StatusBadge } from "./StatusBadge";

export interface ComplaintDetailsModalProps {
  complaint: ComplaintReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (id: string | number) => Promise<void> | void;
  onReject?: (id: string | number) => Promise<void> | void;
  onDeleteReview?: (id: string | number) => Promise<void> | void;
  actionLoading?: boolean;
}

export function ComplaintDetailsModal({
  complaint,
  isOpen,
  onClose,
  onResolve,
  onReject,
  onDeleteReview,
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

  const isComplaint = complaint.type === "complaint";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button Top Left (RTL) */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1E1E2D] transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#B8860B]">
              {complaint.subject}
            </h2>
            <StatusBadge status={complaint.status} customLabel={complaint.statusLabel} />
          </div>
          <p className="text-xs text-[#8E8E93] mt-1.5 font-medium">
            تاريخ الإرسال: {complaint.joinedDate}
          </p>
        </div>

        {/* Rating if review */}
        {complaint.rating && (
          <div className="flex items-center justify-center gap-1.5 mb-6 bg-[#FAF4E8] py-2.5 px-4 rounded-2xl w-fit mx-auto border border-[#EADBBD]">
            <span className="font-bold text-[#1E1E2D] text-sm">{complaint.rating} من 5</span>
            <div className="flex text-[#F59E0B]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(complaint.rating || 0)
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cards Container */}
        <div className="space-y-4">
          {/* Top Card: Details & Actions */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 sm:p-6 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Actions Column */}
              <div className="md:col-span-1 flex flex-col gap-2.5 order-2 md:order-1">
                <h4 className="text-xs font-bold text-[#1E1E2D] text-center mb-1">الإجراءات</h4>

                {isComplaint ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading || complaint.status === "resolved"}
                      onClick={() => onResolve && onResolve(complaint.id)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#10B981] bg-white px-3 py-2 text-xs font-bold text-[#10B981] hover:bg-[#E8F8F0] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="h-4 w-4 text-[#10B981]" strokeWidth={2.2} />
                      <span>وضع علامة كمحلول</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading || complaint.status === "rejected"}
                      onClick={() => onReject && onReject(complaint.id)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#EF4444] bg-white px-3 py-2 text-xs font-bold text-[#EF4444] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X className="h-4 w-4 text-[#EF4444]" strokeWidth={2.2} />
                      <span>رفض الشكوى</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onDeleteReview && onDeleteReview(complaint.id)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#EF4444] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#EF4444] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 text-[#EF4444]" strokeWidth={2} />
                    <span>حذف التقييم</span>
                  </button>
                )}
              </div>

              {/* Text Details */}
              <div className="md:col-span-2 space-y-2 order-1 md:order-2">
                <h4 className="text-xs font-bold text-[#1E1E2D]">
                  {isComplaint ? "تفاصيل الشكوى" : "نص التقييم والملاحظات"}
                </h4>
                <p className="text-xs text-[#4A4E5A] leading-relaxed bg-[#F8F9FA] p-3.5 rounded-xl">
                  {complaint.description || "لا توجد تفاصيل إضافية مسجلة."}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Card: Related Information */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 sm:p-6 shadow-2xs">
            <h4 className="text-xs font-bold text-[#1E1E2D] mb-3">المعلومات ذات الصلة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4A4E5A]">
              <div className="flex items-center gap-2">
                <Store className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">اسم التاجر / المتجر:</span>
                <span className="font-semibold text-[#1E1E2D]">
                  {complaint.sellerStore || complaint.sellerName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">اسم العميل:</span>
                <span className="font-semibold text-[#1E1E2D]">{complaint.customerName}</span>
              </div>
              {complaint.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#A6883C]" />
                  <span className="text-[#8E8E93]">رقم الجوال:</span>
                  <span dir="ltr" className="font-medium text-[#1E1E2D]">
                    {complaint.customerPhone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
