import { BaseFilterParams } from "@/types/api";

export type AuctionStatus = "active" | "completed" | "upcoming" | "ended" | "cancelled";

export interface AuctionTableItem {
  id: string;
  title: string;
  sellerName: string;
  category: string;
  status: "active" | "completed";
  totalBids: number;
  createdAt: string;
  isLiveEnabled: boolean;
  startingPrice?: number;
  currentBid?: number;
}

export interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  completedAuctions: number;
  stoppedAuctions: number;
}

export interface AuctionStatCardItem {
  id: string;
  label: string;
  countKey: keyof AuctionStats;
  iconName: "Gavel" | "Radio" | "CheckCircle2" | "Clock";
}

export interface AuctionFilterTabItem {
  id: "all" | "active" | "completed";
  label: string;
}

export interface AuctionHorse {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: "stallion" | "mare" | "gelding";
  imageUrl?: string;
  origin?: string;
}

export interface Auction {
  id: string;
  title: string;
  horse: AuctionHorse;
  sellerId: string;
  sellerName: string;
  startingPrice: number;
  currentBid: number;
  bidCount: number;
  viewsCount: number;
  status: AuctionStatus;
  startDate: string;
  endDate: string;
  isFeatured?: boolean;
}

export interface AuctionFilterParams extends BaseFilterParams {
  statusTab?: "all" | "active" | "completed";
  category?: string;
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
