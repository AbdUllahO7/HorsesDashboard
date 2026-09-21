import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import {
  ListingItem,
  ListingFilterParams,
  Seller,
  LivestockSeller,
  LivestockSellerFilterParams,
  SellersStats,
  SellerStatus,
  SellerFilterTabItem,
  SellerStatCardItem,
} from "./types";

export const sellerFilterTabs: SellerFilterTabItem[] = [
  { id: "all", label: "كل البائعين" },
  { id: "pending", label: "قيد المراجعة" },
  { id: "active", label: "نشط" },
  { id: "inactive", label: "غير نشط" },
  { id: "blocked", label: "محظور" },
];

export const sellerStatCardsConfig: SellerStatCardItem[] = [
  {
    id: "total",
    label: "اجمالي البائعين",
    countKey: "totalSellers",
    iconName: "Users",
  },
  {
    id: "active",
    label: "البائعين النشطين",
    countKey: "activeSellers",
    iconName: "UserCheck",
  },
  {
    id: "inactive",
    label: "البائعين غير النشطين",
    countKey: "inactiveSellers",
    iconName: "UserX",
  },
  {
    id: "blocked",
    label: "البائعين المحظورين",
    countKey: "blockedSellers",
    iconName: "UserMinus",
  },
];

export const mockLivestockSellersStats: SellersStats = {
  totalSellers: 55,
  activeSellers: 55,
  inactiveSellers: 55,
  blockedSellers: 55,
};


export const mockLivestockSellersList: LivestockSeller[] = [
  {
    id: "seller-1",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-01T10:00:00Z",
  },
  {
    id: "seller-2",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "blocked",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: true,
    createdAt: "2026-09-02T11:30:00Z",
  },
  {
    id: "seller-3",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-03T09:15:00Z",
  },
  {
    id: "seller-4",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "pending",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-04T14:20:00Z",
  },
  {
    id: "seller-5",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-05T16:00:00Z",
  },
  {
    id: "seller-6",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-06T12:00:00Z",
  },
  {
    id: "seller-7",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-07T13:45:00Z",
  },
  {
    id: "seller-8",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-08T15:10:00Z",
  },
  {
    id: "seller-9",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-09T08:30:00Z",
  },
  {
    id: "seller-10",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    isAuctionsEnabled: false,
    auctionsCount: 5,
    isLiveStreamEnabled: false,
    createdAt: "2026-09-10T10:00:00Z",
  },
];

export const listingsService = {
  /**
   * Get livestock sellers Filter Tabs
   */
  getFilterTabs: async (): Promise<ApiResponse<SellerFilterTabItem[]>> => {
    return {
      success: true,
      data: sellerFilterTabs,
      message: "Filter tabs retrieved successfully",
    };
  },

  /**
   * Get livestock sellers KPI Stat Cards configuration
   */
  getStatCardsConfig: async (): Promise<ApiResponse<SellerStatCardItem[]>> => {
    return {
      success: true,
      data: sellerStatCardsConfig,
      message: "Stat cards config retrieved successfully",
    };
  },

  /**
   * Get livestock sellers KPI summary stats
   */
  getLivestockSellersStats: async (): Promise<ApiResponse<SellersStats>> => {

    try {
      return await apiClient.get<SellersStats>("/admin/sellers/livestock/stats");
    } catch {
      return {
        success: true,
        data: mockLivestockSellersStats,
        message: "Loaded from mock service",
      };
    }
  },

  /**
   * Get paginated and filtered livestock sellers list
   */
  getLivestockSellers: async (
    params?: LivestockSellerFilterParams
  ): Promise<ApiResponse<PaginatedData<LivestockSeller>>> => {
    try {
      return await apiClient.get<PaginatedData<LivestockSeller>>("/admin/sellers/livestock", {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      let filtered = [...mockLivestockSellersList];

      // Status tab filter
      if (params?.statusTab && params.statusTab !== "all") {
        filtered = filtered.filter((s) => s.status === params.statusTab);
      }

      // Search keyword filter
      if (params?.search) {
        const query = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            s.phone.includes(query)
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const totalPages = Math.ceil(40 / limit); // 4 pages as in mockup

      return {
        success: true,
        data: {
          items: filtered,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            pageSize: limit,
            totalItems: 40,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        message: "Loaded from mock service",
      };
    }
  },

  /**
   * Toggle auction permissions for a seller
   */
  toggleSellerAuctions: async (id: string, isEnabled: boolean): Promise<ApiResponse<LivestockSeller>> => {
    try {
      return await apiClient.patch<LivestockSeller>(`/admin/sellers/${id}/auctions-toggle`, { isEnabled });
    } catch {
      const seller = mockLivestockSellersList.find((s) => s.id === id) || mockLivestockSellersList[0];
      return {
        success: true,
        data: { ...seller, isAuctionsEnabled: isEnabled },
        message: "Updated in mock service",
      };
    }
  },

  /**
   * Toggle live stream permissions for a seller
   */
  toggleSellerLiveStream: async (id: string, isEnabled: boolean): Promise<ApiResponse<LivestockSeller>> => {
    try {
      return await apiClient.patch<LivestockSeller>(`/admin/sellers/${id}/livestream-toggle`, { isEnabled });
    } catch {
      const seller = mockLivestockSellersList.find((s) => s.id === id) || mockLivestockSellersList[0];
      return {
        success: true,
        data: { ...seller, isLiveStreamEnabled: isEnabled },
        message: "Updated in mock service",
      };
    }
  },

  /**
   * Update seller account status
   */
  updateSellerStatus: async (id: string, status: SellerStatus): Promise<ApiResponse<LivestockSeller>> => {
    try {
      return await apiClient.patch<LivestockSeller>(`/admin/sellers/${id}/status`, { status });
    } catch {
      const seller = mockLivestockSellersList.find((s) => s.id === id) || mockLivestockSellersList[0];
      return {
        success: true,
        data: { ...seller, status },
        message: "Status updated in mock service",
      };
    }
  },

  /**
   * Delete seller
   */
  deleteSeller: async (id: string): Promise<ApiResponse<void>> => {
    try {
      return await apiClient.delete<void>(`/admin/sellers/${id}`);
    } catch {
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Deleted in mock service",
      };
    }
  },

  getListings: async (params?: ListingFilterParams): Promise<ApiResponse<PaginatedData<ListingItem>>> => {
    return apiClient.get<PaginatedData<ListingItem>>(apiConfig.endpoints.listings.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  getSellers: async (type?: "livestock" | "supplies"): Promise<ApiResponse<PaginatedData<Seller>>> => {
    return apiClient.get<PaginatedData<Seller>>(apiConfig.endpoints.listings.sellers, {
      params: { type },
    });
  },
};
