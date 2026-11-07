"use client";

import React, { useEffect, useState } from "react";
import { X, FileText, Download, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useTranslation } from "@/i18n";
import { accountsService } from "@/features/accounts/services";

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl?: string;
  fileId?: string;
  userName?: string;
  className?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  fileId,
  userName,
  className,
}: DocumentPreviewModalProps) {
  const { isRTL } = useTranslation();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadFile() {
      if (!isOpen) return;

      const target = fileId || imageUrl;
      if (!target) {
        setBlobUrl(null);
        return;
      }

      // Check if it's already a blob/data URL or standard static image
      if (target.startsWith("blob:") || target.startsWith("data:")) {
        setBlobUrl(target);
        setIsPdf(target.includes("application/pdf"));
        return;
      }

      // If it looks like a remote path or fileId, fetch via GetVerificationFile with auth token
      setLoading(true);
      setError(null);
      try {
        const idToFetch = fileId || target.split("/").pop() || target;
        const blob = await accountsService.getVerificationFileBlob(idToFetch);
        if (!active) return;

        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
        setIsPdf(blob.type === "application/pdf" || target.toLowerCase().endsWith(".pdf"));
      } catch {
        // Fallback to direct URL if public or error
        if (!active) return;
        setBlobUrl(target);
        setIsPdf(target.toLowerCase().endsWith(".pdf"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFile();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, imageUrl, fileId]);

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
          "relative z-10 w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl transition-all duration-300",
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
          <p className="text-xs text-[#8E8E93] mb-3">
            المستخدم: <span className="font-semibold text-[#1E1E2D]">{userName}</span>
          </p>
        )}

        {/* Image / Document Container */}
        <div className="relative mx-auto mt-2 h-80 w-full overflow-hidden rounded-2xl border border-[#EDEEF2] bg-[#FAF4E8] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-[#A6883C]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">جاري تحميل المستند بأمان...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <FileText className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-xs text-red-600 font-bold">{error}</p>
            </div>
          ) : blobUrl ? (
            isPdf ? (
              <iframe
                src={blobUrl}
                title={title}
                className="w-full h-full rounded-2xl border-0"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blobUrl}
                alt={title}
                className="max-h-full max-w-full object-contain p-2"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#EADBBD] text-[#A6883C] shadow-2xs">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E1E2D]">{title}</p>
                <p className="text-[11px] text-[#8E8E93] mt-1">
                  وثيقة الهوية الرسمية المسجلة في النظام (PDF / صورة)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {blobUrl && (
            <a
              href={blobUrl}
              download={`${title}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] px-5 py-2 text-xs font-bold text-[#1E1E2D] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#A6883C]" />
              <span>تحميل المستند</span>
            </a>
          )}
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
