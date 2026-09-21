import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import {
  Auction,
  AuctionTableItem,
  AuctionFilterParams,
  AuctionFilterTabItem,
} from "./types";

export const auctionFilterTabs: AuctionFilterTabItem[] = [
  { id: "all", label: "كل البائعين" },
  { id: "active", label: "نشط" },
  { id: "completed", label: "مكتمل" },
];

export const mockAuctionTableList: AuctionTableItem[] = [
  {
    id: "auc-1",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "completed",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 50000,
    currentBid: 78000,
  },
  {
    id: "auc-2",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: true,
    startingPrice: 40000,
    currentBid: 65000,
  },
  {
    id: "auc-3",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 35000,
    currentBid: 52000,
  },
  {
    id: "auc-4",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 45000,
    currentBid: 60000,
  },
  {
    id: "auc-5",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "completed",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 30000,
    currentBid: 48000,
  },
  {
    id: "auc-6",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 55000,
    currentBid: 82000,
  },
  {
    id: "auc-7",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "completed",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 25000,
    currentBid: 42000,
  },
  {
    id: "auc-8",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "completed",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 60000,
    currentBid: 95000,
  },
  {
    id: "auc-9",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 48000,
    currentBid: 71000,
  },
  {
    id: "auc-10",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 52000,
    currentBid: 77000,
  },
  {
    id: "auc-11",
    title: "غنم نعيم أصيل - 50 رأس",
    sellerName: "محمود احمد",
    category: "خيول عربية",
    status: "active",
    totalBids: 5,
    createdAt: "25-5-2025",
    isLiveEnabled: false,
    startingPrice: 42000,
    currentBid: 68000,
  },
];

export const auctionsService = {
  /**
   * Get Auction Filter Tabs
   */
  getFilterTabs: async (): Promise<ApiResponse<AuctionFilterTabItem[]>> => {
    return {
      success: true,
      data: auctionFilterTabs,
      message: "Auction filter tabs loaded",
    };
  },

  /**
   * Get Auctions table data matching Image 4
   */
  getAuctionsTable: async (
    params?: AuctionFilterParams
  ): Promise<ApiResponse<PaginatedData<AuctionTableItem>>> => {
    try {
      return await apiClient.get<PaginatedData<AuctionTableItem>>(apiConfig.endpoints.auctions.list, {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      let filtered = [...mockAuctionTableList];

      if (params?.statusTab && params.statusTab !== "all") {
        filtered = filtered.filter((a) => a.status === params.statusTab);
      }

      if (params?.search) {
        const query = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.sellerName.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query)
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const totalPages = Math.ceil(40 / limit);

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
   * Toggle Auction Live stream status
   */
  toggleAuctionLive: async (id: string, isEnabled: boolean): Promise<ApiResponse<AuctionTableItem>> => {
    try {
      return await apiClient.patch<AuctionTableItem>(`/admin/auctions/${id}/toggle-live`, { isEnabled });
    } catch {
      const auction = mockAuctionTableList.find((a) => a.id === id) || mockAuctionTableList[0];
      return {
        success: true,
        data: { ...auction, isLiveEnabled: isEnabled },
        message: "Updated in mock service",
      };
    }
  },

  /**
   * Get single auction details
   */
  getAuctionById: async (id: string): Promise<ApiResponse<Auction>> => {
    return apiClient.get<Auction>(apiConfig.endpoints.auctions.details(id));
  },

};
