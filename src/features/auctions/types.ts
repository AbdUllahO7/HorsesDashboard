import { BaseFilterParams } from "@/types/api";

export type AuctionStatus = "active" | "completed" | "upcoming" | "ended" | "cancelled" | "stopped";

export interface AuctionBid {
  id: string | number;
  bidderId?: string;
  bidderName: string;
  amount: number;
  createdAt: string;
}

export interface AuctionHorse {
  id: string;
  name: string;
  breed: string;
  age?: number;
  gender?: "stallion" | "mare" | "gelding" | string;
  imageUrl?: string;
  images?: string[];
  origin?: string;
}

export interface AuctionTableItem {
  id: string;
  title: string;
  sellerName: string;
  sellerId?: string;
  category: string;
  status: AuctionStatus;
  statusLabel?: string;
  totalBids: number;
  createdAt: string;
  isLiveEnabled: boolean;
  startingPrice: number;
  currentBid: number;
  startDate?: string;
  endDate?: string;
  images?: string[];
  description?: string;
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
  id: "all" | "active" | "completed" | "stopped";
  label: string;
}

export interface AuctionDetailsData extends AuctionTableItem {
  bidsHistory?: AuctionBid[];
  horseDetails?: AuctionHorse;
  address?: string;
  featurePlanName?: string;
}

export interface AuctionFilterParams extends BaseFilterParams {
  statusTab?: "all" | "active" | "completed" | "stopped";
  category?: string;
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
