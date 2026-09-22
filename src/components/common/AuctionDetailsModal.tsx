"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { AuctionTableItem, AuctionDetailsData } from "@/features/auctions/types";
import { auctionsService } from "@/features/auctions/services";
import { StatusBadge } from "./StatusBadge";
import { X, Gavel, Calendar, User, Radio, DollarSign, MapPin, History, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";

export interface AuctionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: AuctionTableItem | null;
  onAccept?: (auction: AuctionTableItem) => void;
  onStop?: (auction: AuctionTableItem) => void;
  onDelete?: (auction: AuctionTableItem) => void;
  onToggleLive?: (auction: AuctionTableItem) => void;
  className?: string;
}

export function AuctionDetailsModal({
  isOpen,
  onClose,
  auction,
  onAccept,
  onStop,
  onDelete,
  onToggleLive,
  className,
}: AuctionDetailsModalProps) {
  const { isRTL } = useTranslation();
  const [details, setDetails] = useState<AuctionDetailsData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && auction) {
      setLoadingDetails(true);
      auctionsService
        .getAuctionById(auction.id)
        .then((res) => {
          if (res.success && res.data) {
            setDetails(res.data);
          } else {
            setDetails(auction as unknown as AuctionDetailsData);
          }
        })
        .catch(() => {
          setDetails(auction as unknown as AuctionDetailsData);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    } else {
      setDetails(null);
    }
  }, [isOpen, auction]);

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

  const activeData = details || (auction as unknown as AuctionDetailsData);

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
          "relative z-10 w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto",
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
            <h2 className="text-xl sm:text-2xl font-bold text-[#B8860B]">{activeData.title}</h2>
            <StatusBadge status={activeData.status} />
          </div>
          <p className="text-xs text-[#8E8E93] mt-1.5 font-medium">
            تاريخ الإنشاء: {activeData.createdAt}
          </p>
        </div>

        {/* 2. Top Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl bg-[#FAF4E8] p-3.5 text-center border border-[#EADBBD]">
            <p className="text-xs text-[#8E8E93] font-medium">إجمالي المزايدات</p>
            <p className="text-xl font-bold text-[#A6883C] mt-1">{activeData.totalBids}</p>
          </div>
          <div className="rounded-2xl bg-[#ECF6ED] p-3.5 text-center border border-[#A7F3D0]">
            <p className="text-xs text-[#8E8E93] font-medium">أعلى سعر حالي</p>
            <p className="text-xl font-bold text-[#10B981] mt-1">
              {activeData.currentBid?.toLocaleString() || "0"} ر.س
            </p>
          </div>
          <div className="rounded-2xl bg-[#EBF3FC] p-3.5 text-center border border-[#CBD5E1]">
            <p className="text-xs text-[#8E8E93] font-medium">سعر البداية</p>
            <p className="text-xl font-bold text-[#2563EB] mt-1">
              {activeData.startingPrice?.toLocaleString() || "0"} ر.س
            </p>
          </div>
          <div className="rounded-2xl bg-[#FDF7EA] p-3.5 text-center border border-[#FDE68A]">
            <p className="text-xs text-[#8E8E93] font-medium">حالة المزاد</p>
            <p className="text-sm font-bold text-[#B8860B] mt-1.5">
              {activeData.statusLabel || "نشط"}
            </p>
          </div>
        </div>

        {/* 3. Images Gallery (if any) */}
        {activeData.images && activeData.images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-[#1E1E2D] mb-3">صور المزاد</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {activeData.images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative h-28 w-28 shrink-0 rounded-2xl overflow-hidden border border-[#EDEEF2] bg-[#FAF4E8]"
                >
                  <img
                    src={imgUrl}
                    alt={`Auction ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200/F5F1E8/B59E5F?text=Horse";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Details Container */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Information (7 cols) */}
          <div className="sm:col-span-7 rounded-2xl border border-[#EDEEF2] bg-white p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1E1E2D]">معلومات المزاد والبائع</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">اسم البائع:</span>
                <span className="font-semibold text-[#1E1E2D]">{activeData.sellerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gavel className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">التصنيف:</span>
                <span className="font-semibold text-[#1E1E2D]">{activeData.category}</span>
              </div>
              {activeData.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#A6883C]" />
                  <span className="text-[#8E8E93]">الموقع / العنوان:</span>
                  <span className="font-medium text-[#1E1E2D]">{activeData.address}</span>
                </div>
              )}
              {activeData.description && (
                <div className="pt-2 border-t border-[#F3F4F8]">
                  <span className="text-[#8E8E93] block mb-1">الوصف:</span>
                  <p className="text-[#1E1E2D] bg-[#F8F9FA] p-3 rounded-xl leading-relaxed">
                    {activeData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bids History if available */}
            {activeData.bidsHistory && activeData.bidsHistory.length > 0 && (
              <div className="pt-3 border-t border-[#F3F4F8]">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-3.5 w-3.5 text-[#A6883C]" />
                  <h4 className="text-xs font-bold text-[#1E1E2D]">سجل المزايدات الأخيرة</h4>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeData.bidsHistory.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between bg-[#FAF4E8] px-3 py-2 rounded-xl text-xs"
                    >
                      <span className="font-bold text-[#1E1E2D]">{bid.bidderName}</span>
                      <span className="font-bold text-[#10B981]">{bid.amount.toLocaleString()} ر.س</span>
                      <span className="text-[#8E8E93] text-[11px]">{bid.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Controls (5 cols) */}
          <div className="sm:col-span-5 rounded-2xl border border-[#EDEEF2] bg-white p-5 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-[#1E1E2D] mb-3">إجراءات الإدارة</h3>
              <div className="space-y-2">
                {/* Accept Button */}
                {activeData.status !== "active" && (
                  <button
                    type="button"
                    onClick={() => onAccept?.(auction)}
                    className="w-full rounded-xl py-2.5 px-3 text-xs font-bold bg-[#10B981] text-white hover:bg-[#059669] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>قبول واعتماد المزاد</span>
                  </button>
                )}

                {/* Stop Button */}
                {activeData.status === "active" && (
                  <button
                    type="button"
                    onClick={() => onStop?.(auction)}
                    className="w-full rounded-xl py-2.5 px-3 text-xs font-bold border border-[#F59E0B] text-[#D97706] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>إيقاف المزاد</span>
                  </button>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDelete?.(auction)}
                  className="w-full rounded-xl py-2.5 px-3 text-xs font-bold border border-[#EF4444] text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف المزاد</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-[#8E8E93] text-center pt-2 border-t border-[#F3F4F8]">
              معرّف المزاد: #{auction.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
