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
        "sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#EDEEF2] bg-white px-6 shadow-2xs",
        className
      )}
    >
      {/* Search & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-[#EDEEF2] p-2 text-[#4A4E5A] hover:bg-[#F3F4F8] lg:hidden cursor-pointer"
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

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title={t("common.notifications")}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#6C7280] hover:bg-[#F3F4F8] hover:text-[#A6883C] transition-colors cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-extrabold text-white shadow-2xs animate-pulse">
                {unreadCount > 9 ? "+9" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {notificationsOpen && (
            <div
              className={cn(
                "absolute top-11 z-50 w-80 sm:w-96 rounded-2xl border border-[#EDEEF2] bg-white p-3 shadow-xl animate-fade-in",
                isRTL ? "left-0" : "right-0"
              )}
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EDEEF2] px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1E1E2D]">الإشعارات</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#FAF4E6] text-[#A6883C] px-2 py-0.5 rounded-full">
                      {unreadCount} جديدة
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] hover:underline cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>قراءة الكل</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F3F4F8] my-1">
                {recentNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#8E8E93]">
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer text-right",
                        n.isRead ? "hover:bg-[#F9FAFB]" : "bg-[#FAF8F2] hover:bg-[#F3ECE0]"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#EADBBD] flex items-center justify-center shrink-0 mt-0.5">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-[#1E1E2D] truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A6883C] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-[#8E8E93] mt-1 block">
                          {n.timeAgo || n.createdAt.split("T")[0]}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#EDEEF2] text-center">
                <Link
                  href="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#A6883C] hover:underline"
                >
                  <span>عرض كافة الإشعارات</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

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
