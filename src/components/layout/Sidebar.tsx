"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { useAuth } from "@/core/hooks/useAuth";
import { useTranslation, TranslationKey } from "@/i18n";
import { cn } from "@/core/utils/cn";
import {
  Gauge,
  Users,
  UsersRound,
  FileText,
  LayoutGrid,
  Gavel,
  FileSpreadsheet,
  HelpCircle,
  Settings,
  UserCheck,
  ShieldAlert,
  LogOut,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Gauge: <Gauge className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  Users: <Users className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  UsersRound: <UsersRound className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  FileText: <FileText className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  LayoutGrid: <LayoutGrid className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  Gavel: <Gavel className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  FileSpreadsheet: <FileSpreadsheet className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
  HelpCircle: <HelpCircle className="h-5 w-5" strokeWidth={1.8} />,
  UserCheck: <UserCheck className="h-5 w-5" strokeWidth={1.8} />,
  ShieldAlert: <ShieldAlert className="h-5 w-5" strokeWidth={1.8} />,
  Settings: <Settings className="h-5 w-5" strokeWidth={1.8} />,
};

const navKeyMap: Record<string, TranslationKey> = {
  overview: "nav.dashboard",
  "livestock-sellers": "nav.livestockSellers",
  "supplies-sellers": "nav.suppliesSellers",
  customers: "nav.customers",
  categories: "nav.categories",
  auctions: "nav.auctions",
  reports: "nav.reports",
  reviews: "nav.reviews",
  "user-accounts": "nav.userAccounts",
  tickets: "nav.tickets",
  settings: "nav.settings",
};

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  className?: string;
}

export function Sidebar({ mobileOpen, onCloseMobile, className }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t, isRTL } = useTranslation();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 flex w-[260px] flex-col justify-between bg-white px-4 py-5 shadow-2xs transition-transform duration-300 lg:static lg:translate-x-0",
          isRTL ? "right-0 border-l border-[#EDEEF2]" : "left-0 border-r border-[#EDEEF2]",
          mobileOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col gap-6">
          {/* Logo container */}
          <div className="relative flex items-center justify-center pt-1 pb-2">
            <Link href="/" className="flex items-center justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center transition-transform duration-200 hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="منصة الخيول"
                  width={80}
                  height={80}
                  className="h-auto w-auto max-h-18 max-w-18 object-contain"
                  priority
                />
              </div>
            </Link>
            <button
              onClick={onCloseMobile}
              className={cn(
                "absolute top-2 rounded-lg p-1.5 text-[#8E8E93] hover:bg-[#F3F4F8] lg:hidden",
                isRTL ? "left-2" : "right-2"
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links matching Figma */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {siteConfig.sidebarNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const translationKey = navKeyMap[item.id] || "nav.dashboard";
              const label = t(translationKey, item.titleAr);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3.5 rounded-sm px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#F8F1E4] text-[#A6883C] font-bold border-r border-[#B8860B]  shadow-2xs"
                      : "text-[#333748] hover:bg-[#F9FAFB] hover:text-[#1E1E2D] hover:border-r hover:border-[#B8860B]"
                  )}
                >
                  {/* Icon on the Right (in RTL), grouped with text */}
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-[#A6883C]" : "text-[#717584]"
                    )}
                  >
                    {iconMap[item.iconName] || <Gauge className="h-5 w-5" />}
                  </span>

                  {/* Label next to icon */}
                  <span className="text-[14px] leading-none">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Logout button matching Figma */}
        <div className="pt-3">
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#EADBBD] bg-[#FAF4E6] px-4 py-2.5 text-xs font-bold text-[#A6883C] hover:bg-[#F3E7C9] transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
