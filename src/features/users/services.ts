import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import { CustomerUser, UserFilterParams } from "./types";

export const mockUsersList: CustomerUser[] = [
  {
    id: "user-1",
    name: "سعود بن عبد العزيز",
    email: "saud@example.com",
    phone: "+966 50 111 2233",
    status: "active",
    bidsCount: 22,
    ordersCount: 8,
    totalSpent: 185000,
    joinedAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "user-2",
    name: "خالد التميمي",
    email: "khaled@example.com",
    phone: "+966 55 444 5566",
    status: "active",
    bidsCount: 14,
    ordersCount: 3,
    totalSpent: 92000,
    joinedAt: "2025-04-12T12:00:00Z",
  },
];

export const usersService = {
  getUsers: async (params?: UserFilterParams): Promise<ApiResponse<PaginatedData<CustomerUser>>> => {
    try {
      return await apiClient.get<PaginatedData<CustomerUser>>(apiConfig.endpoints.users.list, {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      return {
        success: true,
        data: {
          items: mockUsersList,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: mockUsersList.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: "Loaded from mock service",
      };
    }
  },

  updateUserStatus: async (id: string, status: string): Promise<ApiResponse<CustomerUser>> => {
    try {
      return await apiClient.patch<CustomerUser>(apiConfig.endpoints.users.updateStatus(id), { status });
    } catch {
      const user = mockUsersList.find((u) => u.id === id) || mockUsersList[0];
      return {
        success: true,
        data: { ...user, status: status as CustomerUser["status"] },
        message: "User status updated in mock service",
      };
    }
  },
};
