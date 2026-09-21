import { BaseFilterParams } from "@/types/api";

export type AuctionStatus = "upcoming" | "active" | "ended" | "cancelled";

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
  category?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
}
