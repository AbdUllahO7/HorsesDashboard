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
  Megaphone,
  Calculator,
  Receipt,
  Bell,
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
  Megaphone: <Megaphone className="h-5 w-5" strokeWidth={1.8} />,
  Calculator: <Calculator className="h-5 w-5" strokeWidth={1.8} />,
  Receipt: <Receipt className="h-5 w-5" strokeWidth={1.8} />,
  Bell: <Bell className="h-5 w-5 shrink-0" strokeWidth={1.8} />,
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
  ads: "nav.ads",
  accounting: "nav.accounting",
  invoices: "nav.invoices",
  notifications: "nav.notifications" as any,
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 flex w-[260px] flex-col justify-between bg-white px-4 py-5 shadow-xs transition-transform duration-300 lg:static lg:translate-x-0",
          isRTL ? "right-0 border-l border-[#ECE4D9]" : "left-0 border-r border-[#ECE4D9]",
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
                "absolute top-2 rounded-lg p-1.5 text-[#8F7E72] hover:bg-[#F8F1EA] lg:hidden",
                isRTL ? "left-2" : "right-2"
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links matching Camel Heritage Design */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-0.5">
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
                    "group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#F8F1EA] text-[#8B5E3C] font-bold border-r-3 border-[#8B5E3C] shadow-2xs"
                      : "text-[#5E4E42] hover:bg-[#FAF4EB] hover:text-[#8B5E3C] hover:translate-x-0.5"
                  )}
                >
                  {/* Icon on the Right (in RTL), grouped with text */}
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-[#8B5E3C]" : "text-[#8F7E72] group-hover:text-[#8B5E3C]"
                    )}
                  >
                    {iconMap[item.iconName] || <Gauge className="h-5 w-5" />}
                  </span>

                  {/* Label next to icon */}
                  <span className="text-[13.5px] leading-tight font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Logout button with warm heritage palette */}
        <div className="pt-3 border-t border-[#ECE4D9]/60">
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E0CEBE] bg-[#F8F1EA] px-4 py-2.5 text-xs font-bold text-[#8B5E3C] hover:bg-[#F0E3D3] hover:text-[#6F4526] transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("common.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
