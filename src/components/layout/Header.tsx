"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";
import {
  Bell,
  Search,
  Menu,
  Globe,
  ChevronDown,
  CheckCheck,
  ExternalLink,
  Gavel,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Ticket,
} from "lucide-react";
import { notificationsService } from "@/features/notifications/services";
import { NotificationItem, NotificationType } from "@/features/notifications/types";
import { LiveUrgentAlerts } from "./LiveUrgentAlerts";

export interface HeaderProps {
  onOpenMobileMenu: () => void;
  className?: string;
}

export function Header({ onOpenMobileMenu, className }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale, isRTL, toggleLanguage } = useTranslation();

  // Notification Dropdown State
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load unread count and latest notifications
  useEffect(() => {
    async function loadNotifs() {
      try {
        const [countRes, listRes] = await Promise.all([
          notificationsService.getUnreadCount(),
          notificationsService.getNotifications({ page: 1, limit: 5 }),
        ]);
        if (countRes.success) setUnreadCount(countRes.data);
        if (listRes.success && listRes.data) setRecentNotifications(listRes.data.items);
      } catch (err) {
        console.error("Failed to load header notifications:", err);
      }
    }
    loadNotifs();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setUnreadCount(0);
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await notificationsService.markAsRead(notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    setNotificationsOpen(false);
    if (notif.targetUrl) {
      router.push(notif.targetUrl);
    } else {
      router.push("/notifications");
    }
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "auction":
        return <Gavel className="w-4 h-4 text-[#A6883C]" />;
      case "user":
        return <UserCheck className="w-4 h-4 text-[#10B981]" />;
      case "report":
        return <ShieldAlert className="w-4 h-4 text-[#EF4444]" />;
      case "payment":
      case "order":
        return <CreditCard className="w-4 h-4 text-[#6366F1]" />;
      case "ticket":
        return <Ticket className="w-4 h-4 text-[#F59E0B]" />;
      default:
        return <Bell className="w-4 h-4 text-[#A6883C]" />;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#ECE4D9] bg-white px-6 shadow-2xs",
        className
      )}
    >
      {/* Search & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl border border-[#ECE4D9] p-2 text-[#5E4E42] hover:bg-[#FAF4EB] lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:flex items-center w-80">
          <input
            type="text"
            placeholder={t("common.searchPlaceholder")}
            className={cn(
              "w-full rounded-xl border border-transparent bg-[#F4EFE8] py-2 text-xs text-[#2F241C] placeholder-[#8F7E72] outline-none focus:border-[#8B5E3C] focus:bg-white focus:ring-2 focus:ring-[#8B5E3C]/15 transition-all",
              isRTL ? "pr-4 pl-10" : "pl-4 pr-10"
            )}
          />
          <div
            className={cn(
              "absolute flex items-center gap-1.5 text-[#8F7E72]",
              isRTL ? "left-3" : "right-3"
            )}
          >
            <Search className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Live Alerts, Profile, Notifications & Language Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Urgent Alerts Pill for Accounts & Reports */}
        <LiveUrgentAlerts />

        {/* Language Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          title={`Switch to ${locale === "ar" ? "English" : "العربية"}`}
          className="flex items-center gap-1.5 rounded-xl border border-[#E0CEBE] bg-[#F8F1EA] px-2.5 py-1.5 text-xs font-bold text-[#8B5E3C] hover:bg-[#F0E3D3] transition-colors cursor-pointer shadow-2xs"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{locale === "ar" ? "EN" : "عربي"}</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title={t("common.notifications")}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE4D9] bg-white text-[#5E4E42] hover:bg-[#FAF4EB] hover:text-[#8B5E3C] transition-colors cursor-pointer shadow-2xs"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-extrabold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? "+9" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {notificationsOpen && (
            <div
              className={cn(
                "absolute top-11 z-50 w-80 sm:w-96 rounded-2xl border border-[#ECE4D9] bg-white p-3 shadow-xl animate-fade-in",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE4D9] px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2F241C]">الإشعارات</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#F8F1EA] text-[#8B5E3C] px-2 py-0.5 rounded-full border border-[#E0CEBE]">
                      {unreadCount} جديدة
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>قراءة الكل</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F8F4EF] my-1">
                {recentNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#8F7E72]">
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer text-right",
                        n.isRead ? "hover:bg-[#FCFAF7]" : "bg-[#FAF4EB]/50 hover:bg-[#FAF4EB]"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E0CEBE] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-[#2F241C] truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C88F45] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#5E4E42] line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-[#8F7E72] mt-1 block">
                          {n.timeAgo || n.createdAt.split("T")[0]}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#ECE4D9] text-center">
                <Link
                  href="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8B5E3C] hover:underline"
                >
                  <span>عرض كافة الإشعارات</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity bg-[#FAF4EB]/50 border border-[#ECE4D9] rounded-xl px-2.5 py-1.5 shadow-2xs">
          <ChevronDown className="h-3 w-3 text-[#8F7E72]" />
          <div className={cn(isRTL ? "text-right" : "text-left")}>
            <p className="text-xs font-bold text-[#2F241C]">
              {user?.name || "مدير النظام"}
            </p>
            <p className="text-[10px] text-[#8F7E72] font-medium">{t("common.admin")}</p>
          </div>
          <div className="h-7.5 w-7.5 overflow-hidden rounded-lg bg-[#8B5E3C] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {user?.name ? user.name.slice(0, 1) : "🐪"}
          </div>
        </div>
      </div>
    </header>
  );
}
