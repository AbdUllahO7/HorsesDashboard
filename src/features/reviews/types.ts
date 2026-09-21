export type ComplaintStatus = "resolved" | "pending" | "waiting";
export type ComplaintType = "review" | "complaint";

export interface ComplaintReviewItem {
  id: string;
  type: ComplaintType;
  typeLabel: string;
  subject: string;
  sellerName: string;
  sellerStore?: string;
  customerName: string;
  customerPhone?: string;
  status: ComplaintStatus;
  statusLabel?: string;
  rating?: number | null;
  joinedDate: string;
  joinedDateHijri?: string;
  description: string;
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

export interface ReviewFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  tab?: "all" | "review" | "complaint";
  status?: string;
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
