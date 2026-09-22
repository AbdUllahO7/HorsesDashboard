import { BaseFilterParams } from "@/types/api";

export type AccountVerificationStatus = "pending" | "approved" | "rejected";

export interface UserAccountItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  roleName?: string;
  idFrontUrl: string;
  idBackUrl: string;
  selfieWithIdUrl: string;
  status: AccountVerificationStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface AccountFilterParams extends BaseFilterParams {
  status?: string;
  roleName?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AccountsPaginationResponse {
  items: UserAccountItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
