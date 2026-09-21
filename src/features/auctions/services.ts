import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse, PaginatedData } from "@/types/api";
import { Auction, AuctionFilterParams } from "./types";

export const mockAuctionsList: Auction[] = [
  {
    id: "auc-1",
    title: "مهر عربي أصيل - كحيلان",
    horse: {
      id: "h-1",
      name: "كحيلان الأصيل",
      breed: "عربي أصيل (صقلاوي)",
      age: 3,
      gender: "stallion",
      origin: "الرياض، المملكة العربية السعودية",
    },
    sellerId: "seller-1",
    sellerName: "مربط السالمي للخيول العربية",
    startingPrice: 50000,
    currentBid: 85000,
    bidCount: 14,
    viewsCount: 240,
    status: "active",
    startDate: "2026-09-20T10:00:00Z",
    endDate: "2026-09-25T18:00:00Z",
    isFeatured: true,
  },
  {
    id: "auc-2",
    title: "فرس عربية خط بولندي - وردة الشام",
    horse: {
      id: "h-2",
      name: "وردة الشام",
      breed: "عربي أصيل (بولندي)",
      age: 4,
      gender: "mare",
      origin: "القصيم، المملكة العربية السعودية",
    },
    sellerId: "seller-2",
    sellerName: "مربط النعيم",
    startingPrice: 35000,
    currentBid: 62000,
    bidCount: 9,
    viewsCount: 185,
    status: "active",
    startDate: "2026-09-21T08:00:00Z",
    endDate: "2026-09-26T20:00:00Z",
    isFeatured: true,
  },
];

export const auctionsService = {
  getAuctions: async (params?: AuctionFilterParams): Promise<ApiResponse<PaginatedData<Auction>>> => {
    try {
      return await apiClient.get<PaginatedData<Auction>>(apiConfig.endpoints.auctions.list, {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      return {
        success: true,
        data: {
          items: mockAuctionsList,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: mockAuctionsList.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: "Loaded from mock service",
      };
    }
  },

  getAuctionById: async (id: string): Promise<ApiResponse<Auction>> => {
    try {
      return await apiClient.get<Auction>(apiConfig.endpoints.auctions.details(id));
    } catch {
      const found = mockAuctionsList.find((a) => a.id === id) || mockAuctionsList[0];
      return {
        success: true,
        data: found,
        message: "Loaded from mock service",
      };
    }
  },

  updateAuctionStatus: async (id: string, status: string): Promise<ApiResponse<Auction>> => {
    try {
      return await apiClient.patch<Auction>(apiConfig.endpoints.auctions.changeStatus(id), { status });
    } catch {
      return {
        success: true,
        data: { ...mockAuctionsList[0], id, status: status as Auction["status"] },
        message: "Updated in mock service",
      };
    }
  },

  deleteAuction: async (id: string): Promise<ApiResponse<void>> => {
    try {
      return await apiClient.delete<void>(apiConfig.endpoints.auctions.delete(id));
    } catch {
      return {
        success: true,
        data: undefined as unknown as void,
        message: "Deleted in mock service",
      };
    }
  },
};
