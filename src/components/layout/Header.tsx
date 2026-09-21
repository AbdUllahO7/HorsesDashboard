"use client";

import React from "react";
import { useAuth } from "@/core/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";
import { Bell, Search, Menu, Globe, ChevronDown } from "lucide-react";

export interface HeaderProps {
  onOpenMobileMenu: () => void;
  className?: string;
}

export function Header({ onOpenMobileMenu, className }: HeaderProps) {
  const { user } = useAuth();
  const { t, locale, isRTL, toggleLanguage } = useTranslation();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#EDEEF2] bg-white px-6 shadow-2xs",
        className
      )}
    >
      {/* Search & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-[#EDEEF2] p-2 text-[#4A4E5A] hover:bg-[#F3F4F8] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:flex items-center w-80">
          <input
            type="text"
            placeholder={t("common.searchPlaceholder")}
            className={cn(
              "w-full rounded-xl border-none bg-[#F3F4F8] py-2 text-xs text-[#1E1E2D] placeholder-[#A0A4B5] outline-none focus:ring-1 focus:ring-[#B59E5F] transition-all",
              isRTL ? "pr-4 pl-10" : "pl-4 pr-10"
            )}
          />
          <div
            className={cn(
              "absolute flex items-center gap-1.5 text-[#9DA2B4]",
              isRTL ? "left-3" : "right-3"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            <Menu className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Profile, Notifications & Language Switcher */}
      <div className="flex items-center gap-3">
 {/* Language Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          title={`Switch to ${locale === "ar" ? "English" : "العربية"}`}
          className="flex items-center gap-1.5 rounded-lg border border-[#EADBBD] bg-[#FAF4E6] px-2.5 py-1.5 text-xs font-bold text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{locale === "ar" ? "EN" : "عربي"}</span>
        </button>
        
        {/* Notification Bell */}
        <button
          title={t("common.notifications")}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#6C7280] hover:bg-[#F3F4F8] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#B59E5F]" />
        </button>

       

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
          <ChevronDown className="h-3.5 w-3.5 text-[#8E8E93]" />
          <div className={cn(isRTL ? "text-right" : "text-left")}>
            <p className="text-xs font-bold text-[#1E1E2D]">
              {user?.name || "تالية الهلاوي"}
            </p>
            <p className="text-[10px] text-[#8E8E93]">{t("common.admin")}</p>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full border border-stone-200 bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs">
            👩‍💼
          </div>
        </div>

      </div>
    </header>
  );
}
