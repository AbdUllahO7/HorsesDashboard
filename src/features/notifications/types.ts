export type NotificationType =
  | "auction"
  | "order"
  | "payment"
  | "user"
  | "report"
  | "ticket"
  | "system"
  | string;

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  typeLabel?: string;
  targetId?: string | number;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
  timeAgo?: string;
  senderName?: string;
  avatarUrl?: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  search?: string;
}

export interface NotificationsResponseData {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendNotificationFormData {
  title: string;
  message: string;
  targetRole: "all" | "sellers" | "customers" | "all_users";
  type: NotificationType;
  targetUrl?: string;
}
