"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, FileText } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl?: string;
  userName?: string;
  className?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  userName,
  className,
}: DocumentPreviewModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl transition-all duration-300",
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

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1E1E2D] mb-1">
          {title}
        </h3>
        {userName && (
          <p className="text-xs text-[#8E8E93] mb-4">
            المستخدم: {userName}
          </p>
        )}

        {/* Image / Document Container */}
        <div className="relative mx-auto mt-3 h-72 w-full overflow-hidden rounded-2xl border border-[#EDEEF2] bg-[#FAF4E8] flex items-center justify-center">
          {imageUrl && !imageUrl.includes(".jpg") ? (
            <div className="relative h-full w-full">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#EADBBD] text-[#A6883C] shadow-2xs">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E1E2D]">{title}</p>
                <p className="text-[11px] text-[#8E8E93] mt-1">
                  وثيقة الهوية الرسمية المسجلة في النظام
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Close Action */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#B8860B] px-8 py-2 text-xs font-bold text-white hover:bg-[#A37508] transition-colors cursor-pointer shadow-2xs"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
}
