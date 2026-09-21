"use client";

import React, { useEffect } from "react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { Trash2, Ban, AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export type ConfirmModalVariant = "danger" | "warning" | "gold" | "unban" | "success" | "info";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  variant?: ConfirmModalVariant;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  className?: string;
}

const variantConfig: Record<
  ConfirmModalVariant,
  {
    iconBg: string;
    icon: React.ReactNode;
    confirmBtnClass: string;
    defaultConfirmText: string;
  }
> = {
  danger: {
    iconBg: "bg-[#E04F47]",
    icon: <Trash2 className="h-10 w-10 text-white" strokeWidth={1.8} />,
    confirmBtnClass: "bg-[#E04F47] hover:bg-[#C93B33] text-white",
    defaultConfirmText: "تأكيد الحذف",
  },
  warning: {
    iconBg: "bg-[#B8860B]",
    icon: <Ban className="h-10 w-10 text-white" strokeWidth={2} />,
    confirmBtnClass: "bg-[#B8860B] hover:bg-[#A37508] text-white",
    defaultConfirmText: "تأكيد الحظر",
  },
  unban: {
    iconBg: "bg-[#B8860B]",
    icon: <Ban className="h-10 w-10 text-white" strokeWidth={2} />,
    confirmBtnClass: "bg-[#B8860B] hover:bg-[#A37508] text-white",
    defaultConfirmText: "تأكيد رفع الحظر",
  },
  gold: {
    iconBg: "bg-[#B8860B]",
    icon: <AlertCircle className="h-10 w-10 text-white" strokeWidth={2} />,
    confirmBtnClass: "bg-[#B8860B] hover:bg-[#A37508] text-white",
    defaultConfirmText: "تفعيل",
  },
  success: {
    iconBg: "bg-[#10B981]",
    icon: <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2} />,
    confirmBtnClass: "bg-[#10B981] hover:bg-[#059669] text-white",
    defaultConfirmText: "تأكيد",
  },
  info: {
    iconBg: "bg-[#3B82F6]",
    icon: <AlertTriangle className="h-10 w-10 text-white" strokeWidth={2} />,
    confirmBtnClass: "bg-[#3B82F6] hover:bg-[#2563EB] text-white",
    defaultConfirmText: "موافق",
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "danger",
  confirmText,
  cancelText = "إلغاء",
  loading = false,
  className,
}: ConfirmModalProps) {
  const { isRTL } = useTranslation();
  const config = variantConfig[variant] || variantConfig.danger;

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !loading && onClose()}
      />


      {/* Modal Dialog Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-[480px] rounded-[28px] bg-white p-8 sm:p-10 shadow-2xl transition-all animate-in zoom-in-95 duration-200 text-center",
          className
        )}
      >
        {/* Large Circular Icon Header */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full shadow-sm transition-transform",
              config.iconBg
            )}
          >
            {config.icon}
          </div>
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-[#1E1E2D] mb-3">{title}</h3>

        {/* Modal Description */}
        <div className="text-sm font-normal text-[#4A4E5A] leading-relaxed max-w-sm mx-auto mb-8">
          {description}
        </div>

        {/* Modal Action Buttons (Confirm on right in RTL, Cancel on left in RTL) */}
        <div className="flex items-center justify-center gap-4">
          {/* Confirm Button */}
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50",
              config.confirmBtnClass
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>جاري التنفيذ...</span>
              </>
            ) : (
              <span>{confirmText || config.defaultConfirmText}</span>
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 rounded-full bg-[#F8F9FB] border border-[#EDEEF2] py-3.5 px-6 text-sm font-bold text-[#4A4E5A] hover:bg-[#EFF1F5] transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

