import { BaseFilterParams } from "@/types/api";
import { SellerStatus } from "@/features/listings/types";

export type CustomerStatus = SellerStatus;

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: CustomerStatus;
  interactionsCount: number;
  joinedDate: string;
  bidsCount?: number;
  ordersCount?: number;
  totalSpent?: number;
  address?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  blockedCustomers: number;
}

export interface CustomerFilterTabItem {
  id: "all" | CustomerStatus;
  label: string;
}

export interface CustomerStatCardItem {
  id: string;
  label: string;
  countKey: keyof CustomerStats;
  iconName: "Users" | "UserCheck" | "UserX" | "UserMinus";
}

export interface CustomerFilterParams extends BaseFilterParams {
  statusTab?: "all" | CustomerStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
