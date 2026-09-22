"use client";

import React, { useEffect } from "react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { ProductItem } from "@/features/listings/types";
import { X, Tag, DollarSign, Calendar, User, MapPin, Trash2, Package } from "lucide-react";

export interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onDelete?: (product: ProductItem) => void;
  className?: string;
}

export function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onDelete,
  className,
}: ProductDetailsModalProps) {
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

  if (!isOpen || !product) return null;

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

        {/* 1. Header */}
        <div className="text-center mb-6 pt-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#B8860B]">{product.name}</h2>
          <p className="text-xs text-[#8E8E93] mt-1 font-medium">
            تاريخ الإضافة: {product.createdAt}
          </p>
        </div>

        {/* 2. Top Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-[#ECF6ED] p-3.5 text-center border border-[#A7F3D0]">
            <p className="text-xs text-[#8E8E93] font-medium">السعر</p>
            <p className="text-xl font-bold text-[#10B981] mt-1">
              {product.price.toLocaleString()} ر.س
            </p>
          </div>
          <div className="rounded-2xl bg-[#FAF4E8] p-3.5 text-center border border-[#EADBBD]">
            <p className="text-xs text-[#8E8E93] font-medium">التصنيف</p>
            <p className="text-sm font-bold text-[#A6883C] mt-2">{product.categoryName || "مستلزمات"}</p>
          </div>
          <div className="rounded-2xl bg-[#EBF3FC] p-3.5 text-center border border-[#CBD5E1]">
            <p className="text-xs text-[#8E8E93] font-medium">الحالة</p>
            <p className="text-sm font-bold text-[#2563EB] mt-2">
              {product.isActive ? "معروض للبيع 🟢" : "غير نشط ⚪"}
            </p>
          </div>
        </div>

        {/* 3. Product Images */}
        {product.images && product.images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-[#1E1E2D] mb-3">صور المنتج</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border border-[#EDEEF2] bg-[#FAF4E8]"
                >
                  <img
                    src={imgUrl}
                    alt={`Product ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/200x200/F5F1E8/B59E5F?text=Product";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Details Information */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-5 space-y-3 mb-6">
          <h3 className="text-xs font-bold text-[#1E1E2D]">تفاصيل المنتج</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#A6883C]" />
              <span className="text-[#8E8E93]">اسم البائع / المتجر:</span>
              <span className="font-semibold text-[#1E1E2D]">{product.sellerName}</span>
            </div>
            {product.breedName && (
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">السلالة:</span>
                <span className="font-semibold text-[#1E1E2D]">{product.breedName}</span>
              </div>
            )}
            {product.age !== undefined && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">العمر:</span>
                <span className="font-semibold text-[#1E1E2D]">{product.age} سنة</span>
              </div>
            )}
            {product.weight !== undefined && (
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">الوزن:</span>
                <span className="font-semibold text-[#1E1E2D]">{product.weight} كجم</span>
              </div>
            )}
            {product.address && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-[#A6883C]" />
                <span className="text-[#8E8E93]">العنوان / الموقع:</span>
                <span className="font-medium text-[#1E1E2D]">{product.address}</span>
              </div>
            )}
          </div>

          {product.description && (
            <div className="pt-3 border-t border-[#F3F4F8]">
              <span className="text-[#8E8E93] block mb-1">الوصف:</span>
              <p className="text-[#1E1E2D] bg-[#F8F9FA] p-3 rounded-xl leading-relaxed text-xs">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* 5. Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#8E8E93]">
            معرّف المنتج: #{product.id}
          </span>
          <button
            type="button"
            onClick={() => onDelete?.(product)}
            className="rounded-xl border border-[#EF4444] text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>حذف المنتج</span>
          </button>
        </div>
      </div>
    </div>
  );
}
