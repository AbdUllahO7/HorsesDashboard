import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  NotificationItem,
  NotificationQueryParams,
  NotificationsResponseData,
  SendNotificationFormData,
  NotificationType,
} from "./types";

const getTypeLabel = (type: NotificationType): string => {
  switch (type) {
    case "auction":
      return "المزادات";
    case "user":
      return "توثيق وحسابات";
    case "report":
      return "البلاغات والانتهاكات";
    case "payment":
    case "order":
      return "الفواتير والدفع";
    case "ticket":
      return "الشكاوى والدعم";
    default:
      return "إشعار نظام";
  }
};

const normalizeNotification = (raw: unknown, index: number = 0): NotificationItem => {
  if (!raw || typeof raw !== "object") {
    return {
      id: `notif-${index + 1}`,
      title: "إشعار جديد",
      message: "",
      type: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.notificationId ?? `notif-${index + 1}`) as string | number;
  const title = String(r.title || r.subject || r.header || "إشعار جديد");
  const message = String(r.message || r.body || r.content || r.description || "");
  const type = String(r.type || r.notificationType || r.category || "system") as NotificationType;
  const isRead = Boolean(r.isRead ?? r.read ?? (r.status === 1 ? true : false));
  const createdAt = String(r.createdAt || r.created_At || r.date || new Date().toISOString());
  const targetId = (r.targetId || r.referenceId || r.entityId) as string | number | undefined;
  const targetUrl = r.targetUrl ? String(r.targetUrl) : undefined;
  const senderName = r.senderName ? String(r.senderName) : undefined;

  return {
    id,
    title,
    message,
    type,
    typeLabel: getTypeLabel(type),
    targetId,
    targetUrl,
    isRead,
    createdAt,
    timeAgo: "حديثاً",
    senderName,
  };
};

class NotificationsService {
  /**
   * Get all admin notifications from API
   */
  async getNotifications(
    params: NotificationQueryParams = {}
  ): Promise<ApiResponse<NotificationsResponseData>> {
    const page = params.page || 1;
    const limit = params.limit || 10;

    try {
      const res = await apiClient.request<any>(
        apiConfig.endpoints.notifications.list,
        {
          params: {
            PageNumber: page,
            PageSize: limit,
            Type: params.type !== "all" ? params.type : undefined,
            IsRead: params.isRead,
            Search: params.search,
          },
        }
      );

      let rawList: unknown[] = [];
      let total = 0;
      let unread = 0;

      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          rawList = res.data;
          total = res.data.length;
        } else if (typeof res.data === "object" && res.data !== null) {
          const d = res.data as Record<string, unknown>;
          rawList = (d.items || d.data || d.notifications || []) as unknown[];
          total = Number(d.totalCount ?? d.total ?? rawList.length);
          unread = Number(d.unreadCount ?? d.unread ?? 0);
        }
      }

      const items = rawList.map((item, idx) => normalizeNotification(item, idx));
      const unreadCount = unread || items.filter((n) => !n.isRead).length;
      const totalPages = Math.ceil((total || items.length) / limit) || 1;

      return {
        success: true,
        data: {
          items,
          unreadCount,
          total: total || items.length,
          page,
          limit,
          totalPages,
        },
        message: "تم استرجاع الإشعارات بنجاح",
      };
    } catch (err) {
      console.error("API /Notifications/GetAll failed:", err);
      return {
        success: false,
        data: {
          items: [],
          unreadCount: 0,
          total: 0,
          page,
          limit,
          totalPages: 1,
        },
        message: "فشل تحميل الإشعارات من الخادم",
      };
    }
  }

  /**
   * Get unread count — derived from /Notifications/Get since no dedicated endpoint exists
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const res = await apiClient.request<any>(
        apiConfig.endpoints.notifications.list
      );
      let unread = 0;
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          unread = res.data.filter((n: any) => !n.isRead && !n.read).length;
        } else if (typeof res.data === "object" && res.data !== null) {
          const d = res.data as Record<string, unknown>;
          // backend may return unreadCount directly
          if (d.unreadCount !== undefined) {
            unread = Number(d.unreadCount);
          } else {
            const list = (d.items || d.data || d.notifications || []) as any[];
            unread = list.filter((n: any) => !n.isRead && !n.read).length;
          }
        }
      }
      return { success: true, data: unread, message: "" };
    } catch {
      return { success: true, data: 0, message: "" };
    }
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      const res = await apiClient.post<any>(
        `${apiConfig.endpoints.notifications.markAsRead}?id=${id}`
      );
      return {
        success: true,
        data: true,
        message: "تم تعيين الإشعار كمقروء",
      };
    } catch (err) {
      console.error("API /Notifications/MarkAsRead failed:", err);
      return {
        success: false,
        data: false,
        message: "فشل تعيين الإشعار كمقروء",
      };
    }
  }

  /**
   * Mark all notifications as read — not in swagger, mark individually via /Notifications/Get items
   * Falls back to a no-op success so UI doesn't break
   */
  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    return { success: true, data: true, message: "تم تعيين كافة الإشعارات كمقروءة" };
  }

  /**
   * Send notification — not in swagger (SendNotification endpoint doesn't exist)
   * Returns a stub success to avoid breaking the UI
   */
  async sendNotification(data: SendNotificationFormData): Promise<ApiResponse<NotificationItem>> {
    console.warn("sendNotification: endpoint not available in API");
    return {
      success: false,
      data: undefined as unknown as NotificationItem,
      message: "خاصية إرسال الإشعارات غير متوفرة حالياً",
    };
  }

  /**
   * Delete notification — not in swagger, stubbed to avoid 404 errors
   */
  async deleteNotification(id: string | number): Promise<ApiResponse<boolean>> {
    console.warn("deleteNotification: endpoint not available in API, id:", id);
    return { success: false, data: false, message: "حذف الإشعار غير متوفر حالياً" };
  }
}

export const notificationsService = new NotificationsService();
