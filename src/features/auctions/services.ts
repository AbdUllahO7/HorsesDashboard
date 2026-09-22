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

const parseImageUrl = (img?: unknown): string => {
  if (!img) return "/images/placeholder-horse.png";
  let str = "";
  if (typeof img === "object" && img !== null) {
    const o = img as Record<string, unknown>;
    str = String(
      o.image_Name ||
      o.imageName ||
      o.url ||
      o.imageUrl ||
      o.image_Url ||
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
  const cleanName = str.replace(/^\/?img\//, "").replace(/^\//, "");
  return `https://api.horses.market/img/${cleanName}`;
};

const isPhoneNumber = (val?: unknown): boolean => {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.startsWith("+")) return true;
  return /^[0-9\s\-+()]{7,}$/.test(trimmed);
};

const sellerDetailsCache = new Map<string, { sellerName: string; sellerPhone?: string }>();

const extractSellerInfo = (item: Record<string, unknown>): { sellerName: string; sellerPhone?: string } => {
  let sellerName = "";
  let sellerPhone = "";

  const checkCandidate = (cand: unknown) => {
    if (!cand || typeof cand !== "string") return;
    const str = cand.trim();
    if (!str) return;
    if (isPhoneNumber(str)) {
      if (!sellerPhone) sellerPhone = str;
    } else {
      if (!sellerName) sellerName = str;
    }
  };

  // 1. Direct API fields
  if (item.user_Name && typeof item.user_Name === "string") {
    checkCandidate(item.user_Name);
  }
  if (item.userName && typeof item.userName === "string") {
    checkCandidate(item.userName);
  }
  if (item.fullName && typeof item.fullName === "string") {
    checkCandidate(item.fullName);
  }
  if (item.name && typeof item.name === "string" && item.name !== item.title) {
    checkCandidate(item.name);
  }
  if (item.seller_Phone_Number && typeof item.seller_Phone_Number === "string") {
    sellerPhone = item.seller_Phone_Number.trim();
  }
  if (item.seller_Name && typeof item.seller_Name === "string") {
    checkCandidate(item.seller_Name);
  }
  if (item.sellerName && typeof item.sellerName === "string") {
    checkCandidate(item.sellerName);
  }

  // 2. Check nested user or seller objects
  if (item.user && typeof item.user === "object") {
    const u = item.user as Record<string, unknown>;
    checkCandidate(u.fullName);
    checkCandidate(u.name);
    checkCandidate(u.user_Name);
    checkCandidate(u.userName);
    checkCandidate(u.stableName);
    checkCandidate(u.storeName);
    if (u.phoneNumber && typeof u.phoneNumber === "string") sellerPhone = u.phoneNumber.trim();
    if (u.phone && typeof u.phone === "string") sellerPhone = u.phone.trim();
  }
  if (item.seller && typeof item.seller === "object") {
    const s = item.seller as Record<string, unknown>;
    checkCandidate(s.fullName);
    checkCandidate(s.name);
    checkCandidate(s.userName);
    checkCandidate(s.stableName);
    checkCandidate(s.storeName);
    if (s.phoneNumber && typeof s.phoneNumber === "string") sellerPhone = s.phoneNumber.trim();
    if (s.phone && typeof s.phone === "string") sellerPhone = s.phone.trim();
  }

  if (!sellerPhone && isPhoneNumber(item.seller_Name)) {
    sellerPhone = String(item.seller_Name).trim();
  }
  if (!sellerPhone && isPhoneNumber(item.sellerName)) {
    sellerPhone = String(item.sellerName).trim();
  }

  if (!sellerName) {
    if (sellerPhone) sellerName = `بائع (${sellerPhone})`;
    else if (item.seller_Id || item.sellerId) sellerName = `بائع #${item.seller_Id || item.sellerId}`;
    else sellerName = "بائع معتمد";
  }

  return { sellerName, sellerPhone: sellerPhone || undefined };
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
        data: {
          totalAuctions: 0,
          activeAuctions: 0,
          completedAuctions: 0,
          stoppedAuctions: 0,
        },
        message: "Loaded stats",
      };
    } catch {
      return {
        success: true,
        data: {
          totalAuctions: 0,
          activeAuctions: 0,
          completedAuctions: 0,
          stoppedAuctions: 0,
        },
        message: "Zero auction stats",
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

      // Parallel fetch of seller names for items on current page
      const items: AuctionTableItem[] = await Promise.all(
        rawList.map(async (item, index) => {
          const id = String(item.id ?? item.auctionId ?? `auc-${index + 1}`);
          const title = String(item.title ?? item.name ?? "مزاد خيل");

          let sellerInfo = extractSellerInfo(item);

          // If user_Name was not present directly in the list response, fetch from details or cache
          if (!item.user_Name && !item.userName && id && !id.startsWith("auc-")) {
            const cached = sellerDetailsCache.get(id);
            if (cached) {
              sellerInfo = cached;
            } else {
              try {
                const detailRes = await apiClient.get<Record<string, unknown>>(
                  apiConfig.endpoints.auctions.details(id)
                );
                const resData = (detailRes.data || detailRes) as Record<string, unknown>;
                const detailData = (resData.data || resData.value || resData) as Record<string, unknown>;
                if (detailData && typeof detailData === "object") {
                  sellerInfo = extractSellerInfo(detailData);
                  sellerDetailsCache.set(id, sellerInfo);
                }
              } catch {
                // keep current sellerInfo
              }
            }
          }

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

          const totalBids = Number(item.bids_Count ?? item.totalBids ?? item.bidsCount ?? item.bidCount ?? 0);
          const startingPrice = Number(item.start_Price ?? item.startingPrice ?? item.price ?? 0);
          const currentBid = Number(item.current_Price ?? item.currentBid ?? item.highestBid ?? startingPrice);
          const isLiveEnabled = Boolean(item.isLive ?? item.isLiveEnabled ?? item.hasLiveStream ?? false);
          const createdAt = item.start_Time
            ? String(item.start_Time).split("T")[0]
            : item.createdAt
            ? String(item.createdAt).split("T")[0]
            : "2026-09-20";

          let rawImages: unknown[] = [];
          if (item.image_Name) rawImages.push(item.image_Name);
          if (Array.isArray(item.images)) rawImages.push(...item.images);
          else if (Array.isArray(item.auctionImages)) rawImages.push(...item.auctionImages);
          else if (Array.isArray(item.auction_Images)) rawImages.push(...item.auction_Images);
          else if (item.imageUrl || item.image_Url || item.image || item.photo) {
            rawImages.push(item.imageUrl ?? item.image_Url ?? item.image ?? item.photo);
          }

          const images = rawImages.map(parseImageUrl);

          return {
            id,
            title,
            sellerName: sellerInfo.sellerName,
            sellerPhone: sellerInfo.sellerPhone,
            sellerId: item.seller_Id ? String(item.seller_Id) : (item.userId ? String(item.userId) : undefined),
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
            startDate: item.start_Time ? String(item.start_Time) : undefined,
            endDate: item.end_Time ? String(item.end_Time) : undefined,
          };
        })
      );

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
          items: [],
          pagination: {
            currentPage: params?.page || 1,
            totalPages: 1,
            pageSize: params?.limit || 10,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: "No auctions loaded",
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

      const { sellerName, sellerPhone } = extractSellerInfo(item);
      sellerDetailsCache.set(String(id), { sellerName, sellerPhone });

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
      if (item.image_Name) rawImages.push(item.image_Name);
      if (Array.isArray(item.images)) rawImages.push(...item.images);
      else if (Array.isArray(item.auctionImages)) rawImages.push(...item.auctionImages);
      else if (Array.isArray(item.auction_Images)) rawImages.push(...item.auction_Images);
      else if (Array.isArray(item.photos)) rawImages.push(...item.photos);
      else if (item.imageUrl || item.image_Url || item.image || item.photo) {
        rawImages.push(item.imageUrl ?? item.image_Url ?? item.image ?? item.photo);
      }

      const images = rawImages.map(parseImageUrl);

      let bidsHistory: AuctionDetailsData["bidsHistory"] = [];
      if (Array.isArray(item.bids)) {
        bidsHistory = (item.bids as Record<string, unknown>[]).map((b, i) => ({
          id: b.id ? String(b.id) : i + 1,
          bidderName: String(b.customer_Name ?? b.customerName ?? b.userName ?? b.bidderName ?? b.fullName ?? "مزايد"),
          amount: Number(b.amount ?? b.price ?? 0),
          createdAt: b.created_At
            ? String(b.created_At).replace("T", " ").substring(0, 16)
            : b.createdAt
            ? String(b.createdAt).replace("T", " ").substring(0, 16)
            : "2026-09-20",
        }));
      }

      const totalBids = Number(
        item.bids_Count ??
        (Array.isArray(item.bids) ? item.bids.length : 0)
      );

      return {
        success: true,
        data: {
          id: String(id),
          title,
          sellerName,
          sellerPhone,
          sellerId: item.seller_Id ? String(item.seller_Id) : (item.userId ? String(item.userId) : undefined),
          category,
          status,
          statusLabel,
          totalBids,
          createdAt: item.start_Time
            ? String(item.start_Time).split("T")[0]
            : item.createdAt
            ? String(item.createdAt).split("T")[0]
            : "2026-09-20",
          isLiveEnabled: Boolean(item.isLive ?? item.isLiveEnabled ?? false),
          startingPrice: Number(item.start_Price ?? item.startingPrice ?? 0),
          currentBid: Number(item.current_Price ?? item.currentBid ?? item.highestBid ?? item.start_Price ?? 0),
          images,
          description: item.description ? String(item.description) : undefined,
          address: item.address ? String(item.address) : undefined,
          bidsHistory,
        },
        message: "Auction details loaded",
      };
    } catch (error) {
      console.error("Failed to load auction details:", error);
      return {
        success: false,
        data: {
          id: String(id),
          title: `مزاد #${id}`,
          sellerName: "غير محدد",
          category: "خيول",
          status: "stopped",
          statusLabel: "غير متوفر",
          totalBids: 0,
          createdAt: "2026-09-20",
          isLiveEnabled: false,
          startingPrice: 0,
          currentBid: 0,
          images: [],
          bidsHistory: [],
        },
        message: "تعذر تحميل تفاصيل المزاد",
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
      const err = error as { message?: string; statusCode?: number; response?: { status?: number; data?: { message?: string } } };
      const rawMsg = err?.response?.data?.message || err?.message;
      const msg =
        rawMsg && rawMsg !== "Error" && !rawMsg.includes("HTTP Error")
          ? `حدث خطأ ما: ${rawMsg}`
          : (err?.statusCode === 403 || err?.response?.status === 403
            ? "حدث خطأ ما: غير مصرح بهذا الإجراء (403 Forbidden) - قبول المزاد مخصص لمالك المزاد أو بحاجة لصلاحية الإدارة في السيرفر"
            : "حدث خطأ ما أثناء قبول المزاد، يرجى المحاولة مرة أخرى");
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
      const err = error as { message?: string; statusCode?: number; response?: { status?: number; data?: { message?: string } } };
      const rawMsg = err?.response?.data?.message || err?.message;
      const msg =
        rawMsg && rawMsg !== "Error" && !rawMsg.includes("HTTP Error")
          ? `حدث خطأ ما: ${rawMsg}`
          : (err?.statusCode === 403 || err?.response?.status === 403
            ? "حدث خطأ ما: غير مصرح بهذا الإجراء (403 Forbidden)"
            : "حدث خطأ ما أثناء إيقاف المزاد، يرجى المحاولة مرة أخرى");
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
      const err = error as { message?: string; statusCode?: number; response?: { status?: number; data?: { message?: string } } };
      const rawMsg = err?.response?.data?.message || err?.message;
      const msg =
        rawMsg && rawMsg !== "Error" && !rawMsg.includes("HTTP Error")
          ? `حدث خطأ ما: ${rawMsg}`
          : (err?.statusCode === 403 || err?.response?.status === 403
            ? "حدث خطأ ما: غير مصرح بهذا الإجراء (403 Forbidden) - حذف المزاد متاح فقط لمالك المزاد (البائع)"
            : "حدث خطأ ما أثناء حذف المزاد، يرجى المحاولة مرة أخرى");
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
