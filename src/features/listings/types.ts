import { BaseFilterParams } from "@/types/api";

export type ListingCategory = "horses" | "supplies" | "accessories" | "feed";

export type SellerStatus = "active" | "pending" | "inactive" | "blocked";

export interface LivestockSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: SellerStatus;
  isAuctionsEnabled: boolean;
  auctionsCount: number;
  isLiveStreamEnabled: boolean;
  createdAt: string;
}

export interface SellersStats {
  totalSellers: number;
  activeSellers: number;
  inactiveSellers: number;
  blockedSellers: number;
}

export interface SellerFilterTabItem {
  id: "all" | SellerStatus;
  label: string;
}

export interface SellerStatCardItem {
  id: string;
  label: string;
  countKey: keyof SellersStats;
  iconName: "Users" | "UserCheck" | "UserX" | "UserMinus";
}


export interface LivestockSellerFilterParams extends BaseFilterParams {
  statusTab?: "all" | SellerStatus;
  sortBy?: "name" | "email" | "phone" | "status" | "auctionsCount";
  sortOrder?: "asc" | "desc";
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
  phone: string;
  type: "livestock" | "supplies";
  status: SellerStatus;
  totalListings?: number;
  totalSales?: number;
  rating?: number;
  joinedDate?: string;
}

export interface ListingItem {
  id: string;
  title: string;
  category: ListingCategory;
  price: number;
  sellerId: string;
  sellerName: string;
  status: "active" | "draft" | "sold" | "archived";
  viewsCount: number;
  createdAt: string;
}

export interface ListingFilterParams extends BaseFilterParams {
  category?: ListingCategory;
  sellerType?: "livestock" | "supplies";
}
