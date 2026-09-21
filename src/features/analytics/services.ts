import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  DashboardOverviewStats,
  AnalyticsStatCardItem,
  PlatformGrowthDataPoint,
  AuctionCompletionTrendPoint,
  TopAuctionItem,
  TopLiveStreamItem,
} from "./types";

export const analyticsStatCardsConfig: AnalyticsStatCardItem[] = [
  {
    id: "livestock-sellers",
    label: "عدد بائعي المواشي",
    countKey: "livestockSellersCount",
    iconName: "Users",
  },
  {
    id: "supplies-sellers",
    label: "عدد بائعي المستلزمات",
    countKey: "suppliesSellersCount",
    iconName: "UsersRound",
  },
  {
    id: "customers",
    label: "عدد العملاء",
    countKey: "customersCount",
    iconName: "UserCheck",
  },
  {
    id: "auctions",
    label: "عدد المزادات",
    countKey: "activeAuctionsCount",
    iconName: "Gavel",
  },
];

export const mockOverviewStats: DashboardOverviewStats = {
  livestockSellersCount: 55,
  suppliesSellersCount: 55,
  customersCount: 55,
  activeAuctionsCount: 55,
  totalRevenue: 245000,
  activeListingsCount: 140,
};

export const mockPlatformGrowthData: PlatformGrowthDataPoint[] = [
  { month: "يناير", value: 18 },
  { month: "فبراير", value: 88 },
  { month: "مارس", value: 60 },
  { month: "إبريل", value: 40 },
  { month: "مايو", value: 76 },
  { month: "يونيو", value: 33 },
  { month: "يوليو", value: 50 },
  { month: "أغسطس", value: 50 },
];

export const mockAuctionTrendsData: AuctionCompletionTrendPoint[] = [
  { year: "2016", value: 10 },
  { year: "2017", value: 16 },
  { year: "2018", value: 45 },
  { year: "2019", value: 62 },
  { year: "2020", value: 14 },
  { year: "2021", value: 25 },
  { year: "2022", value: 65 },
  { year: "2023", value: 85 },
];

export const mockTopAuctions: TopAuctionItem[] = [
  { id: "1", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "2", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
  { id: "3", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, bidsCount: 14 },
];

export const mockTopLiveStreams: TopLiveStreamItem[] = [
  { id: "1", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "2", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
  { id: "3", name: "غنم نعيم أصيل", sellerName: "محمد السالمي", viewsCount: 24, isLive: true },
];

export const analyticsService = {
  getStatCardsConfig: async (): Promise<ApiResponse<AnalyticsStatCardItem[]>> => {
    return {
      success: true,
      data: analyticsStatCardsConfig,
      message: "Stat cards config loaded",
    };
  },

  getOverviewStats: async (): Promise<ApiResponse<DashboardOverviewStats>> => {
    try {
      const response = await apiClient.get<DashboardOverviewStats>(apiConfig.endpoints.analytics.overview);
      return response;
    } catch {
      return {
        success: true,
        data: mockOverviewStats,
        message: "Loaded from mock service",
      };
    }
  },

  getPlatformGrowth: async (): Promise<ApiResponse<PlatformGrowthDataPoint[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: mockPlatformGrowthData,
      message: "Loaded platform growth data",
    };
  },

  getAuctionTrends: async (timeframe = "yearly"): Promise<ApiResponse<AuctionCompletionTrendPoint[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: mockAuctionTrendsData,
      message: "Loaded auction trends data",
    };
  },

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
