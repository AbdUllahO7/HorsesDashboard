import { BaseFilterParams } from "@/types/api";

export type ComplaintStatus = "resolved" | "pending" | "waiting" | "in_progress" | "rejected";
export type ItemType = "all" | "review" | "complaint";

export interface ComplaintReviewItem {
  id: string | number;
  type: "review" | "complaint";
  typeLabel: string;
  subject: string;
  sellerId?: string;
  sellerName: string;
  sellerStore?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  status: ComplaintStatus;
  statusLabel?: string;
  rating?: number | null;
  joinedDate: string;
  joinedDateHijri?: string;
  description: string;
  createdAt?: string;
}

export interface ReviewsStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  waitingComplaints: number;
}

export interface ReviewStatCardItem {
  id: string;
  label: string;
  countKey: keyof ReviewsStats;
  iconName: "HelpCircle" | "CheckCircle2" | "Clock" | "AlertCircle";
}

export interface ReviewFilterTabItem {
  id: "all" | "review" | "complaint";
  label: string;
  count?: number;
}

export interface ReviewFilterParams extends BaseFilterParams {
  tab?: "all" | "review" | "complaint";
  status?: string;
  sellerId?: string;
  minRate?: number;
  maxRate?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReviewsPaginationResponse {
  items: ComplaintReviewItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
