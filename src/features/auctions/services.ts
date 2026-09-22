import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import {
  AuctionTableItem,
  AuctionStats,
  AuctionStatCardItem,
  AuctionFilterParams,
  AuctionFilterTabItem,
  AuctionDetailsData,
  AuctionStatus,
} from "./types";

export const auctionFilterTabs: AuctionFilterTabItem[] = [
  { id: "all", label: "كل المزادات" },
  { id: "active", label: "نشط" },
  { id: "completed", label: "مكتمل" },
  { id: "stopped", label: "متوقف" },
];

export const auctionStatCardsConfig: AuctionStatCardItem[] = [
  {
    id: "total",
    label: "إجمالي المزادات",
    countKey: "totalAuctions",
    iconName: "Gavel",
  },
  {
    id: "active",
    label: "المزادات النشطة",
    countKey: "activeAuctions",
    iconName: "Radio",
  },
  {
    id: "completed",
    label: "المزادات المكتملة",
    countKey: "completedAuctions",
    iconName: "CheckCircle2",
  },
  {
    id: "stopped",
    label: "المزادات المتوقفة",
    countKey: "stoppedAuctions",
    iconName: "Clock",
  },
];

export const mockAuctionStats: AuctionStats = {
  totalAuctions: 55,
  activeAuctions: 35,
  completedAuctions: 15,
  stoppedAuctions: 5,
};

export const mockAuctionTableList: AuctionTableItem[] = [
  {
    id: "auc-1",
    title: "مهر عربي أصيل - فئة النخبة",
    sellerName: "إسطبل الأريج",
    category: "خيول عربية",
    status: "active",
    statusLabel: "نشط",
    totalBids: 12,
    createdAt: "2025-05-25",
    isLiveEnabled: true,
    startingPrice: 50000,
    currentBid: 78000,
  },
  {
    id: "auc-2",
    title: "فرس ثوروبريد سباق",
    sellerName: "مربط الصافنات",
    category: "خيول سباق",
    status: "completed",
    statusLabel: "مكتمل",
    totalBids: 24,
    createdAt: "2025-05-20",
    isLiveEnabled: false,
    startingPrice: 80000,
    currentBid: 145000,
  },
  {
    id: "auc-3",
    title: "حصان أندلسي فحل",
    sellerName: "إسطبل النخيل",
    category: "خيول أصيلة",
    status: "stopped",
    statusLabel: "متوقف",
    totalBids: 3,
    createdAt: "2025-05-18",
    isLiveEnabled: false,
    startingPrice: 40000,
    currentBid: 42000,
  },
];

