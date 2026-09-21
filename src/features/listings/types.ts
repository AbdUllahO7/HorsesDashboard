import { BaseFilterParams } from "@/types/api";

export type ListingCategory = "horses" | "supplies" | "accessories" | "feed";

export interface Seller {
  id: string;
  name: string;
  phone: string;
  type: "livestock" | "supplies";
  status: "active" | "pending" | "blocked";
  totalListings: number;
  totalSales: number;
  rating: number;
  joinedDate: string;
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
