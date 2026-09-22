import { BaseFilterParams } from "@/types/api";

export type ListingCategory = "horses" | "supplies" | "accessories" | "feed";

export type SellerStatus = "active" | "pending" | "inactive" | "blocked";

export interface LivestockSeller {
  id: string;
  businessProfileId?: number;
  name: string;
  email: string;
  phone: string;
  status: SellerStatus;
  isAuctionsEnabled: boolean;
  auctionsCount: number;
  isLiveStreamEnabled: boolean;
  createdAt: string;
  stableName?: string;
  address?: string;
  city?: string;
  description?: string;
  whatsappNumber?: string;
  googleMapLink?: string;
}

export interface SuppliesSeller {
  id: string;
  businessProfileId?: number;
  name: string;
  storeName?: string;
  email: string;
  phone: string;
  status: SellerStatus;
  productsCount: number;
  joinedDate: string;
  followersCount?: number;
  reviewsCount?: number;
  address?: string;
  city?: string;
  description?: string;
  whatsappNumber?: string;
  googleMapLink?: string;
  createdAt?: string;
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

export interface ProductItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  categoryName?: string;
  breedId?: number;
  breedName?: string;
  sellerId?: string;
  sellerName?: string;
  age?: number;
  weight?: number;
  address?: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
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
  images?: string[];
}

export interface ProductFilterParams extends BaseFilterParams {
  categoryId?: number;
  breedId?: number;
  userId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListingFilterParams extends BaseFilterParams {
  category?: ListingCategory;
  sellerType?: "livestock" | "supplies";
  search?: string;
}
