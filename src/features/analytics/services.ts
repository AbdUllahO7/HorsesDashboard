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
  livestockSellersCount: 0,
  suppliesSellersCount: 0,
  customersCount: 0,
  activeAuctionsCount: 0,
  totalRevenue: 0,
  activeListingsCount: 0,
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

export const analyticsService = {
  getStatCardsConfig: async (): Promise<ApiResponse<AnalyticsStatCardItem[]>> => {
    return {
      success: true,
      data: analyticsStatCardsConfig,
      message: "Stat cards config loaded",
    };
  },

  /**
   * Fetch Dashboard Overview Stats from GET /api/Users/DashboardStats
   */
  getOverviewStats: async (): Promise<ApiResponse<DashboardOverviewStats>> => {
    try {
      const response = await apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.dashboardStats);
      
      if (response && (response.data || response.success)) {
        const raw = (response.data || response) as Record<string, unknown>;
        
        const normalizedStats: DashboardOverviewStats = {
          livestockSellersCount: Number(
            raw.livestockSellersCount ?? raw.stableOwnersCount ?? raw.stablesCount ?? raw.livestockCount ?? 0
          ),
          suppliesSellersCount: Number(
            raw.suppliesSellersCount ?? raw.storeOwnersCount ?? raw.storesCount ?? raw.suppliesCount ?? 0
          ),
          customersCount: Number(
            raw.customersCount ?? raw.usersCount ?? raw.totalUsers ?? raw.clientsCount ?? 0
          ),
          activeAuctionsCount: Number(
            raw.activeAuctionsCount ?? raw.auctionsCount ?? raw.totalAuctions ?? 0
          ),
          totalRevenue: raw.totalRevenue ? Number(raw.totalRevenue) : 0,
          activeListingsCount: raw.activeListingsCount ? Number(raw.activeListingsCount) : 0,
        };

        return {
          success: true,
          data: normalizedStats,
          message: response.message || "Stats loaded successfully",
        };
      }

      return {
        success: true,
        data: mockOverviewStats,
        message: "Loaded fallback stats",
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats from API:", error);
      return {
        success: true,
        data: mockOverviewStats,
        message: "Fallback stats loaded",
      };
    }
  },

  /**
   * Fetch Top / Recent Auctions from GET /api/Auctions/GetAuctions
   */
  getTopAuctions: async (): Promise<ApiResponse<TopAuctionItem[]>> => {
    try {
      const response = await apiClient.get<unknown>(apiConfig.endpoints.auctions.list, {
        params: {
          PageNumber: 1,
          PageSize: 5,
          SortBy: "CreatedDate",
          SortDirection: "desc",
        },
      });

      let rawList: Record<string, unknown>[] = [];

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
        } else if (typeof response.data === "object") {
          const obj = response.data as { items?: Record<string, unknown>[]; data?: Record<string, unknown>[] };
          if (Array.isArray(obj.items)) rawList = obj.items;
          else if (Array.isArray(obj.data)) rawList = obj.data;
        }
      }

      const items: TopAuctionItem[] = rawList.map((item, index) => {
        const id = String(item.id ?? item.auctionId ?? `auction-${index + 1}`);
        const name = String(item.title ?? item.name ?? item.productName ?? `مزاد #${id}`);
        const sellerName = String(
          item.sellerName ?? item.userName ?? item.ownerName ?? item.storeName ?? "بائع معتمد"
        );
        const viewsCount = Number(item.viewsCount ?? item.viewCount ?? item.bidsCount ?? 0);
        const bidsCount = Number(item.bidsCount ?? item.totalBids ?? 0);
        const imageUrl = item.image || item.imageUrl || (Array.isArray(item.images) ? item.images[0] : undefined);

        return {
          id,
          name,
          sellerName,
          viewsCount,
          bidsCount,
          imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
        };
      });

      return {
        success: true,
        data: items,
        message: "Top auctions loaded",
      };
    } catch (error) {
      console.error("Failed to fetch top auctions:", error);
      return {
        success: true,
        data: [],
        message: "Fallback top auctions loaded",
      };
    }
  },

  /**
   * Fetch Top / Active Live Streams from GET /api/LiveStreams/GetLives
   */
  getTopLiveStreams: async (): Promise<ApiResponse<TopLiveStreamItem[]>> => {
    try {
      const response = await apiClient.get<unknown>("/LiveStreams/GetLives", {
        params: {
          PageNumber: 1,
          PageSize: 5,
          IsActive: true,
        },
      });

      let rawList: Record<string, unknown>[] = [];

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
        } else if (typeof response.data === "object") {
          const obj = response.data as { items?: Record<string, unknown>[]; data?: Record<string, unknown>[] };
          if (Array.isArray(obj.items)) rawList = obj.items;
          else if (Array.isArray(obj.data)) rawList = obj.data;
        }
      }

      const items: TopLiveStreamItem[] = rawList.map((item, index) => {
        const id = String(item.id ?? item.liveStreamId ?? `live-${index + 1}`);
        const name = String(item.live_Name ?? item.name ?? item.title ?? `بث مباشر #${id}`);
        const sellerName = String(
          item.sellerName ?? item.userName ?? item.streamerName ?? "مقدم البث"
        );
        const viewsCount = Number(item.viewsCount ?? item.viewerCount ?? item.viewers ?? 0);
        const isLive = item.isActive !== undefined ? Boolean(item.isActive) : true;

        return {
          id,
          name,
          sellerName,
          viewsCount,
          isLive,
        };
      });

      return {
        success: true,
        data: items,
        message: "Top live streams loaded",
      };
    } catch (error) {
      console.error("Failed to fetch live streams:", error);
      return {
        success: true,
        data: [],
        message: "Fallback live streams loaded",
      };
    }
  },

  getPlatformGrowth: async (): Promise<ApiResponse<PlatformGrowthDataPoint[]>> => {
    return {
      success: true,
      data: mockPlatformGrowthData,
      message: "Loaded platform growth data",
    };
  },

  getAuctionTrends: async (timeframe?: string): Promise<ApiResponse<AuctionCompletionTrendPoint[]>> => {
    return {
      success: true,
      data: mockAuctionTrendsData,
      message: `Loaded auction trends data (${timeframe || "all"})`,
    };
  },
};
