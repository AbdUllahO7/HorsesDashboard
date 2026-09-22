"use client";

import React, { useEffect } from "react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { LivestockSeller, SellerStatus } from "@/features/listings/types";
import { StatusBadge } from "./StatusBadge";
import { ToggleSwitch } from "./ToggleSwitch";
import { X } from "lucide-react";

export interface SellerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: LivestockSeller | null;
  onToggleAuctions?: (sellerId: string, enabled: boolean) => void;
  onToggleLiveStream?: (sellerId: string, enabled: boolean) => void;
  onStatusChange?: (sellerId: string, status: SellerStatus) => void;
  className?: string;
}

export function SellerDetailsModal({
  isOpen,
  onClose,
  seller,
  onToggleAuctions,
  onToggleLiveStream,
  onStatusChange,
  className,
}: SellerDetailsModalProps) {
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

  if (!isOpen || !seller) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-[680px] rounded-[28px] bg-white p-7 sm:p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto",
          className
        )}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className={cn(
            "absolute top-6 flex h-7 w-7 items-center justify-center rounded-full border border-[#1E1E2D] text-[#1E1E2D] hover:bg-stone-100 transition-colors cursor-pointer",
            isRTL ? "left-6" : "right-6"
          )}
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {/* 1. Header: Seller Title, Badge & Date */}
        <div className="text-center mb-6 pt-1">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#B8860B]">{seller.name}</h2>
            <StatusBadge status={seller.status} />
          </div>
          <p className="text-xs text-[#8E8E93] mt-1.5 font-medium">
            تاريخ الإنضمام ١٤٤٥/٨/٥ هـ
          </p>
        </div>

        {/* 2. Top 3 Stat Cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          {/* Card 1: Total Auctions */}
          <div className="rounded-2xl bg-[#EBF3FC] p-4 text-center">
            <p className="text-xs text-[#4A4E5A] font-medium">إجمالي المزادات</p>
            <p className="text-2xl font-bold text-[#1E1E2D] mt-1">{seller.auctionsCount || 28}</p>
          </div>

          {/* Card 2: Active Auctions */}
          <div className="rounded-2xl bg-[#ECF6ED] p-4 text-center">
            <p className="text-xs text-[#4A4E5A] font-medium">المزادات النشطة</p>
            <p className="text-2xl font-bold text-[#10B981] mt-1">3458</p>
          </div>

          {/* Card 3: Completed Auctions */}
          <div className="rounded-2xl bg-[#FDF7EA] p-4 text-center">
            <p className="text-xs text-[#4A4E5A] font-medium">المزادات المكتملة</p>
            <p className="text-2xl font-bold text-[#B8860B] mt-1">24</p>
          </div>
        </div>

        {/* 3. Middle Section: Related Info & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-5">
          {/* Right Box: Related Information (7 cols) */}
          <div className="sm:col-span-7 rounded-2xl border border-[#EDEEF2] bg-white p-5 text-right flex flex-col justify-between">
            <h3 className="text-sm font-bold text-[#1E1E2D] mb-3">المعلومات ذات الصلة</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-start gap-1">
                <span className="text-[#8E8E93]">البريد الإلكتروني :</span>
                <span className="font-semibold text-[#1E1E2D]">{seller.email || "info@shepherdsupply.com"}</span>
              </div>
              <div className="flex items-center justify-start gap-1">
                <span className="text-[#8E8E93]">الهاتف :</span>
                <span className="font-semibold text-[#1E1E2D]" dir="ltr">{seller.phone || "+966 50 111 2222"}</span>
              </div>
              <div className="leading-relaxed">
                <span className="text-[#8E8E93] ml-1">العنوان :</span>
                <span className="font-medium text-[#1E1E2D]">شارع التجارة 456، المنطقة التجارية، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Left Box: Actions (5 cols) */}
          <div className="sm:col-span-5 rounded-2xl border border-[#EDEEF2] bg-white p-5 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-[#1E1E2D] mb-3 text-right">الإجراءات</h3>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onStatusChange?.(seller.id, "inactive")}
                className="w-full rounded-xl border border-[#F87171] bg-white py-2.5 px-4 text-xs font-bold text-[#EF4444] hover:bg-rose-50 transition-colors cursor-pointer"
              >
                تعطيل مؤقت
              </button>
              <button
                type="button"
                onClick={() => onStatusChange?.(seller.id, "blocked")}
                className="w-full rounded-xl border border-[#EF4444] bg-white py-2.5 px-4 text-xs font-bold text-[#DC2626] hover:bg-rose-50 transition-colors cursor-pointer"
              >
                إيقاف نهائي
              </button>
            </div>
          </div>
        </div>

        {/* 4. Bottom Section: Feature Permissions Toggles */}
        <div className="space-y-3">
          {/* Row 1: Auctions Permission */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EDEEF2] bg-white p-4">
            <div className="text-right">
              <h4 className="text-xs font-bold text-[#1E1E2D]">المزادات</h4>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                السماح لهذا البائع بإنشاء وإدارة المزادات
              </p>
            </div>
            <ToggleSwitch
              checked={seller.isAuctionsEnabled}
              onChange={(val) => onToggleAuctions?.(seller.id, val)}
              color="green"
            />
          </div>

          {/* Row 2: Live Stream Permission */}
          <div className="flex items-center justify-between rounded-2xl border border-[#EDEEF2] bg-white p-4">
            <div className="text-right">
              <h4 className="text-xs font-bold text-[#1E1E2D]">البث المباشر</h4>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                السماح لهذا البائع بالبث المباشر
              </p>
            </div>
            <ToggleSwitch
              checked={seller.isLiveStreamEnabled}
              onChange={(val) => onToggleLiveStream?.(seller.id, val)}
              color="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

