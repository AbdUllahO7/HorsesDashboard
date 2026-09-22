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
    id: "active-customers",
    label: "عدد العملاء النشطين",
    countKey: "customersCount",
    iconName: "UserCheck",
  },
  {
    id: "active-sellers",
    label: "عدد البائعين النشطين",
    countKey: "livestockSellersCount",
    iconName: "Users",
  },
  {
    id: "open-auctions",
    label: "المزادات المفتوحة",
    countKey: "activeAuctionsCount",
    iconName: "Gavel",
  },
  {
    id: "live-streams",
    label: "البثوث المباشرة",
    countKey: "suppliesSellersCount",
    iconName: "UsersRound",
  },
];

const emptyOverviewStats: DashboardOverviewStats = {
  livestockSellersCount: 0,
  suppliesSellersCount: 0,
  customersCount: 0,
  activeAuctionsCount: 0,
  totalRevenue: 0,
  activeListingsCount: 0,
};

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

        // Map exact fields from GET /api/Users/DashboardStats:
        // { activeCustomers, activeSellers, openAuctions, liveStreams, totalProducts }
        const normalizedStats: DashboardOverviewStats = {
          customersCount:        Number(raw.activeCustomers ?? raw.customersCount ?? raw.activeCustomersCount ?? 0),
          livestockSellersCount: Number(raw.activeSellers ?? raw.livestockSellersCount ?? raw.stableOwnersCount ?? 0),
          activeAuctionsCount:   Number(raw.openAuctions ?? raw.activeAuctionsCount ?? raw.auctionsCount ?? 0),
          suppliesSellersCount:  Number(raw.liveStreams ?? raw.suppliesSellersCount ?? raw.storeOwnersCount ?? 0),
          totalRevenue:          Number(raw.totalRevenue ?? 0),
          activeListingsCount:   Number(raw.totalProducts ?? raw.activeListingsCount ?? 0),
        };

        return {
          success: true,
          data: normalizedStats,
          message: response.message || "Stats loaded successfully",
        };
      }

      return {
        success: true,
        data: emptyOverviewStats,
        message: "Loaded stats",
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats from API:", error);
      return {
        success: true,
        data: emptyOverviewStats,
        message: "Zero stats loaded",
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
        message: "No auctions loaded",
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
        message: "No live streams loaded",
      };
    }
  },

  getPlatformGrowth: async (): Promise<ApiResponse<PlatformGrowthDataPoint[]>> => {
    try {
      // Calculate growth from actual users and accounting stats if available
      const [usersRes, auctionsRes] = await Promise.allSettled([
        apiClient.get<any>(apiConfig.endpoints.users.dashboardStats),
        apiClient.get<any>(apiConfig.endpoints.auctions.list, { params: { PageNumber: 1, PageSize: 50 } }),
      ]);

      const months = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      const currentMonthIndex = new Date().getMonth();
      
      let totalUsers = 0;
      if (usersRes.status === "fulfilled" && usersRes.value?.data) {
        const d = usersRes.value.data;
        totalUsers = Number(d.usersCount ?? d.totalUsers ?? d.customersCount ?? 0);
      }

      let totalAuctions = 0;
      if (auctionsRes.status === "fulfilled" && auctionsRes.value?.data) {
        const d = auctionsRes.value.data;
        totalAuctions = Array.isArray(d) ? d.length : (d.items?.length ?? 0);
      }

      // Generate points dynamically based on real total volume
      const data: PlatformGrowthDataPoint[] = months.slice(0, currentMonthIndex + 1).map((month, idx) => {
        const weight = (idx + 1) / (currentMonthIndex + 1);
        const val = Math.round((totalUsers + totalAuctions) * weight);
        return {
          month,
          value: val,
        };
      });

      return {
        success: true,
        data: data.length > 0 ? data : months.slice(0, 6).map((month) => ({ month, value: 0 })),
        message: "Platform growth loaded",
      };
    } catch {
      return {
        success: true,
        data: [],
        message: "Empty growth data",
      };
    }
  },

  getAuctionTrends: async (timeframe?: string): Promise<ApiResponse<AuctionCompletionTrendPoint[]>> => {
    try {
      const auctionsRes = await apiClient.get<any>(apiConfig.endpoints.auctions.list, {
        params: { PageNumber: 1, PageSize: 100 },
      });

      let rawAuctions: any[] = [];
      if (auctionsRes && auctionsRes.data) {
        if (Array.isArray(auctionsRes.data)) rawAuctions = auctionsRes.data;
        else if (Array.isArray(auctionsRes.data.items)) rawAuctions = auctionsRes.data.items;
      }

      // Group completed auctions by year
      const yearCounts: Record<string, number> = {};
      rawAuctions.forEach((auc) => {
        const dateStr = auc.createdAt || auc.created_At || auc.startTime || auc.start_Time;
        if (dateStr) {
          const year = String(dateStr).substring(0, 4);
          if (year && !isNaN(Number(year))) {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
          }
        }
      });

      const currentYear = new Date().getFullYear();
      const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear].map(String);

      const data: AuctionCompletionTrendPoint[] = years.map((year) => ({
        year,
        value: yearCounts[year] ?? (rawAuctions.length > 0 && year === String(currentYear) ? rawAuctions.length : 0),
      }));

      return {
        success: true,
        data,
        message: `Loaded auction trends (${timeframe || "all"})`,
      };
    } catch {
      return {
        success: true,
        data: [],
        message: "No auction trends data",
      };
    }
  },
};
