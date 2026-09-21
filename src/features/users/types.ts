import { BaseFilterParams } from "@/types/api";

export type CustomerStatus = "active" | "inactive" | "banned" | "pending_verification";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: CustomerStatus;
  bidsCount: number;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
}

export interface UserFilterParams extends BaseFilterParams {
  role?: string;
}
