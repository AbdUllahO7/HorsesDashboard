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
  { id: "all", label: "كل البائعين" },
  { id: "pending", label: "قيد المراجعة" },
  { id: "active", label: "نشط" },
  { id: "inactive", label: "غير نشط" },
  { id: "blocked", label: "محظور" },
];

export const customerStatCardsConfig: CustomerStatCardItem[] = [
  {
    id: "total",
    label: "اجمالي العملاء",
    countKey: "totalCustomers",
    iconName: "Users",
  },
  {
    id: "active",
    label: "العملاء النشطين",
    countKey: "activeCustomers",
    iconName: "UserCheck",
  },
  {
    id: "inactive",
    label: "العملاء غير النشطين",
    countKey: "inactiveCustomers",
    iconName: "UserX",
  },
  {
    id: "blocked",
    label: "العملاء المحظورين",
    countKey: "blockedCustomers",
    iconName: "UserMinus",
  },
];

export const mockCustomerStats: CustomerStats = {
  totalCustomers: 55,
  activeCustomers: 55,
  inactiveCustomers: 55,
  blockedCustomers: 55,
};

export const mockCustomersList: CustomerUser[] = [
  {
    id: "customer-1",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "الرياض، المملكة العربية السعودية",
    bidsCount: 22,
    ordersCount: 8,
    totalSpent: 185000,
  },
  {
    id: "customer-2",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "blocked",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "جدة، المملكة العربية السعودية",
    bidsCount: 14,
    ordersCount: 3,
    totalSpent: 92000,
  },
  {
    id: "customer-3",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "الدمام، المملكة العربية السعودية",
    bidsCount: 19,
    ordersCount: 6,
    totalSpent: 140000,
  },
  {
    id: "customer-4",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "pending",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "المدينة المنورة، المملكة العربية السعودية",
    bidsCount: 2,
    ordersCount: 1,
    totalSpent: 15000,
  },
  {
    id: "customer-5",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "الرياض، المملكة العربية السعودية",
    bidsCount: 30,
    ordersCount: 12,
    totalSpent: 320000,
  },
  {
    id: "customer-6",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "القصيم، المملكة العربية السعودية",
    bidsCount: 8,
    ordersCount: 4,
    totalSpent: 45000,
  },
  {
    id: "customer-7",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "مكة المكرمة، المملكة العربية السعودية",
    bidsCount: 16,
    ordersCount: 7,
    totalSpent: 110000,
  },
  {
    id: "customer-8",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "الرياض، المملكة العربية السعودية",
    bidsCount: 25,
    ordersCount: 9,
    totalSpent: 215000,
  },
  {
    id: "customer-9",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "أبها، المملكة العربية السعودية",
    bidsCount: 11,
    ordersCount: 5,
    totalSpent: 67000,
  },
  {
    id: "customer-10",
    name: "محمود احمد",
    email: "user@gmail.com",
    phone: "0595121088",
    status: "active",
    interactionsCount: 5,
    joinedDate: "25-5-2025",
    address: "الرياض، المملكة العربية السعودية",
    bidsCount: 18,
    ordersCount: 6,
    totalSpent: 135000,
  },
];

export const usersService = {
  /**
   * Get Customers Filter Tabs
   */
  getFilterTabs: async (): Promise<ApiResponse<CustomerFilterTabItem[]>> => {
    return {
      success: true,
      data: customerFilterTabs,
      message: "Customer filter tabs loaded",
    };
  },

  /**
   * Get Customers KPI Stat Cards configuration
   */
  getStatCardsConfig: async (): Promise<ApiResponse<CustomerStatCardItem[]>> => {
    return {
      success: true,
      data: customerStatCardsConfig,
      message: "Customer stat cards config loaded",
    };
  },

  /**
   * Get Customers summary statistics
   */
  getCustomersStats: async (): Promise<ApiResponse<CustomerStats>> => {
    try {
      return await apiClient.get<CustomerStats>("/admin/customers/stats");
    } catch {
      return {
        success: true,
        data: mockCustomerStats,
        message: "Customer stats loaded from mock service",
      };
    }
  },

  /**
   * Get Customers paginated list
   */
  getCustomers: async (
    params?: CustomerFilterParams
  ): Promise<ApiResponse<PaginatedData<CustomerUser>>> => {
    try {
      return await apiClient.get<PaginatedData<CustomerUser>>(apiConfig.endpoints.users.list, {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      let filtered = [...mockCustomersList];

      if (params?.statusTab && params.statusTab !== "all") {
        filtered = filtered.filter((c) => c.status === params.statusTab);
      }

      if (params?.search) {
        const query = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.includes(query)
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
   * Update Customer Status
   */
  updateCustomerStatus: async (
    id: string,
    status: CustomerStatus
  ): Promise<ApiResponse<CustomerUser>> => {
    try {
      return await apiClient.patch<CustomerUser>(apiConfig.endpoints.users.updateStatus(id), { status });
    } catch {
      const user = mockCustomersList.find((u) => u.id === id) || mockCustomersList[0];
      return {
        success: true,
        data: { ...user, status },
        message: "User status updated in mock service",
      };
    }
  },

  /**
   * Delete Customer
   */
  deleteCustomer: async (id: string): Promise<ApiResponse<void>> => {
    try {
      return await apiClient.delete<void>(`/admin/customers/${id}`);
    } catch {
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Customer deleted in mock service",
      };
    }
  },
};
