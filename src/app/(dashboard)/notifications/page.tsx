"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Gavel,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Ticket,
  Clock,
  ExternalLink,
} from "lucide-react";
import { notificationsService } from "@/features/notifications/services";
import {
  NotificationItem,
  NotificationType,
  SendNotificationFormData,
} from "@/features/notifications/types";
import { Breadcrumb, Pagination, SendNotificationModal, ConfirmModal } from "@/components";
import { cn } from "@/core/utils/cn";

export default function NotificationsPage() {
  const router = useRouter();

  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeTypeTab, setActiveTypeTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<NotificationItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Notifications
  const fetchNotifications = useCallback(
    async (page: number = 1, type: string = "all", search: string = "") => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await notificationsService.getNotifications({
          page,
          limit: 10,
          type: type !== "all" ? type : undefined,
          search: search.trim() || undefined,
        });

        if (res.success && res.data) {
          setNotifications(res.data.items);
          setUnreadCount(res.data.unreadCount);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err: unknown) {
        console.error("Failed to load notifications:", err);
        setErrorMsg("حدث خطأ أثناء تحميل الإشعارات");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications(currentPage, activeTypeTab, searchTerm);
  }, [fetchNotifications, currentPage, activeTypeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotifications(1, activeTypeTab, searchTerm);
  };

  const handleMarkAsRead = async (notification: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (notification.isRead) return;

    try {
      const res = await notificationsService.markAsRead(notification.id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    await handleMarkAsRead(notification);
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationsService.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        showToast("تم تعيين كافة الإشعارات كمقروءة");
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setErrorMsg("حدث خطأ أثناء تحديث حالة الإشعارات");
    }
  };

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;
    try {
      const res = await notificationsService.deleteNotification(notificationToDelete.id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationToDelete.id));
        showToast("تم حذف الإشعار بنجاح");
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setErrorMsg("حدث خطأ أثناء حذف الإشعار");
    } finally {
      setNotificationToDelete(null);
    }
  };

  const handleSendNotification = async (data: SendNotificationFormData) => {
    try {
      const res = await notificationsService.sendNotification(data);
      if (res.success) {
        showToast("تم إرسال الإشعار للمستخدمين بنجاح");
        await fetchNotifications(1, activeTypeTab, searchTerm);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إرسال الإشعار";
      setErrorMsg(msg);
      throw err;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "auction":
        return <Gavel className="w-5 h-5 text-[#A6883C]" />;
      case "user":
        return <UserCheck className="w-5 h-5 text-[#10B981]" />;
      case "report":
        return <ShieldAlert className="w-5 h-5 text-[#EF4444]" />;
      case "payment":
      case "order":
        return <CreditCard className="w-5 h-5 text-[#6366F1]" />;
      case "ticket":
        return <Ticket className="w-5 h-5 text-[#F59E0B]" />;
      default:
        return <Bell className="w-5 h-5 text-[#A6883C]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle="مركز الإشعارات والتنبيهات" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#10B981] px-5 py-3 text-xs font-bold text-white shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="font-semibold">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="mr-auto text-xs text-red-500 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {/* 2. Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1E1E2D]">مركز الإشعارات</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD]">
                {unreadCount} غير مقروءة
              </span>
            )}
          </div>
          <p className="text-xs text-[#8E8E93] mt-1">
            متابعة تنبيهات المزادات، طلبات التوثيق، عمليات الدفع، وبلاغات الانتهاك
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs font-bold text-[#333748] hover:bg-[#F9FAFB] transition-colors cursor-pointer shadow-2xs"
            >
              <CheckCheck className="h-4 w-4 text-[#10B981]" />
              <span>تعيين الكل كمقروء</span>
            </button>
          )}

          <button
            onClick={() => setIsSendModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#A6883C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#937734] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>إرسال إشعار عام</span>
          </button>
        </div>
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F6FA] rounded-xl border border-[#EDEEF2] overflow-x-auto">
          {[
            { id: "all", label: "الكل" },
            { id: "auction", label: "المزادات" },
            { id: "user", label: "التوثيق والحسابات" },
            { id: "report", label: "البلاغات والانتهاكات" },
            { id: "payment", label: "المدفوعات" },
            { id: "ticket", label: "الشكاوى والدعم" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTypeTab(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTypeTab === tab.id
                  ? "bg-[#A6883C] text-white shadow-2xs"
                  : "text-[#6B7280] hover:text-[#1E1E2D] hover:bg-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في الإشعارات..."
            className="w-full rounded-xl border border-[#EDEEF2] bg-white py-2 pr-9 pl-4 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#A6883C] transition-all shadow-2xs"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#8E8E93]" />
        </form>
      </div>

      {/* 4. Notifications List */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#8E8E93]">جاري تحميل الإشعارات...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C] mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#1E1E2D]">لا توجد إشعارات حالياً</p>
            <p className="text-xs text-[#8E8E93]">سيتم إعلامك فور وجود أي نشاط جديد في النظام</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={cn(
                "group relative rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4 transition-all duration-200 cursor-pointer",
                notif.isRead
                  ? "border-[#EDEEF2] bg-white hover:bg-[#FDFDFE] hover:border-[#A6883C]/40"
                  : "border-[#EADBBD] bg-[#FAF8F2] shadow-2xs hover:bg-[#F6F1E5]"
              )}
            >
              {/* Unread Indicator Bar */}
              {!notif.isRead && (
                <div className="absolute top-4 right-2 w-1.5 h-6 rounded-full bg-[#A6883C]" />
              )}

              <div className="flex items-start gap-3.5 pr-2">
                {/* Icon */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                    notif.isRead
                      ? "bg-[#F8F9FA] border-[#EDEEF2]"
                      : "bg-[#FAF4E6] border-[#EADBBD] shadow-2xs"
                  )}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-[#1E1E2D]">{notif.title}</h3>
                    {notif.typeLabel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#EDEEF2] text-[#6B7280]">
                        {notif.typeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-4 text-[11px] text-[#8E8E93] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timeAgo || notif.createdAt.split("T")[0]}
                    </span>
                    {notif.senderName && (
                      <span>المصدر: <strong className="text-[#333748]">{notif.senderName}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {notif.targetUrl && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#A6883C] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>عرض التفاصيل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationToDelete(notif);
                  }}
                  className="p-1.5 rounded-lg text-[#8E8E93] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="حذف الإشعار"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-6 border-t border-[#EDEEF2] pt-4"
          />
        )}
      </div>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={handleSendNotification}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(notificationToDelete)}
        onClose={() => setNotificationToDelete(null)}
        onConfirm={handleDeleteNotification}
        title="تأكيد حذف الإشعار"
        description="هل أنت متأكد من رغبتك في حذف هذا الإشعار؟"
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}
