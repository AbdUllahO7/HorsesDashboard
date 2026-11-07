"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Play,
  FileText,
} from "lucide-react";
import { cn } from "@/core/utils/cn";

export interface MediaItem {
  id: string | number;
  url: string;
  type?: "image" | "video" | "document";
  title?: string;
  thumbnailUrl?: string;
}

export interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
}

export function MediaLightboxModal({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
}: MediaLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      setRotation(0);
    }
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    if (!media.length) return;
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setZoomLevel(1);
    setRotation(0);
  }, [media.length]);

  const handlePrev = useCallback(() => {
    if (!media.length) return;
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setZoomLevel(1);
    setRotation(0);
  }, [media.length]);

  // Keyboard Navigation: Esc to close, Arrows to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") handlePrev(); // RTL
      else if (e.key === "ArrowLeft") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !media.length) return null;

  const currentItem = media[currentIndex] || media[0];

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, z + 0.3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.7, z - 0.3));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white animate-fade-in backdrop-blur-md select-none">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h4 className="text-sm font-bold text-white line-clamp-1">
              {currentItem.title || `وسائط المعاينة (${currentIndex + 1} من ${media.length})`}
            </h4>
            <span className="text-[11px] text-white/60">استخدم الأسهم للتنقل أو عجلة الفأرة</span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="تدوير الصورة"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="السابق"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="التالي"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Display Content based on Type */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          }}
        >
          {currentItem.type === "video" ? (
            <video
              src={currentItem.url}
              controls
              autoPlay
              className="max-h-[72vh] max-w-[85vw] rounded-xl shadow-2xl object-contain bg-black"
            />
          ) : currentItem.type === "document" ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-stone-900 border border-white/20 text-center max-w-lg">
              <FileText className="w-16 h-16 text-[#C88F45] mb-4" />
              <h3 className="text-base font-bold text-white mb-2">وثيقة أو شهادة نسب</h3>
              <p className="text-xs text-white/70 mb-4">{currentItem.title || "وثيقة بصيغة PDF / صورة"}</p>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#6F4526] text-white text-xs font-bold transition-all"
              >
                فتح المستند في تبويب جديد
              </a>
            </div>
          ) : (
            <div className="relative h-[72vh] w-[85vw] max-w-5xl">
              <Image
                src={currentItem.url}
                alt={currentItem.title || "صورة المعاينة"}
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {media.length > 1 && (
        <div className="py-3 px-6 border-t border-white/10 bg-black/60 z-20 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 max-w-full">
            {media.map((item, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className={cn(
                    "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "border-[#C88F45] scale-105 shadow-md shadow-[#C88F45]/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || `صورة ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  {item.type === "video" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
