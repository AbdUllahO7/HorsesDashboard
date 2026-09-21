import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import { ListingItem, ListingFilterParams, Seller } from "./types";

export const mockSellersList: Seller[] = [
  {
    id: "seller-1",
    name: "مربط السالمي للخيول والمواشي",
    phone: "+966 50 123 4567",
    type: "livestock",
    status: "active",
    totalListings: 18,
    totalSales: 45,
    rating: 4.9,
    joinedDate: "2025-01-15",
  },
  {
    id: "seller-2",
    name: "مؤسسة مستلزمات الفارس الحديثة",
    phone: "+966 55 987 6543",
    type: "supplies",
    status: "active",
    totalListings: 64,
    totalSales: 230,
    rating: 4.8,
    joinedDate: "2025-02-10",
  },
];

export const mockListingsItems: ListingItem[] = [
  {
    id: "item-1",
    title: "سرج خيل أصيل مصنوع يدوياً",
    category: "accessories",
    price: 3200,
    sellerId: "seller-2",
    sellerName: "مؤسسة مستلزمات الفارس الحديثة",
    status: "active",
    viewsCount: 145,
    createdAt: "2026-09-18T10:00:00Z",
  },
  {
    id: "item-2",
    title: "مستلزمات تدريب ورعاية الخيول",
    category: "supplies",
    price: 1500,
    sellerId: "seller-2",
    sellerName: "مؤسسة مستلزمات الفارس الحديثة",
    status: "active",
    viewsCount: 89,
    createdAt: "2026-09-19T14:30:00Z",
  },
];

export const listingsService = {
  getListings: async (params?: ListingFilterParams): Promise<ApiResponse<PaginatedData<ListingItem>>> => {
    try {
      return await apiClient.get<PaginatedData<ListingItem>>(apiConfig.endpoints.listings.list, {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      return {
        success: true,
        data: {
          items: mockListingsItems,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: mockListingsItems.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: "Loaded from mock service",
      };
    }
  },

  getSellers: async (type?: "livestock" | "supplies"): Promise<ApiResponse<PaginatedData<Seller>>> => {
    try {
      return await apiClient.get<PaginatedData<Seller>>(apiConfig.endpoints.listings.sellers, {
        params: { type },
      });
    } catch {
      const filtered = type ? mockSellersList.filter((s) => s.type === type) : mockSellersList;
      return {
        success: true,
        data: {
          items: filtered,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: filtered.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: "Loaded from mock service",
      };
    }
  },
};
