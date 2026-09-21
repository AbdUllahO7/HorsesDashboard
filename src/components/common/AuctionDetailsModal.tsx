"use client";

import React, { useEffect } from "react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { AuctionTableItem } from "@/features/auctions/types";
import { StatusBadge } from "./StatusBadge";
import { X, Gavel, Calendar, User, Radio, DollarSign } from "lucide-react";

export interface AuctionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: AuctionTableItem | null;
  onToggleLive?: (auction: AuctionTableItem) => void;
  className?: string;
}

export function AuctionDetailsModal({
  isOpen,
  onClose,
  auction,
  onToggleLive,
  className,
}: AuctionDetailsModalProps) {
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

  if (!isOpen || !auction) return null;

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

        {/* 1. Header: Auction Title, Badge & Date */}
        <div className="text-center mb-6 pt-1">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#B8860B]">{auction.title}</h2>
            <StatusBadge status={auction.status} />
          </div>
          <p className="text-xs text-[#8E8E93] mt-1.5 font-medium">
            تاريخ الإنشاء {auction.createdAt}
          </p>
        </div>

        {/* 2. Top Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl bg-[#FAF4E8] p-3.5 text-center border border-[#EADBBD]">
            <p className="text-xs text-[#8E8E93] font-medium">إجمالي المزايدات</p>
            <p className="text-xl font-bold text-[#A6883C] mt-1">{auction.totalBids}</p>
          </div>
          <div className="rounded-2xl bg-[#ECF6ED] p-3.5 text-center border border-[#A7F3D0]">
            <p className="text-xs text-[#8E8E93] font-medium">السعر الحالي</p>
            <p className="text-xl font-bold text-[#10B981] mt-1">{auction.currentBid ? `${auction.currentBid} ر.س` : "١٢٠,٠٠٠ ر.س"}</p>
          </div>
          <div className="rounded-2xl bg-[#EBF3FC] p-3.5 text-center border border-[#CBD5E1]">
            <p className="text-xs text-[#8E8E93] font-medium">سعر البداية</p>
            <p className="text-xl font-bold text-[#2563EB] mt-1">{auction.startingPrice ? `${auction.startingPrice} ر.س` : "٥٠,٠٠٠ ر.س"}</p>
          </div>
          <div className="rounded-2xl bg-[#FDF7EA] p-3.5 text-center border border-[#FDE68A]">
            <p className="text-xs text-[#8E8E93] font-medium">البث المباشر</p>
            <p className={cn("text-sm font-bold mt-1.5", auction.isLiveEnabled ? "text-[#10B981]" : "text-[#8E8E93]")}>
              {auction.isLiveEnabled ? "مفعل 🟢" : "معطل ⚪"}
            </p>
          </div>
        </div>

        {/* 3. Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Related Information (7 cols) */}
          <div className="sm:col-span-7 rounded-2xl border border-[#EDEEF2] bg-white p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1E1E2D]">المعلومات ذات الصلة</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">اسم البائع :</span>
                <span className="font-semibold text-[#1E1E2D]">{auction.sellerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gavel className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">التصنيف :</span>
                <span className="font-semibold text-[#1E1E2D]">{auction.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">تاريخ الإنشاء :</span>
                <span className="font-medium text-[#1E1E2D]">{auction.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Actions (5 cols) */}
          <div className="sm:col-span-5 rounded-2xl border border-[#EDEEF2] bg-white p-5 flex flex-col justify-between space-y-3">
            <h3 className="text-xs font-bold text-[#1E1E2D]">الإجراءات</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onToggleLive?.(auction)}
                className={cn(
                  "w-full rounded-xl py-2 px-3 text-xs font-bold transition-colors cursor-pointer border flex items-center justify-center gap-1.5",
                  auction.isLiveEnabled
                    ? "border-[#EF4444] text-[#EF4444] bg-white hover:bg-rose-50"
                    : "border-[#10B981] text-[#10B981] bg-white hover:bg-emerald-50"
                )}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>{auction.isLiveEnabled ? "إيقاف البث المباشر" : "تفعيل البث المباشر"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
