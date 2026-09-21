import { BaseFilterParams } from "@/types/api";

export type CategoryType = "livestock" | "supplies";

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  type: CategoryType;
  typeLabel: string;
  itemsCount: number;
  createdAt?: string;
}

export interface CategoryFilterTabItem {
  id: "all" | CategoryType;
  label: string;
  count?: number;
}

export interface CategoryFilterParams extends BaseFilterParams {
  typeTab?: "all" | CategoryType;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  description: string;
}

export interface CategoriesPaginationResponse {
  items: CategoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
