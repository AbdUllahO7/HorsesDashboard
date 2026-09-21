"use client";

import React, { useEffect } from "react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { CustomerUser, CustomerStatus } from "@/features/users/types";
import { StatusBadge } from "./StatusBadge";
import { X, Mail, Phone, MapPin, Activity, ShoppingBag, Gavel, DollarSign } from "lucide-react";

export interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser | null;
  onStatusChange?: (customer: CustomerUser, newStatus: CustomerStatus) => void;
  onDelete?: (customer: CustomerUser) => void;
  className?: string;
}

export function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onStatusChange,
  onDelete,
  className,
}: CustomerDetailsModalProps) {
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

  if (!isOpen || !customer) return null;

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

        {/* 1. Header: Customer Name, Badge & Date */}
        <div className="text-center mb-6 pt-1">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#B8860B]">{customer.name}</h2>
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-xs text-[#8E8E93] mt-1.5 font-medium">
            تاريخ الإنضمام {customer.joinedDate || "١٤٤٥/٨/٥ هـ"}
          </p>
        </div>

        {/* 2. Top Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl bg-[#FAF4E8] p-3.5 text-center border border-[#EADBBD]">
            <p className="text-xs text-[#8E8E93] font-medium">التفاعلات</p>
            <p className="text-xl font-bold text-[#A6883C] mt-1">{customer.interactionsCount}</p>
          </div>
          <div className="rounded-2xl bg-[#EBF3FC] p-3.5 text-center border border-[#CBD5E1]">
            <p className="text-xs text-[#8E8E93] font-medium">المزايدات</p>
            <p className="text-xl font-bold text-[#2563EB] mt-1">{customer.bidsCount ?? 14}</p>
          </div>
          <div className="rounded-2xl bg-[#ECF6ED] p-3.5 text-center border border-[#A7F3D0]">
            <p className="text-xs text-[#8E8E93] font-medium">الطلبات</p>
            <p className="text-xl font-bold text-[#10B981] mt-1">{customer.ordersCount ?? 8}</p>
          </div>
          <div className="rounded-2xl bg-[#FEF2F2] p-3.5 text-center border border-[#FECACA]">
            <p className="text-xs text-[#8E8E93] font-medium">إجمالي المشتريات</p>
            <p className="text-xl font-bold text-[#DC2626] mt-1">{customer.totalSpent ? `${customer.totalSpent} ر.س` : "٤٥,٠٠٠ ر.س"}</p>
          </div>
        </div>

        {/* 3. Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Related Information (7 cols) */}
          <div className="sm:col-span-7 rounded-2xl border border-[#EDEEF2] bg-white p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1E1E2D]">المعلومات ذات الصلة</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">البريد الإلكتروني :</span>
                <span className="font-semibold text-[#1E1E2D]">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">الهاتف :</span>
                <span className="font-semibold text-[#1E1E2D]" dir="ltr">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">العنوان :</span>
                <span className="font-medium text-[#1E1E2D]">{customer.address || "الرياض، المملكة العربية السعودية"}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (5 cols) */}
          <div className="sm:col-span-5 rounded-2xl border border-[#EDEEF2] bg-white p-5 flex flex-col justify-between space-y-3">
            <h3 className="text-xs font-bold text-[#1E1E2D]">الإجراءات السريعة</h3>
            <div className="space-y-2">
              {customer.status === "active" ? (
                <button
                  type="button"
                  onClick={() => onStatusChange?.(customer, "blocked")}
                  className="w-full rounded-xl border border-[#EF4444] bg-white py-2 px-3 text-xs font-bold text-[#EF4444] hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  حظر العميل
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStatusChange?.(customer, "active")}
                  className="w-full rounded-xl border border-[#10B981] bg-white py-2 px-3 text-xs font-bold text-[#10B981] hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  تفعيل الحساب
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete?.(customer)}
                className="w-full rounded-xl border border-[#B8860B] bg-[#FAF4E6] py-2 px-3 text-xs font-bold text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
              >
                حذف الحساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
