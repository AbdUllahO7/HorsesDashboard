import { BaseFilterParams } from "@/types/api";

export type AdType = "popup" | "banner" | "story";

export interface AdItem {
  id: string;
  title: string;
  type: AdType;
  typeLabel?: string;
  categoryName?: string;
  duration: string;
  imageUrl?: string;
  status?: "active" | "inactive";
  createdAt?: string;
}

export interface AdFilterTabItem {
  id: "types" | "published";
  label: string;
  count?: number;
}

export interface AdFilterParams extends BaseFilterParams {
  tab?: "types" | "published";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdFormData {
  title: string;
  type: AdType;
  duration?: string;
  imageUrl?: string;
}

export interface AdsPaginationResponse {
  items: AdItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
