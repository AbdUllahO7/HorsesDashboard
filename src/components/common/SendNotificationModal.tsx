"use client";

import React, { useState } from "react";
import { X, XCircle, AlertCircle } from "lucide-react";
import { SendNotificationFormData, NotificationType } from "@/features/notifications/types";
import { apiClient } from "@/core/services/apiClient";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";

export interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (data: SendNotificationFormData) => Promise<void>;
  onSuccess?: () => void;
}

export function SendNotificationModal({
  isOpen,
  onClose,
  onSend,
  onSuccess,
}: SendNotificationModalProps) {
  const { isRTL } = useTranslation();
  const [formData, setFormData] = useState<SendNotificationFormData>({
    title: "",
    message: "",
    targetRole: "all",
    type: "system",
    targetUrl: "",
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setError("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    try {
      setSending(true);
      setError(null);

      if (onSend) {
        await onSend(formData);
      } else {
        await apiClient.post("/Notifications/SendSystemNotification", {
          title: formData.title,
          message: formData.message,
          targetRole: formData.targetRole === "all" ? null : formData.targetRole,
          type: formData.type,
          targetUrl: formData.targetUrl || null,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال الإشعار";
      setError(msg);
    } finally {
      setSending(false);
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
          <h2 className="text-xl font-bold text-[#B8860B]">إرسال إشعار للمستخدمين</h2>
          <p className="text-xs text-[#8E8E93] mt-1">بث إشعار عام أو موجه لفئة محددة من المستخدمين</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">الفئة المستهدفة *</label>
            <select
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as SendNotificationFormData["targetRole"] })}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
            >
              <option value="all">جميع المستخدمين (عام)</option>
              <option value="sellers">بائعي المواشي وأصحاب المرابط والمتاجر</option>
              <option value="customers">العملاء والمشترين فقط</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">نوع الإشعار</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#B8860B] transition-colors cursor-pointer"
            >
              <option value="system">إعلان نظام عام</option>
              <option value="auction">تنبيه مزاد</option>
              <option value="payment">تنبيه مالي / باقات</option>
              <option value="user">تنبيه حسابات</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">عنوان الإشعار *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: تحديث شروط المزايدة أو عرض خاص"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">نص ورسالة الإشعار *</label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="اكتب تفاصيل الإشعار المرسل لهواتف وتطبيقات المستخدمين..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">رابط توجيه (اختياري)</label>
            <input
              type="text"
              value={formData.targetUrl || ""}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              placeholder="مثال: /auctions أو /settings"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#9CA3AF] outline-none focus:border-[#B8860B] transition-colors"
              dir="ltr"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDEEF2]">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-xl border border-[#B8860B] bg-white px-8 py-2.5 text-xs font-bold text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>إلغاء</span>
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-[#B8860B] px-8 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs flex items-center gap-2"
            >
              <span>{sending ? "جاري الإرسال..." : "إرسال الإشعار"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
