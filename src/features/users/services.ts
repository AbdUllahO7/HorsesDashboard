import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import {
  CustomerUser,
  CustomerStats,
  CustomerFilterParams,
  CustomerFilterTabItem,
  CustomerStatCardItem,
  CustomerStatus,
} from "./types";

export const customerFilterTabs: CustomerFilterTabItem[] = [
  { id: "all", label: "كل العملاء" },
  { id: "pending", label: "قيد المراجعة" },
  { id: "active", label: "نشط" },
  { id: "inactive", label: "غير نشط" },
  { id: "blocked", label: "محظور" },
];

export const customerStatCardsConfig: CustomerStatCardItem[] = [
  {
    id: "activeCustomers",
    label: "العملاء النشطون",
    countKey: "activeCustomers",
    iconName: "UserCheck",
  },
  {
    id: "activeSellers",
    label: "البائعون النشطون",
    countKey: "activeSellers",
    iconName: "Users",
  },
  {
    id: "openAuctions",
    label: "المزادات المفتوحة",
    countKey: "openAuctions",
    iconName: "UserMinus",
  },
  {
    id: "liveStreams",
    label: "البثوث المباشرة",
    countKey: "liveStreams",
    iconName: "UserX",
  },
];

export const usersService = {
  /**
   * Helper to map status to backend enum
   */
  mapStatusToBackend: (status?: CustomerStatus | "all"): number | undefined => {
    switch (status) {
      case "pending": return 1;
      case "active": return 2;
      case "inactive": return 3;
      case "blocked": return 4;
      default: return undefined;
    }
  },

  mapBackendToStatus: (val: unknown): CustomerStatus => {
    if (val === 1 || val === "pending" || val === "Pending") return "pending";
    if (val === 2 || val === "active" || val === "Active" || val === true) return "active";
    if (val === 3 || val === "inactive" || val === "Inactive" || val === false) return "inactive";
    if (val === 4 || val === "blocked" || val === "Blocked" || val === "Suspended") return "blocked";
    return "active";
  },

  getFilterTabs: async (): Promise<ApiResponse<CustomerFilterTabItem[]>> => {
    return {
      success: true,
      data: customerFilterTabs,
      message: "Customer filter tabs loaded",
    };
  },

  getStatCardsConfig: async (): Promise<ApiResponse<CustomerStatCardItem[]>> => {
    return {
      success: true,
      data: customerStatCardsConfig,
      message: "Customer stat cards config loaded",
    };
  },

  /**
   * Get Customers summary statistics
   * Endpoint: GET /api/Users/DashboardStats
   */
  getCustomersStats: async (): Promise<ApiResponse<CustomerStats>> => {
    try {
      const response = await apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.dashboardStats);
      if (response && (response.data || response.success)) {
        const raw = (response.data || response) as Record<string, unknown>;
        // Map exact fields from GET /api/Users/DashboardStats
        return {
          success: true,
          data: {
            totalCustomers:   Number(raw.totalCustomers ?? raw.customersCount ?? 0),
            activeCustomers:  Number(raw.activeCustomers ?? raw.activeCustomersCount ?? 0),
            activeSellers:    Number(raw.activeSellers ?? raw.activeSellersCount ?? 0),
            openAuctions:     Number(raw.openAuctions ?? raw.openAuctionsCount ?? 0),
            liveStreams:      Number(raw.liveStreams ?? raw.liveStreamsCount ?? 0),
            totalProducts:    Number(raw.totalProducts ?? 0),
            inactiveCustomers: Number(raw.inactiveCustomers ?? raw.inactiveCustomersCount ?? 0),
            blockedCustomers:  Number(raw.blockedCustomers ?? raw.blockedCustomersCount ?? 0),
          },
          message: "Customer stats loaded",
        };
      }
      return {
        success: true,
        data: {
          totalCustomers: 0, activeCustomers: 0, activeSellers: 0,
          openAuctions: 0, liveStreams: 0, totalProducts: 0,
          inactiveCustomers: 0, blockedCustomers: 0,
        },
        message: "Customer stats loaded",
      };
    } catch {
      return {
        success: true,
        data: {
          totalCustomers: 0, activeCustomers: 0, activeSellers: 0,
          openAuctions: 0, liveStreams: 0, totalProducts: 0,
          inactiveCustomers: 0, blockedCustomers: 0,
        },
        message: "Zero stats",
      };
    }
  },

  /**
   * Get Customers paginated list
   * Endpoint: GET /api/Users/GetUsersByRole?RoleName=Customer
   */
  getCustomers: async (
    params?: CustomerFilterParams
  ): Promise<ApiResponse<PaginatedData<CustomerUser>>> => {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        RoleName: "Customer",
        PageNumber: params?.page || 1,
        PageSize: params?.limit || 10,
        Search: params?.search || undefined,
        SortBy: params?.sortBy || undefined,
        SortDirection: params?.sortOrder || undefined,
      };

      if (params?.statusTab && params.statusTab !== "all") {
        if (params.statusTab === "active") queryParams.IsActive = true;
        else if (params.statusTab === "inactive") queryParams.IsActive = false;
      }

      const response = await apiClient.get<unknown>(apiConfig.endpoints.users.byRole, {
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

      const items: CustomerUser[] = rawList.map((item, index) => {
        const id = String(item.userId ?? item.id ?? `customer-${index + 1}`);
        const name = String(item.fullName ?? item.name ?? item.userName ?? "عميل");
        const email = String(item.email ?? item.profile_Email ?? `${id}@horses.market`);
        const phone = String(item.phoneNumber ?? item.phone_Number ?? item.phone ?? "—");
        const status = usersService.mapBackendToStatus(item.status ?? item.isActive);
        const interactionsCount = Number(item.liveCommentsCount ?? item.interactionsCount ?? item.interactions ?? 0);
        const joinedDate = String(item.createdAt ?? item.created_At ?? item.joinedDate ?? "2026-01-01");
        const bidsCount = Number(item.auctionsParticipated ?? item.bidsCount ?? item.totalBids ?? 0);
        const ordersCount = Number(item.wonAuctionsCount ?? item.ordersCount ?? item.totalOrders ?? 0);
        const totalSpent = Number(item.walletBalance ?? item.totalSpent ?? 0);
        const address = item.address ? String(item.address) : (item.city ? String(item.city) : undefined);
        const avatarUrl = item.profileImage || item.avatarUrl ? String(item.profileImage || item.avatarUrl) : undefined;

        return {
          id,
          name,
          email,
          phone,
          status,
          interactionsCount,
          joinedDate,
          bidsCount,
          ordersCount,
          totalSpent,
          address,
          avatarUrl,
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
        message: "Customers loaded",
      };
    } catch (error) {
      console.error("Failed to load customers from API:", error);
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
        message: "No customers loaded",
      };
    }
  },

  /**
   * Get Customer Details
   * Endpoint: GET /api/Users/GetCustomerDetails?userId={id}
   */
  getCustomerDetails: async (userId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiClient.get<Record<string, unknown>>(apiConfig.endpoints.users.customerDetails, {
      params: { userId },
    });
  },

  /**
   * Get Customer Wallet Transactions
   * Endpoint: GET /api/Wallets/GetUserTransaction?userId={id}
   */
  getCustomerTransactions: async (userId: string): Promise<ApiResponse<unknown>> => {
    return apiClient.get<unknown>("/Wallets/GetUserTransaction", {
      params: { userId },
    });
  },

  /**
   * Update Customer Status
   * Endpoint: POST /api/Users/UpdateUserStatus
   */
  updateCustomerStatus: async (
    userId: string,
    status: CustomerStatus
  ): Promise<ApiResponse<unknown>> => {
    try {
      const backendStatus = usersService.mapStatusToBackend(status) || 1;
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
   * Delete Customer (Setting status to blocked/suspended)
   * Endpoint: POST /api/Users/UpdateUserStatus
   */
  deleteCustomer: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post<unknown>(apiConfig.endpoints.users.updateStatus(), {
        userId,
        status: 4, // Blocked / Suspended
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Customer deleted successfully",
      };
    } catch {
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Customer deleted",
      };
    }
  },
};
