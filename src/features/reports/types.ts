import { BaseFilterParams } from "@/types/api";

export type ReportTicketStatus = "pending" | "resolved" | "dismissed";

export interface ReportTicketItem {
  id: string;
  reporterName: string;
  reporterPhone?: string;
  reporterEmail?: string;
  reportedUserName: string;
  reportedUserPhone?: string;
  reportedUserEmail?: string;
  reason: string;
  category?: string;
  status: ReportTicketStatus;
  createdAt: string;
}

export interface ReportFilterParams extends BaseFilterParams {
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
