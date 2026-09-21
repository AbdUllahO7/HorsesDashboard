import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import { DashboardOverviewStats, TopAuctionItem, TopLiveStreamItem } from "./types";

// Standard Mock Data conforming to design mockup
export const mockOverviewStats: DashboardOverviewStats = {
  livestockSellersCount: 55,
  suppliesSellersCount: 55,
  customersCount: 55,
  activeAuctionsCount: 55,
  totalRevenue: 245000,
  activeListingsCount: 140,
};

export const mockTopAuctions: TopAuctionItem[] = [
  { id: "1", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "2", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "3", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "4", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "5", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "6", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "7", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
];

export const mockTopLiveStreams: TopLiveStreamItem[] = [
  { id: "1", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "2", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "3", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "4", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "5", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "6", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "7", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
];

export const analyticsService = {
  /**
   * Fetch overview statistics with instant mock fallback for fast API integration
   */
  getOverviewStats: async (): Promise<ApiResponse<DashboardOverviewStats>> => {
    try {
      const response = await apiClient.get<DashboardOverviewStats>(apiConfig.endpoints.analytics.overview);
      return response;
    } catch {
      // Return typed mock data if API is not yet connected
      return {
        success: true,
        data: mockOverviewStats,
        message: "Loaded from mock service",
      };
    }
  },

  /**
   * Fetch most engaged auctions
   */
  getTopAuctions: async (): Promise<ApiResponse<TopAuctionItem[]>> => {
    try {
      const response = await apiClient.get<TopAuctionItem[]>(apiConfig.endpoints.analytics.auctionsReport);
      return response;
    } catch {
      return {
        success: true,
        data: mockTopAuctions,
        message: "Loaded from mock service",
      };
    }
  },

  /**
   * Fetch most viewed live streams
   */
  getTopLiveStreams: async (): Promise<ApiResponse<TopLiveStreamItem[]>> => {
    try {
      const response = await apiClient.get<TopLiveStreamItem[]>("/admin/analytics/live-streams");
      return response;
    } catch {
      return {
        success: true,
        data: mockTopLiveStreams,
        message: "Loaded from mock service",
      };
    }
  },
};
