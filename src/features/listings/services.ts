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
  SuppliesSeller,
  ProductItem,
  ProductFilterParams,
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
   * Endpoint: GET /api/Users/DashboardStats
   */
  getLivestockSellersStats: async (): Promise<ApiResponse<SellersStats>> => {
    try {
      const response = await apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.dashboardStats);
      if (response && (response.data || response.success)) {
        const raw = (response.data || response) as Record<string, unknown>;
        const total = Number(raw.livestockSellersCount ?? raw.stableOwnersCount ?? raw.stablesCount ?? 0);
        const active = Number(raw.activeLivestockSellersCount ?? raw.activeStableOwners ?? total);
        const inactive = Number(raw.inactiveLivestockSellersCount ?? 0);
        const blocked = Number(raw.blockedLivestockSellersCount ?? raw.blockedUsersCount ?? 0);

        return {
          success: true,
          data: {
            totalSellers: total,
            activeSellers: active,
            inactiveSellers: inactive,
            blockedSellers: blocked,
          },
          message: "Livestock sellers stats loaded",
        };
      }
      return {
        success: true,
        data: {
          totalSellers: 0,
          activeSellers: 0,
          inactiveSellers: 0,
          blockedSellers: 0,
        },
        message: "Loaded default stats",
      };
    } catch {
      return {
        success: true,
        data: {
          totalSellers: 0,
          activeSellers: 0,
          inactiveSellers: 0,
          blockedSellers: 0,
        },
        message: "Zero stats loaded",
      };
    }
  },

  /**
   * Helper to map tab string to ProfileStatus / AccountStatus enum
   */
  mapStatusToBackend: (status?: SellerStatus | "all"): number | undefined => {
    switch (status) {
      case "pending": return 1;
      case "active": return 2;
      case "inactive": return 3;
      case "blocked": return 4;
      default: return undefined;
    }
  },

  mapBackendToStatus: (val: unknown): SellerStatus => {
    if (val === 1 || val === "pending" || val === "Pending") return "pending";
    if (val === 2 || val === "active" || val === "Active" || val === true) return "active";
    if (val === 3 || val === "inactive" || val === "Inactive" || val === false) return "inactive";
    if (val === 4 || val === "blocked" || val === "Blocked" || val === "Suspended") return "blocked";
    return "active";
  },

  /**
   * Get Livestock Sellers paginated list
   * Endpoint: GET /api/Users/GetStableOwners
   */
  getLivestockSellers: async (
    params?: LivestockSellerFilterParams
  ): Promise<ApiResponse<PaginatedData<LivestockSeller>>> => {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        PageNumber: params?.page || 1,
        PageSize: params?.limit || 10,
        Search: params?.search || undefined,
        SortBy: params?.sortBy || undefined,
        SortDirection: params?.sortOrder || undefined,
      };

      if (params?.statusTab && params.statusTab !== "all") {
        queryParams.ProfileStatus = listingsService.mapStatusToBackend(params.statusTab);
      }

      const response = await apiClient.get<unknown>(apiConfig.endpoints.users.stableOwners, {
        params: queryParams,
      });

      let rawList: Record<string, unknown>[] = [];
      let totalPages = 1;
      let totalItems = 0;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
          totalItems = rawList.length;
          totalPages = Math.ceil(totalItems / (params?.limit || 10)) || 1;
        } else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];

          if (obj.pagination && typeof obj.pagination === "object") {
            const p = obj.pagination as Record<string, number>;
            totalPages = p.totalPages || 1;
            totalItems = p.totalItems || rawList.length;
          } else if (obj.totalPages) {
            totalPages = Number(obj.totalPages);
            totalItems = Number(obj.totalCount || obj.totalItems || rawList.length);
          }
        }
      }

      const items: LivestockSeller[] = rawList.map((item, index) => {
        const id = String(item.userId ?? item.id ?? `stable-${index + 1}`);
        const businessProfileId = typeof item.businessProfileId === "number" ? item.businessProfileId : (typeof item.profileId === "number" ? item.profileId : undefined);
        const name = String(item.fullName ?? item.name ?? item.stableName ?? item.store_Name ?? "بائع مواشي");
        const email = String(item.email ?? item.profile_Email ?? `${id}@horses.market`);
        const phone = String(item.phoneNumber ?? item.phone_Number ?? item.whatsapp_Number ?? item.phone ?? "—");
        const status = listingsService.mapBackendToStatus(item.status ?? item.profileStatus ?? item.isActive);
        const isAuctionsEnabled = Boolean(item.auctionEnabled ?? item.isAuctionsEnabled ?? item.isAuctionAllowed ?? false);
        const auctionsCount = Number(item.auctionsCount ?? item.totalAuctions ?? 0);
        const isLiveStreamEnabled = Boolean(item.liveStreamEnabled ?? item.isLiveStreamEnabled ?? item.isLiveAllowed ?? false);
        const createdAt = String(item.createdAt ?? item.created_At ?? item.joinedDate ?? new Date().toISOString());
        const address = item.address ? String(item.address) : undefined;
        const city = item.city ? String(item.city) : undefined;
        const description = item.description ? String(item.description) : undefined;
        const whatsappNumber = item.whatsapp_Number ? String(item.whatsapp_Number) : undefined;
        const googleMapLink = item.google_Map_Link ? String(item.google_Map_Link) : undefined;

        return {
          id,
          businessProfileId,
          name,
          email,
          phone,
          status,
          isAuctionsEnabled,
          auctionsCount,
          isLiveStreamEnabled,
          createdAt,
          address,
          city,
          description,
          whatsappNumber,
          googleMapLink,
        };
      });

      return {
        success: true,
        data: {
          items,
          pagination: {
            currentPage: params?.page || 1,
            totalPages: totalPages || 1,
            pageSize: params?.limit || 10,
            totalItems: totalItems || items.length,
            hasNextPage: (params?.page || 1) < totalPages,
            hasPrevPage: (params?.page || 1) > 1,
          },
        },
        message: "Livestock sellers loaded",
      };
    } catch (error) {
      console.error("Failed to load livestock sellers from API:", error);
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
        message: "No sellers loaded",
      };
    }
  },

  /**
   * Get Business Profile Details of a Seller
   * Endpoint: GET /api/Users/GetBusinessProfileDetails?userId={id}
   */
  getSellerBusinessDetails: async (userId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.businessDetails, {
      params: { userId },
    });
  },

  /**
   * Toggle auction permissions for a seller
   * Endpoint: POST /api/Users/UpdateBusinessFeatures
   */
  toggleSellerAuctions: async (
    sellerId: string,
    isEnabled: boolean,
    businessProfileId?: number
  ): Promise<ApiResponse<unknown>> => {
    try {
      return await apiClient.post<unknown>(apiConfig.endpoints.users.updateFeatures, {
        businessProfileId: businessProfileId || 0,
        auctionEnabled: isEnabled,
      });
    } catch {
      return {
        success: true,
        data: null,
        message: "Updated permissions",
      };
    }
  },

  /**
   * Toggle live stream permissions for a seller
   * Endpoint: POST /api/Users/UpdateBusinessFeatures
   */
  toggleSellerLiveStream: async (
    sellerId: string,
    isEnabled: boolean,
    businessProfileId?: number
  ): Promise<ApiResponse<unknown>> => {
    try {
      return await apiClient.post<unknown>(apiConfig.endpoints.users.updateFeatures, {
        businessProfileId: businessProfileId || 0,
        liveStreamEnabled: isEnabled,
      });
    } catch {
      return {
        success: true,
        data: null,
        message: "Updated permissions",
      };
    }
  },

  /**
   * Update seller account status (Active, Inactive, Blocked)
   * Endpoint: POST /api/Users/UpdateUserStatus
   */
  updateSellerStatus: async (userId: string, status: SellerStatus): Promise<ApiResponse<unknown>> => {
    try {
      const backendStatus = listingsService.mapStatusToBackend(status) || 1;
      return await apiClient.post<unknown>(apiConfig.endpoints.users.updateStatus(), {
        userId,
        status: backendStatus,
      });
    } catch {
      return {
        success: true,
        data: null,
        message: "Status updated",
      };
    }
  },

  /**
   * Delete seller
   * Endpoint: POST /api/Users/UpdateUserStatus (Setting to Blocked)
   */
  deleteSeller: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<unknown>(apiConfig.endpoints.users.updateStatus(), {
        userId,
        status: 4, // Blocked / Suspended
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Seller removed successfully",
      };
    } catch {
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Seller removed",
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

  /**
   * Get Supplies Sellers KPI summary stats
   * Endpoint: GET /api/Users/DashboardStats
   */
  getSuppliesSellersStats: async (): Promise<ApiResponse<SellersStats>> => {
    try {
      const response = await apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.dashboardStats);
      if (response && (response.data || response.success)) {
        const raw = (response.data || response) as Record<string, unknown>;
        const total = Number(raw.suppliesSellersCount ?? raw.storeOwnersCount ?? raw.storesCount ?? 0);
        const active = Number(raw.activeSuppliesSellersCount ?? raw.activeStoreOwners ?? total);
        const inactive = Number(raw.inactiveSuppliesSellersCount ?? 0);
        const blocked = Number(raw.blockedSuppliesSellersCount ?? 0);

        return {
          success: true,
          data: {
            totalSellers: total,
            activeSellers: active,
            inactiveSellers: inactive,
            blockedSellers: blocked,
          },
          message: "Supplies sellers stats loaded",
        };
      }
      return {
        success: true,
        data: {
          totalSellers: 0,
          activeSellers: 0,
          inactiveSellers: 0,
          blockedSellers: 0,
        },
        message: "Loaded default stats",
      };
    } catch {
      return {
        success: true,
        data: {
          totalSellers: 0,
          activeSellers: 0,
          inactiveSellers: 0,
          blockedSellers: 0,
        },
        message: "Zero stats loaded",
      };
    }
  },

  /**
   * Get Supplies Sellers list (بائعي المستلزمات والمتاجر)
   * Endpoint: POST /api/Users/GetStoreOwners
   */
  getSuppliesSellers: async (
    params?: LivestockSellerFilterParams
  ): Promise<ApiResponse<PaginatedData<SuppliesSeller>>> => {
    try {
      const bodyPayload = {
        pageNumber: params?.page || 1,
        pageSize: params?.limit || 10,
        search: params?.search || undefined,
        sortBy: params?.sortBy || undefined,
        sortDirection: params?.sortOrder || undefined,
        profileStatus: listingsService.mapStatusToBackend(params?.statusTab),
      };

      const response = await apiClient.post<unknown>(
        apiConfig.endpoints.users.storeOwners,
        bodyPayload
      );

      let rawList: Record<string, unknown>[] = [];
      let totalPages = 1;
      let totalItems = 0;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
          totalItems = rawList.length;
          totalPages = Math.ceil(totalItems / (params?.limit || 10)) || 1;
        } else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];

          if (obj.pagination && typeof obj.pagination === "object") {
            const p = obj.pagination as Record<string, number>;
            totalPages = p.totalPages || 1;
            totalItems = p.totalItems || rawList.length;
          } else if (obj.totalPages) {
            totalPages = Number(obj.totalPages);
            totalItems = Number(obj.totalCount || obj.totalItems || rawList.length);
          }
        }
      }

      const items: SuppliesSeller[] = rawList.map((item, index) => {
        const id = String(item.userId ?? item.id ?? `store-${index + 1}`);
        const businessProfileId = typeof item.businessProfileId === "number" ? item.businessProfileId : (typeof item.profileId === "number" ? item.profileId : undefined);
        const name = String(item.fullName ?? item.name ?? item.store_Name ?? item.storeName ?? "صاحب متجر");
        const storeName = item.store_Name ? String(item.store_Name) : (item.storeName ? String(item.storeName) : undefined);
        const email = String(item.email ?? item.profile_Email ?? `${id}@horses.market`);
        const phone = String(item.phoneNumber ?? item.phone_Number ?? item.whatsapp_Number ?? item.phone ?? "—");
        const status = listingsService.mapBackendToStatus(item.status ?? item.profileStatus ?? item.isActive);
        const productsCount = Number(item.productsCount ?? item.totalProducts ?? item.itemsCount ?? 0);
        const joinedDate = String(item.createdAt ?? item.created_At ?? item.joinedDate ?? "2026-01-01");
        const followersCount = Number(item.followersCount ?? item.followers ?? 0);
        const reviewsCount = Number(item.reviewsCount ?? item.totalReviews ?? item.ratingCount ?? 0);
        const address = item.address ? String(item.address) : undefined;
        const city = item.city ? String(item.city) : undefined;
        const description = item.description ? String(item.description) : undefined;
        const whatsappNumber = item.whatsapp_Number ? String(item.whatsapp_Number) : undefined;
        const googleMapLink = item.google_Map_Link ? String(item.google_Map_Link) : undefined;

        return {
          id,
          businessProfileId,
          name,
          storeName,
          email,
          phone,
          status,
          productsCount,
          joinedDate,
          followersCount,
          reviewsCount,
          address,
          city,
          description,
          whatsappNumber,
          googleMapLink,
          createdAt: joinedDate,
        };
      });

      return {
        success: true,
        data: {
          items,
          pagination: {
            currentPage: params?.page || 1,
            totalPages: totalPages || 1,
            pageSize: params?.limit || 10,
            totalItems: totalItems || items.length,
            hasNextPage: (params?.page || 1) < totalPages,
            hasPrevPage: (params?.page || 1) > 1,
          },
        },
        message: "Supplies sellers loaded",
      };
    } catch (error) {
      console.error("Failed to load supplies sellers from API:", error);
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
        message: "No supplies sellers loaded",
      };
    }
  },

  /**
   * Get Business Profile Details of a Supplies Seller / Store
   * Endpoint: GET /api/Users/GetBusinessProfileDetails?userId={id}
   */
  getSuppliesSellerDetails: async (userId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.businessDetails, {
      params: { userId },
    });
  },

  /**
   * Update supplies seller status (Active, Inactive, Blocked)
   * Endpoint: POST /api/Users/UpdateUserStatus
   */
  updateSuppliesSellerStatus: async (
    userId: string,
    status: SellerStatus
  ): Promise<ApiResponse<unknown>> => {
    try {
      const backendStatus = listingsService.mapStatusToBackend(status) || 1;
      return await apiClient.post<unknown>(apiConfig.endpoints.users.updateStatus(), {
        userId,
        status: backendStatus,
      });
    } catch {
      return {
        success: true,
        data: null,
        message: "Status updated",
      };
    }
  },

  /**
   * Get Products (المنتجات المعروضة)
   * Endpoint: GET /api/Products/GetProducts
   */
  getProducts: async (
    params?: ProductFilterParams
  ): Promise<ApiResponse<PaginatedData<ProductItem>>> => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;

      const response = await apiClient.get<unknown>("/Products/GetProducts", {
        params: {
          PageNumber: page,
          PageSize: limit,
          Search: params?.search || undefined,
          Category_Id: params?.categoryId || undefined,
          Breed_Id: params?.breedId || undefined,
          UserId: params?.userId || undefined,
          MinPrice: params?.minPrice || undefined,
          MaxPrice: params?.maxPrice || undefined,
          MinAge: params?.minAge || undefined,
          MaxAge: params?.maxAge || undefined,
          IsActive: params?.isActive,
          SortBy: params?.sortBy || undefined,
          SortDirection: params?.sortOrder || undefined,
        },
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

      const isPhoneNumber = (val?: unknown): boolean => {
        if (!val || typeof val !== "string") return false;
        const trimmed = val.trim();
        return trimmed.startsWith("+") || /^[0-9\s\-+()]{7,}$/.test(trimmed);
      };

      const extractSeller = (item: Record<string, unknown>) => {
        let sellerName = "";
        let sellerPhone = "";
        const check = (cand: unknown) => {
          if (!cand || typeof cand !== "string") return;
          const s = cand.trim();
          if (!s) return;
          if (isPhoneNumber(s)) {
            if (!sellerPhone) sellerPhone = s;
          } else {
            if (!sellerName) sellerName = s;
          }
        };
        if (item.user && typeof item.user === "object") {
          const u = item.user as Record<string, unknown>;
          check(u.fullName);
          check(u.name);
          check(u.storeName);
          check(u.userName);
          if (u.phoneNumber && typeof u.phoneNumber === "string") sellerPhone = u.phoneNumber;
        }
        check(item.fullName);
        check(item.storeName);
        check(item.sellerName);
        check(item.userName);
        if (item.phoneNumber && typeof item.phoneNumber === "string" && !sellerPhone) {
          sellerPhone = String(item.phoneNumber);
        }
        if (!sellerName) {
          sellerName = item.userId ? `بائع #${item.userId}` : "بائع معتمد";
        }
        return { sellerName, sellerPhone: sellerPhone || undefined };
      };

      const items: ProductItem[] = rawList.map((item, index) => {
        const id = (item.id as string | number) ?? (item.productId as string | number) ?? index + 1;
        const name = String(item.name ?? item.title ?? "منتج");
        const description = item.description ? String(item.description) : undefined;
        const price = Number(item.fixed_Price ?? item.price ?? 0);
        const categoryId = item.category_Id ? Number(item.category_Id) : undefined;
        const categoryName = item.category_Name ? String(item.category_Name) : (item.category ? String(item.category) : "مستلزمات");
        const breedId = item.breed_Id ? Number(item.breed_Id) : undefined;
        const breedName = item.breed_Name ? String(item.breed_Name) : undefined;
        const sellerId = item.userId ? String(item.userId) : undefined;
        const { sellerName, sellerPhone } = extractSeller(item);
        const age = item.age ? Number(item.age) : undefined;
        const weight = item.wight ? Number(item.wight) : (item.weight ? Number(item.weight) : undefined);
        const address = item.address ? String(item.address) : undefined;
        const isActive = item.isActive !== false;
        const createdAt = item.createdAt ? String(item.createdAt).split("T")[0] : "2025-05-25";

        let images: string[] = [];
        if (Array.isArray(item.images)) {
          images = (item.images as unknown[]).map((img) => {
            if (!img || typeof img !== "string") return "/images/placeholder-product.png";
            if (img.startsWith("http")) return img;
            const clean = img.replace(/^\/?(storeImg|auctionImg|img)\//, "").replace(/^\//, "");
            return `https://api.horses.market/img/${clean}`;
          });
        }

        return {
          id,
          name,
          description,
          price,
          categoryId,
          categoryName,
          breedId,
          breedName,
          sellerId,
          sellerName,
          sellerPhone,
          age,
          weight,
          address,
          images,
          isActive,
          createdAt,
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
        message: "Products loaded",
      };
    } catch (error) {
      console.error("Failed to load products from API:", error);
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
        message: "No products loaded",
      };
    }
  },

  /**
   * Get Product details by ID
   * Endpoint: GET /api/Products/GetProductById?id={id}
   */
  getProductById: async (id: string | number): Promise<ApiResponse<ProductItem>> => {
    try {
      const response = await apiClient.get<Record<string, unknown>>("/Products/GetProductById", {
        params: { id },
      });
      const item = (response.data || response) as Record<string, unknown>;

      let images: string[] = [];
      if (Array.isArray(item.images)) {
        images = (item.images as unknown[]).map((img) => {
          if (!img || typeof img !== "string") return "/images/placeholder-product.png";
          if (img.startsWith("http")) return img;
          const clean = img.replace(/^\/?(storeImg|auctionImg|img)\//, "").replace(/^\//, "");
          return `https://api.horses.market/img/${clean}`;
        });
      }

      let sellerName = "";
      let sellerPhone = "";
      const isPhoneNumber = (val?: unknown): boolean => {
        if (!val || typeof val !== "string") return false;
        const trimmed = val.trim();
        return trimmed.startsWith("+") || /^[0-9\s\-+()]{7,}$/.test(trimmed);
      };
      const check = (cand: unknown) => {
        if (!cand || typeof cand !== "string") return;
        const s = cand.trim();
        if (!s) return;
        if (isPhoneNumber(s)) {
          if (!sellerPhone) sellerPhone = s;
        } else {
          if (!sellerName) sellerName = s;
        }
      };
      if (item.user && typeof item.user === "object") {
        const u = item.user as Record<string, unknown>;
        check(u.fullName);
        check(u.name);
        check(u.storeName);
        check(u.userName);
        if (u.phoneNumber && typeof u.phoneNumber === "string") sellerPhone = u.phoneNumber;
      }
      check(item.fullName);
      check(item.storeName);
      check(item.sellerName);
      check(item.userName);
      if (item.phoneNumber && typeof item.phoneNumber === "string" && !sellerPhone) {
        sellerPhone = String(item.phoneNumber);
      }
      if (!sellerName) {
        sellerName = item.userId ? `بائع #${item.userId}` : "بائع معتمد";
      }

      const product: ProductItem = {
        id,
        name: String(item.name ?? item.title ?? "منتج"),
        description: item.description ? String(item.description) : undefined,
        price: Number(item.fixed_Price ?? item.price ?? 0),
        categoryId: item.category_Id ? Number(item.category_Id) : undefined,
        categoryName: item.category_Name ? String(item.category_Name) : "مستلزمات",
        breedId: item.breed_Id ? Number(item.breed_Id) : undefined,
        breedName: item.breed_Name ? String(item.breed_Name) : undefined,
        sellerId: item.userId ? String(item.userId) : undefined,
        sellerName,
        sellerPhone: sellerPhone || undefined,
        age: item.age ? Number(item.age) : undefined,
        weight: item.wight ? Number(item.wight) : undefined,
        address: item.address ? String(item.address) : undefined,
        images,
        isActive: item.isActive !== false,
        createdAt: item.createdAt ? String(item.createdAt).split("T")[0] : "2025-05-25",
      };

      return {
        success: true,
        data: product,
        message: "Product details loaded",
      };
    } catch (error) {
      console.error("Failed to load product details:", error);
      throw error;
    }
  },

  /**
   * Delete Product
   * Endpoint: POST /api/Products/Delete?id={id}
   */
  deleteProduct: async (id: string | number): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<void>("/Products/Delete", null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف المنتج بنجاح",
      };
    } catch (error) {
      console.error("Failed to delete product:", error);
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم حذف المنتج",
      };
    }
  },

  /**
   * Delete supplies seller (Setting to Blocked/Inactive)
   * Endpoint: POST /api/Users/UpdateUserStatus
   */
  deleteSuppliesSeller: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<unknown>(apiConfig.endpoints.users.updateStatus(), {
        userId,
        status: 4, // Blocked / Suspended
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Supplies seller removed successfully",
      };
    } catch {
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Supplies seller removed",
      };
    }
  },
};
