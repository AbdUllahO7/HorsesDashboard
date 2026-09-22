import { BaseFilterParams } from "@/types/api";

export type AdType = "popup" | "banner" | "story";

export interface AdItem {
  id: string | number;
  title: string;
  type: AdType;
  typeLabel?: string;
  categoryName?: string;
  duration: string;
  imageUrl?: string;
  imageFile?: File;
  linkUrl?: string;
  status?: "active" | "inactive";
  statusLabel?: string;
  createdAt?: string;
}

export interface AdFilterTabItem {
  id: "types" | "published";
  label: string;
  count?: number;
}

export interface AdFilterParams extends Omit<BaseFilterParams, "status"> {
  tab?: "types" | "published";
  type?: AdType | number;
  status?: "active" | "inactive" | number | string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdFormData {
  title: string;
  type: AdType;
  duration?: string;
  imageUrl?: string;
  imageFile?: File;
  linkUrl?: string;
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
