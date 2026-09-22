"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FeaturePlanItem, FeaturePlanFormData } from "@/features/settings/types";
import { X, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";

export interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FeaturePlanFormData, id?: string | number) => Promise<void>;
  plan?: FeaturePlanItem | null;
}

export function PlanModal({ isOpen, onClose, onSave, plan }: PlanModalProps) {
  const { isRTL } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FeaturePlanFormData>({
    name: "",
    price: 0,
    duration_Value: 30,
    duration_Type: 1,
    type: 1,
    quantity_Limit: 5,
    is_Lifetime: false,
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        price: plan.price || 0,
        duration_Value: plan.duration_Value ?? (plan.durationInDays || 30),
        duration_Type: plan.duration_Type ?? 1,
        type: plan.type ?? 1,
        quantity_Limit: plan.quantity_Limit ?? (plan.maxAuctions || plan.maxProducts || 5),
        is_Lifetime: Boolean(plan.is_Lifetime),
        description: plan.description || "",
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        duration_Value: 30,
        duration_Type: 1,
        type: 1,
        quantity_Limit: 5,
        is_Lifetime: false,
        description: "",
      });
    }
    setError(null);
  }, [plan, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("يرجى إدخال اسم الباقة");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(formData, plan?.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الباقة";
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
        className="relative z-10 w-full max-w-2xl transform rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto"
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
            {plan ? "تعديل باقة الميزات" : "اضافة باقة جديدة"}
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1">تخصيص حدود المزادات والمنتجات والبث المباشر</p>
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
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">اسم الباقة (name) *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: باقة المزادات الفضية"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">السعر (price) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="مثال: 499"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
                required
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">نوع الباقة (type) *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
              >
                <option value={1}>1 - باقة مزاد (Auction)</option>
                <option value={2}>2 - باقة إعلان وتمييز منتج (Featured Ad)</option>
                <option value={3}>3 - باقة بث مباشر (Live Stream)</option>
                <option value={4}>4 - باقة منتجات (Product Package)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">الحد الأقصى للكمية (quantity_Limit) *</label>
              <input
                type="number"
                value={formData.quantity_Limit}
                onChange={(e) => setFormData({ ...formData, quantity_Limit: Number(e.target.value) })}
                placeholder="مثال: 10"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
                required
                min={0}
              />
            </div>
          </div>

          {!formData.is_Lifetime && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">قيمة المدة (duration_Value) *</label>
                <input
                  type="number"
                  value={formData.duration_Value}
                  onChange={(e) => setFormData({ ...formData, duration_Value: Number(e.target.value) })}
                  placeholder="مثال: 30"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
                  required
                  min={1}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">نوع المدة (duration_Type) *</label>
                <select
                  value={formData.duration_Type}
                  onChange={(e) => setFormData({ ...formData, duration_Type: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
                >
                  <option value={1}>1 - يوم (Days)</option>
                  <option value={2}>2 - أسبوع (Weeks)</option>
                  <option value={3}>3 - شهر (Months)</option>
                  <option value={4}>4 - سنة (Years)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">وصف الباقة (description)</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="نبذة مختصرة عن المستفيدين من هذه الباقة..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors resize-none"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-[#1E1E2D] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_Lifetime}
                onChange={(e) => setFormData({ ...formData, is_Lifetime: e.target.checked })}
                className="w-4 h-4 rounded text-[#B8860B] focus:ring-[#B8860B] accent-[#B8860B]"
              />
              <span>اشتراك دائم مدى الحياة (is_Lifetime)</span>
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
              <span>{saving ? "جاري الحفظ..." : "حفظ الباقة"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