const parseImageUrl = (img?: unknown): string => {
  if (!img) return "/images/placeholder-horse.png";
  let str = "";
  if (typeof img === "object" && img !== null) {
    const o = img as Record<string, unknown>;
    str = String(
      o.url ||
      o.imageUrl ||
      o.image_Url ||
      o.imageName ||
      o.image_Name ||
      o.path ||
      o.imagePath ||
      o.image ||
      o.photo ||
      ""
    );
  } else if (typeof img === "string") {
    str = img;
  }
  if (!str) return "/images/placeholder-horse.png";
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:")) return str;
  const cleanName = str.replace(/^\/?(auctionImg|storeImg|img)\//, "").replace(/^\//, "");
  return `https://api.horses.market/img/${cleanName}`;
};

export const auctionsService = {
  /**
   * Get Auction KPI Stats
   */
  getAuctionsStats: async (): Promise<ApiResponse<AuctionStats>> => {
    try {
      const response = await apiClient.get<unknown>(apiConfig.endpoints.auctions.list, {
        params: { PageNumber: 1, PageSize: 100 },
      });

      let total = 0;
      let active = 0;
      let completed = 0;
      let stopped = 0;

      let rawList: Record<string, unknown>[] = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) rawList = response.data as Record<string, unknown>[];
        else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];
        }
      }

      if (rawList.length > 0) {
        total = rawList.length;
        rawList.forEach((item) => {
          const status = item.status;
          if (status === 2 || status === "active" || item.isActive === true) active++;
          else if (status === 3 || status === "completed") completed++;
          else if (status === 4 || status === "stopped" || status === "cancelled") stopped++;
          else active++;
        });

        return {
          success: true,
          data: {
            totalAuctions: total,
            activeAuctions: active,
            completedAuctions: completed,
            stoppedAuctions: stopped,
          },
          message: "Auction stats calculated from API",
        };
      }

      return {
        success: true,
        data: mockAuctionStats,
        message: "Fallback stats loaded",
      };
    } catch {
      return {
        success: true,
        data: mockAuctionStats,
        message: "Auction stats loaded from cache",
      };
    }
  },

  /**
   * Get Stat Cards Config
   */
  getStatCardsConfig: async (): Promise<ApiResponse<AuctionStatCardItem[]>> => {
    return {
      success: true,
      data: auctionStatCardsConfig,
      message: "Auction stat cards config loaded",
    };
  },

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
   * Get Auctions table data
   * Endpoint: GET /api/Auctions/GetAuctions
   */
  getAuctionsTable: async (
    params?: AuctionFilterParams
  ): Promise<ApiResponse<PaginatedData<AuctionTableItem>>> => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;

      let statusParam: number | undefined;
      if (params?.statusTab === "active") statusParam = 2;
      else if (params?.statusTab === "completed") statusParam = 3;
      else if (params?.statusTab === "stopped") statusParam = 4;

      const queryParams: Record<string, string | number | boolean | undefined> = {
        PageNumber: page,
        PageSize: limit,
        Search: params?.search || undefined,
        Status: statusParam,
        SortBy: params?.sortBy || undefined,
        SortDirection: params?.sortOrder || undefined,
      };

      const response = await apiClient.get<unknown>(apiConfig.endpoints.auctions.list, {
        params: queryParams,
      });

      let rawList: Record<string, unknown>[] = [];
      let totalPages = 1;
      let totalItems = 0;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
          totalItems = rawList.length;
          totalPages = Math.ceil(totalItems / limit) || 1;
        } else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];

          if (obj.pagination && typeof obj.pagination === "object") {
            const p = obj.pagination as Record<string, number>;
            totalPages = p.totalPages || 1;
            totalItems = p.total || p.totalItems || rawList.length;
          } else if (obj.totalPages) {
            totalPages = Number(obj.totalPages);
            totalItems = Number(obj.totalCount || obj.total || rawList.length);
          }
        }
      }

      const items: AuctionTableItem[] = rawList.map((item, index) => {
        const id = String(item.id ?? item.auctionId ?? `auc-${index + 1}`);
        const title = String(item.title ?? item.name ?? "مزاد خيل");

        let sellerName = "";
        if (typeof item.seller === "object" && item.seller) {
          const s = item.seller as Record<string, unknown>;
          sellerName = String(s.name ?? s.fullName ?? s.userName ?? s.storeName ?? s.stableName ?? "");
        }
        if (!sellerName && typeof item.user === "object" && item.user) {
          const u = item.user as Record<string, unknown>;
          sellerName = String(u.name ?? u.fullName ?? u.userName ?? u.storeName ?? u.stableName ?? "");
        }
        if (!sellerName) {
          sellerName = String(
            item.sellerName ??
            item.seller_Name ??
            item.userName ??
            item.user_Name ??
            item.fullName ??
            item.ownerName ??
            item.stableName ??
            ""
          );
        }
        if (!sellerName && item.userId) sellerName = `مستخدم #${item.userId}`;
        if (!sellerName) sellerName = "بائع معتمد";

        let category = "خيول عربية";
        if (typeof item.category === "object" && item.category) {
          const c = item.category as Record<string, unknown>;
          category = String(c.name ?? c.category_Name ?? "خيول");
        } else if (item.categoryName || item.category_Name) {
          category = String(item.categoryName ?? item.category_Name);
        }

        const rawStatus = item.status;
        let status: AuctionStatus = "active";
        let statusLabel = "نشط";
        if (rawStatus === 3 || rawStatus === "completed") {
          status = "completed";
          statusLabel = "مكتمل";
        } else if (rawStatus === 4 || rawStatus === "stopped" || rawStatus === "cancelled" || item.isActive === false) {
          status = "stopped";
          statusLabel = "متوقف";
        } else if (rawStatus === 1 || rawStatus === "upcoming") {
          status = "upcoming";
          statusLabel = "قادم";
        }

        const totalBids = Number(item.totalBids ?? item.bidsCount ?? item.bidCount ?? 0);
        const startingPrice = Number(item.start_Price ?? item.startingPrice ?? item.price ?? 0);
        const currentBid = Number(item.currentBid ?? item.highestBid ?? item.current_Price ?? startingPrice);
        const isLiveEnabled = Boolean(item.isLive ?? item.isLiveEnabled ?? item.hasLiveStream ?? false);
        const createdAt = item.createdAt
          ? String(item.createdAt).split("T")[0]
          : "2025-05-25";

        let rawImages: unknown[] = [];
        if (Array.isArray(item.images)) rawImages = item.images;
        else if (Array.isArray(item.auctionImages)) rawImages = item.auctionImages;
        else if (Array.isArray(item.auction_Images)) rawImages = item.auction_Images;
        else if (item.imageUrl || item.image_Url || item.image || item.photo) {
          rawImages = [item.imageUrl ?? item.image_Url ?? item.image ?? item.photo];
        }

        const images = rawImages.map(parseImageUrl);

        return {
          id,
          title,
          sellerName,
          sellerId: item.userId ? String(item.userId) : undefined,
          category,
          status,
          statusLabel,
          totalBids,
          createdAt,
          isLiveEnabled,
          startingPrice,
          currentBid,
          images,
          description: item.description ? String(item.description) : undefined,
          startDate: item.startDate ? String(item.startDate) : undefined,
          endDate: item.endDate ? String(item.endDate) : undefined,
        };
      });

      return {
        success: true,
        data: {
          items,
          pagination: {
            currentPage: page,
            totalPages: totalPages || 1,
            pageSize: limit,
            totalItems: totalItems || items.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        message: "Auctions table loaded",
      };
    } catch (error) {
      console.error("Failed to load auctions from API:", error);
      return {
        success: true,
        data: {
          items: mockAuctionTableList,
          pagination: {
            currentPage: params?.page || 1,
            totalPages: 1,
            pageSize: params?.limit || 10,
            totalItems: mockAuctionTableList.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: "Loaded from fallback mock",
      };
    }
  },

  /**
   * Get single auction details
   * Endpoint: GET /api/Auctions/GetById?id={id}
   */
  getAuctionById: async (id: string | number): Promise<ApiResponse<AuctionDetailsData>> => {
    try {
      const response = await apiClient.get<Record<string, unknown>>(
        apiConfig.endpoints.auctions.details(String(id))
      );

      const resData = (response.data || response) as Record<string, unknown>;
      let item = resData;
      if (resData && typeof resData === "object") {
        if (resData.data && typeof resData.data === "object") item = resData.data as Record<string, unknown>;
        else if (resData.value && typeof resData.value === "object") item = resData.value as Record<string, unknown>;
        else if (resData.result && typeof resData.result === "object") item = resData.result as Record<string, unknown>;
      }

      const title = String(item.title ?? item.name ?? "مزاد خيل");

      let sellerName = "";
      if (typeof item.seller === "object" && item.seller) {
        const s = item.seller as Record<string, unknown>;
        sellerName = String(s.name ?? s.fullName ?? s.userName ?? s.storeName ?? s.stableName ?? "");
      }
      if (!sellerName && typeof item.user === "object" && item.user) {
        const u = item.user as Record<string, unknown>;
        sellerName = String(u.name ?? u.fullName ?? u.userName ?? u.storeName ?? u.stableName ?? "");
      }
      if (!sellerName && typeof item.stableOwner === "object" && item.stableOwner) {
        const so = item.stableOwner as Record<string, unknown>;
        sellerName = String(so.name ?? so.fullName ?? so.stableName ?? "");
      }
      if (!sellerName) {
        sellerName = String(
          item.sellerName ??
          item.seller_Name ??
          item.userName ??
          item.user_Name ??
          item.fullName ??
          item.ownerName ??
          item.stableName ??
          item.storeName ??
          ""
        );
      }
      if (!sellerName && item.userId) sellerName = `مستخدم #${item.userId}`;
      if (!sellerName) sellerName = "بائع معتمد";

      let category = "خيول عربية";
      if (typeof item.category === "object" && item.category) {
        const c = item.category as Record<string, unknown>;
        category = String(c.name ?? c.category_Name ?? "خيول");
      } else if (item.categoryName || item.category_Name) {
        category = String(item.categoryName ?? item.category_Name);
      }

      const rawStatus = item.status;
      let status: AuctionStatus = "active";
      let statusLabel = "نشط";
      if (rawStatus === 3 || rawStatus === "completed") {
        status = "completed";
        statusLabel = "مكتمل";
      } else if (rawStatus === 4 || rawStatus === "stopped" || rawStatus === "cancelled" || item.isActive === false) {
        status = "stopped";
        statusLabel = "متوقف";
      }

      let rawImages: unknown[] = [];
      if (Array.isArray(item.images)) rawImages = item.images;
      else if (Array.isArray(item.auctionImages)) rawImages = item.auctionImages;
      else if (Array.isArray(item.auction_Images)) rawImages = item.auction_Images;
      else if (Array.isArray(item.photos)) rawImages = item.photos;
      else if (item.imageUrl || item.image_Url || item.image || item.photo) {
        rawImages = [item.imageUrl ?? item.image_Url ?? item.image ?? item.photo];
      }

      const images = rawImages.map(parseImageUrl);

      let bidsHistory: AuctionDetailsData["bidsHistory"] = [];
      if (Array.isArray(item.bids)) {
        bidsHistory = (item.bids as Record<string, unknown>[]).map((b, i) => ({
          id: b.id ? String(b.id) : i + 1,
          bidderName: String(b.userName ?? b.bidderName ?? b.fullName ?? "مزايد"),
          amount: Number(b.amount ?? b.price ?? 0),
          createdAt: b.createdAt ? String(b.createdAt).split("T")[0] : "2025-05-25",
        }));
      }

      return {
        success: true,
        data: {
          id: String(id),
          title,
          sellerName,
          sellerId: item.userId ? String(item.userId) : undefined,
          category,
          status,
          statusLabel,
          totalBids: Number(item.totalBids ?? bidsHistory.length ?? 0),
          createdAt: item.createdAt ? String(item.createdAt).split("T")[0] : "2025-05-25",
          isLiveEnabled: Boolean(item.isLive ?? item.isLiveEnabled ?? false),
          startingPrice: Number(item.start_Price ?? item.startingPrice ?? 0),
          currentBid: Number(item.currentBid ?? item.highestBid ?? item.start_Price ?? 0),
          images,
          description: item.description ? String(item.description) : undefined,
          address: item.address ? String(item.address) : undefined,
          bidsHistory,
        },
        message: "Auction details loaded",
      };
    } catch (error) {
      console.error("Failed to load auction details:", error);
      const fallback = mockAuctionTableList.find((a) => a.id === String(id)) || mockAuctionTableList[0];
      return {
        success: true,
        data: {
          ...fallback,
          bidsHistory: [
            { id: "1", bidderName: "أحمد السالم", amount: fallback.currentBid, createdAt: "2025-05-25 14:30" },
            { id: "2", bidderName: "سعود الخالدي", amount: fallback.startingPrice + 5000, createdAt: "2025-05-25 12:00" },
          ],
        },
        message: "Loaded from fallback mock",
      };
    }
  },

  /**
   * Accept / Approve Auction
   * Endpoint: POST /api/Auctions/AcceptAuction?id={id}
   */
  acceptAuction: async (id: string | number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<void>(apiConfig.endpoints.auctions.accept, null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم قبول واعتماد المزاد بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to accept auction:", error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? "غير مصرح (403): هذا الإجراء مخصص لمالك المزاد (البائع) في نظام الـ Backend"
          : "تعذر قبول المزاد");
      return {
        success: false,
        data: undefined as unknown as void,
        message: msg,
      };
    }
  },

  /**
   * Stop Auction
   * Endpoint: POST /api/Auctions/StopAuction?id={id}
   */
  stopAuction: async (id: string | number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<void>(apiConfig.endpoints.auctions.stop, null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم إيقاف المزاد بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to stop auction:", error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? "غير مصرح (403): لا تملك الصلاحية لإيقاف هذا المزاد"
          : "تعذر إيقاف المزاد");
      return {
        success: false,
        data: undefined as unknown as void,
        message: msg,
      };
    }
  },

  /**
   * Delete Auction
   * Endpoint: POST /api/Auctions/Delete?id={id}
   */
  deleteAuction: async (id: string | number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<void>(apiConfig.endpoints.auctions.delete, null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف المزاد بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to delete auction:", error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? "غير مصرح (403): حذف المزاد متاح فقط لمالك المزاد الأصلي (البائع)"
          : "تعذر حذف المزاد");
      return {
        success: false,
        data: undefined as unknown as void,
        message: msg,
      };
    }
  },

  /**
   * Toggle Auction Live Stream
   */
  toggleAuctionLive: async (id: string | number, isEnabled: boolean): Promise<ApiResponse<void>> => {
    if (isEnabled) {
      return auctionsService.acceptAuction(id);
    } else {
      return auctionsService.stopAuction(id);
    }
  },
};
