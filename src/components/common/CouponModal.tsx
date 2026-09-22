"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CouponItem, CouponFormData } from "@/features/settings/types";
import { X, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";

export interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CouponFormData, id?: string | number) => Promise<void>;
  coupon?: CouponItem | null;
}

export function CouponModal({ isOpen, onClose, onSave, coupon }: CouponModalProps) {
  const { isRTL } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    value: 10,
    isPercentage: true,
    discountType: "percentage",
    discountValue: 10,
    expireDate: "",
    maxUsage: 100,
    usedCount: 0,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (coupon) {
      const isPerc = coupon.isPercentage !== undefined
        ? coupon.isPercentage
        : coupon.discountType === "percentage";
      const val = coupon.value ?? coupon.discountValue ?? 10;
      const rawExp = coupon.expireDate || coupon.expiryDate || "";
      const expDate = rawExp ? rawExp.split("T")[0] : "";
      const maxU = coupon.maxUsage ?? coupon.usageLimit ?? 100;
      const usedC = coupon.usedCount ?? coupon.usageCount ?? 0;

      setFormData({
        code: coupon.code || "",
        value: val,
        discountValue: val,
        isPercentage: isPerc,
        discountType: isPerc ? "percentage" : "fixed",
        expireDate: expDate,
        expiryDate: expDate,
        maxUsage: maxU,
        usageLimit: maxU,
        usedCount: usedC,
        isActive: coupon.isActive ?? true,
      });
    } else {
      setFormData({
        code: "",
        value: 10,
        discountValue: 10,
        isPercentage: true,
        discountType: "percentage",
        expireDate: "",
        expiryDate: "",
        maxUsage: 100,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      });
    }
    setError(null);
  }, [coupon, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setError("يرجى إدخال كود الكوبون");
      return;
    }
    const val = Number(formData.value ?? formData.discountValue ?? 0);
    if (val <= 0) {
      setError("يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const isPerc = formData.isPercentage !== undefined
        ? Boolean(formData.isPercentage)
        : formData.discountType === "percentage";
      const exp = formData.expireDate || formData.expiryDate;
      const expireDateIso = exp
        ? (exp.includes("T") ? exp : new Date(exp).toISOString())
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await onSave(
        {
          code: formData.code.toUpperCase().trim(),
          value: val,
          isPercentage: isPerc,
          expireDate: expireDateIso,
          maxUsage: Number(formData.maxUsage ?? formData.usageLimit ?? 100),
          usedCount: Number(formData.usedCount ?? 0),
          isActive: formData.isActive ?? true,
        },
        coupon?.id
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الكوبون";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-xl transform rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto"
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

        {/* Modal Title */}
        <div className="text-center mb-6 pt-1">
          <h2 className="text-xl font-bold text-[#B8860B]">
            {coupon ? "تعديل كوبون الخصم" : "اضافة كوبون جديد"}
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1">تحديد نسبة الخصم والحدود وتاريخ الصلاحية</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">كود الكوبون *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="مثال: HORSES10"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] uppercase font-mono transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">نوع الخصم</label>
              <select
                value={formData.isPercentage ? "percentage" : "fixed"}
                onChange={(e) => {
                  const isPerc = e.target.value === "percentage";
                  setFormData({
                    ...formData,
                    isPercentage: isPerc,
                    discountType: isPerc ? "percentage" : "fixed",
                  });
                }}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">
                قيمة الخصم {formData.isPercentage ? "(%)" : ""} *
              </label>
              <input
                type="number"
                step="any"
                value={formData.value}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFormData({ ...formData, value: v, discountValue: v });
                }}
                placeholder="مثال: 15"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
                required
                min={0}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">أقصى عدد لاستخدام الكوبون (maxUsage)</label>
              <input
                type="number"
                value={formData.maxUsage ?? formData.usageLimit ?? ""}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFormData({ ...formData, maxUsage: v, usageLimit: v });
                }}
                placeholder="مثال: 100"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">تاريخ الانتهاء (expireDate)</label>
            <input
              type="date"
              value={formData.expireDate || formData.expiryDate || ""}
              onChange={(e) => setFormData({ ...formData, expireDate: e.target.value, expiryDate: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-[#1E1E2D] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-[#B8860B] focus:ring-[#B8860B] accent-[#B8860B]"
              />
              <span>تفعيل الكوبون فور الإنشاء</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDEEF2]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#B8860B] bg-white px-8 py-2.5 text-xs font-bold text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>إلغاء</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#B8860B] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-2"
            >
              <span>{saving ? "جاري الحفظ..." : "حفظ الكوبون"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
