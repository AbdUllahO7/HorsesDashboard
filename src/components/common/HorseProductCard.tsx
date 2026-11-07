"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Heart,
  Eye,
  Gavel,
  ShieldCheck,
  Clock,
  Sparkles,
  Play,
  Maximize2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/core/utils/cn";

export interface HorseCardData {
  id: string;
  title: string;
  breed: string; // سلالة (وضح، مجاهيم، صفر، حمر، شعل)
  age?: string; // السن (حوار، مفرود، حق، لقى، جذع، ثني، رباع)
  gender?: "فرس" | "حصان" | "مهرة" | "مهر";
  sellerName: string;
  sellerVerified?: boolean;
  city?: string;
  currentBid: number;
  startingPrice?: number;
  bidCount?: number;
  viewsCount?: number;
  images: string[];
  videoUrl?: string;
  hasPedigree?: boolean; // شهادة نسب وتوثيق
  auctionEndTime?: string; // ISO string
  status: "live" | "upcoming" | "ended" | "buy_now";
}

export interface HorseProductCardProps {
  data: HorseCardData;
  onQuickBid?: (amount: number) => void;
  onOpenGallery?: (initialIndex: number) => void;
  className?: string;
}

export function HorseProductCard({
  data,
  onQuickBid,
  onOpenGallery,
  className,
}: HorseProductCardProps) {
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const images = data.images.length > 0 ? data.images : ["/images/placeholder-horse.jpg"];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const statusBadges = {
    live: {
      label: "مزاد مباشر الآن",
      bg: "bg-rose-600 text-white shadow-xs",
      pulse: true,
    },
    upcoming: {
      label: "مزاد قادم",
      bg: "bg-[#8B5E3C] text-white shadow-2xs",
      pulse: false,
    },
    ended: {
      label: "مزاد منتهي",
      bg: "bg-stone-600 text-white",
      pulse: false,
    },
    buy_now: {
      label: "بيع فوري",
      bg: "bg-[#C88F45] text-white shadow-2xs",
      pulse: false,
    },
  };

  const badge = statusBadges[data.status] || statusBadges.live;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-[#ECE4D9] bg-white overflow-hidden shadow-2xs hover:shadow-md hover:border-[#DFC7B4] transition-all duration-300",
        className
      )}
    >
      {/* Media Image Banner Container */}
      <div className="relative aspect-4/3 w-full bg-[#FAF4EB] overflow-hidden">
        <Image
          src={images[activeImageIdx]}
          alt={data.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for Top Badges Readability */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs",
              badge.bg
            )}
          >
            {badge.pulse && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
            )}
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Action icons on top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            title="إضافة للمفضلة"
          >
            <Heart
              className={cn("w-4 h-4 transition-colors", isFavorite && "fill-rose-500 text-rose-500")}
            />
          </button>

          {/* Expand Lightbox Button */}
          {onOpenGallery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenGallery(activeImageIdx);
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
              title="تكبير ومعاينة الوسائط"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Multi-image indicator and arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === activeImageIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Video badge if video exists */}
        {data.videoUrl && (
          <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>فيديو</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4 text-right">
        {/* Title and Breed */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-[#2F241C] line-clamp-1 group-hover:text-[#8B5E3C] transition-colors">
            {data.title}
          </h3>
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#FAF4EB] text-[#8B5E3C] border border-[#E0CEBE] text-[10px] font-bold">
            {data.breed}
          </span>
        </div>

        {/* Pedigree & Biological attributes chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {data.gender && (
            <span className="px-2 py-0.5 rounded-md bg-[#F8F4EF] text-[#5E4E42] text-[10px] font-medium">
              {data.gender}
            </span>
          )}
          {data.age && (
            <span className="px-2 py-0.5 rounded-md bg-[#F8F4EF] text-[#5E4E42] text-[10px] font-medium">
              السن: {data.age}
            </span>
          )}
          {data.hasPedigree && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-[#C88F45] border border-amber-200 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              <span>أصل وموثّق</span>
            </span>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between py-2 border-t border-[#ECE4D9]/60 text-xs text-[#8F7E72] mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#5E4E42]">{data.sellerName}</span>
            {data.sellerVerified && (
              <span title="بائع موثّق بالهوية الوطنية" className="inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5E3C]" />
              </span>
            )}
          </div>
          {data.city && <span className="text-[11px]">{data.city}</span>}
        </div>

        {/* Pricing / Auction Stats */}
        <div className="mt-auto pt-3 border-t border-[#ECE4D9] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#8F7E72] font-medium">
              {data.status === "buy_now" ? "السعر المطلوب" : "أعلى مزايدة حالية"}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-[#8B5E3C]">
                {data.currentBid.toLocaleString("ar-SA")}
              </span>
              <span className="text-[10px] font-bold text-[#8F7E72]">ر.س</span>
            </div>
          </div>

          {/* Quick Bid Button or View Button */}
          {data.status === "live" && onQuickBid ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onQuickBid(500)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8B5E3C] hover:bg-[#6F4526] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              >
                <Gavel className="w-3 h-3 stroke-[2.5]" />
                <span>+500 ر.س</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-[#8F7E72]">
              <Eye className="w-3.5 h-3.5" />
              <span>{data.viewsCount ?? 0} مشاهدة</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
