import { BaseFilterParams } from "@/types/api";

export type ReportTicketStatus = "pending" | "resolved" | "dismissed";

export interface ReportTicketItem {
  id: string | number;
  liveStreamId?: number;
  reporterId?: string;
  reporterName: string;
  reporterPhone?: string;
  reporterEmail?: string;
  reportedUserId?: string;
  reportedUserName: string;
  reportedUserPhone?: string;
  reportedUserEmail?: string;
  reason: string;
  reasonLabel?: string;
  category?: string;
  notes?: string;
  status: ReportTicketStatus;
  statusLabel?: string;
  createdAt: string;
}

export interface ReportFilterParams extends BaseFilterParams {
  liveStreamId?: number;
  reason?: number;
  userId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReportsPaginationResponse {
  items: ReportTicketItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
