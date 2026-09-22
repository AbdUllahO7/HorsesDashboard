import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  UserAccountItem,
  AccountFilterParams,
  AccountsPaginationResponse,
  AccountVerificationStatus,
} from "./types";

export const formatVerificationImageUrl = (img?: string): string => {
  if (!img) return "/images/id-front.jpg";
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/images/")) {
    return img;
  }
  const clean = img.replace(/^\/?(auctionImg|storeImg|img)\//, "");
  return `${apiConfig.imageBaseUrl}/${clean}`;
};

export const mapBackendVerificationStatus = (val: unknown): AccountVerificationStatus => {
  if (val === 2 || val === "approved" || val === "Approved" || val === true) return "approved";
  if (val === 3 || val === "rejected" || val === "Rejected") return "rejected";
  return "pending";
};

class AccountsService {
  /**
   * Get verification requests list
   * Endpoint: POST /api/Users/GetVerificationRequests
   */
  async getAccounts(
    params: AccountFilterParams = {}
  ): Promise<ApiResponse<AccountsPaginationResponse>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

      let statusEnum: number | undefined = undefined;
      if (params.status === "pending") statusEnum = 1;
      else if (params.status === "approved") statusEnum = 2;
      else if (params.status === "rejected") statusEnum = 3;

      const bodyPayload: Record<string, unknown> = {
        pageNumber: page,
        pageSize: limit,
      };

      if (params.search) {
        bodyPayload.search = params.search;
      }
      if (statusEnum !== undefined) {
        bodyPayload.status = statusEnum;
      }
      if (params.roleName) {
        bodyPayload.roleName = params.roleName;
      }
      if (params.sortBy) {
        bodyPayload.sortBy = params.sortBy;
      }
      if (params.sortOrder) {
        bodyPayload.sortDirection = params.sortOrder;
      }

      const response = await apiClient.post<unknown>(
        apiConfig.endpoints.users.verificationRequests,
        bodyPayload
      );

      let rawList: Record<string, unknown>[] = [];
      let totalPages = 1;
      let total = 0;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          rawList = response.data as Record<string, unknown>[];
          total = rawList.length;
          totalPages = Math.ceil(total / limit) || 1;
        } else if (typeof response.data === "object") {
          const obj = response.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) rawList = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) rawList = obj.data as Record<string, unknown>[];

          if (obj.pagination && typeof obj.pagination === "object") {
            const p = obj.pagination as Record<string, number>;
            totalPages = p.totalPages || 1;
            total = p.total || p.totalItems || rawList.length;
          } else if (obj.totalPages) {
            totalPages = Number(obj.totalPages);
            total = Number(obj.totalCount || obj.total || rawList.length);
          }
        }
      }

      const items: UserAccountItem[] = rawList.map((item, index) => {
        const id = String(item.userId ?? item.id ?? `acc-${index + 1}`);
        const name = String(item.fullName ?? item.name ?? item.userName ?? "مستخدم");
        const phone = String(item.phoneNumber ?? item.phone_Number ?? item.phone ?? "—");
        const email = String(item.email ?? item.profile_Email ?? `${id}@horses.market`);
        const roleName = item.roleName ? String(item.roleName) : undefined;
        
        const idFrontUrl = formatVerificationImageUrl(
          String(item.frontIdentityImage ?? item.idFrontUrl ?? item.frontImage ?? "")
        );
        const idBackUrl = formatVerificationImageUrl(
          String(item.backIdentityImage ?? item.idBackUrl ?? item.backImage ?? "")
        );
        const selfieWithIdUrl = formatVerificationImageUrl(
          String(item.selfieWithIdentityImage ?? item.selfieWithIdUrl ?? item.selfieImage ?? "")
        );

        const status = mapBackendVerificationStatus(item.status ?? item.verificationStatus);
        const rejectionReason = item.rejectionReason ? String(item.rejectionReason) : (item.reason ? String(item.reason) : undefined);
        const createdAt = String(item.createdAt ?? item.created_At ?? item.requestDate ?? "2025-05-25");

        return {
          id,
          name,
          phone,
          email,
          roleName,
          idFrontUrl,
          idBackUrl,
          selfieWithIdUrl,
          status,
          rejectionReason,
          createdAt,
        };
      });

      return {
        success: true,
        data: {
          items,
          pagination: {
            total: total || items.length,
            page,
            limit,
            totalPages: totalPages || 1,
          },
        },
        message: "Verification requests loaded",
      };
    } catch (error) {
      console.error("Failed to load verification requests from API:", error);
      return {
        success: true,
        data: {
          items: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 1,
          },
        },
        message: "No verification requests loaded",
      };
    }
  }

  /**
   * Approve verification request
   * Endpoint: POST /api/Users/ApproveVerification?userId={id}
   */
  async approveAccount(userId: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await apiClient.post<unknown>(
        apiConfig.endpoints.users.approveVerification,
        null,
        {
          params: { userId },
        }
      );
      return {
        success: true,
        data: response.data || null,
        message: response.message || "تم قبول وتفعيل حساب المستخدم بنجاح",
      };
    } catch (error) {
      console.error("Failed to approve verification:", error);
      return {
        success: false,
        data: null,
        message: "فشل في اعتماد التوثيق",
      };
    }
  }

  /**
   * Reject verification request
   * Endpoint: POST /api/Users/RejectVerification
   */
  async rejectAccount(userId: string, reason?: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await apiClient.post<unknown>(
        apiConfig.endpoints.users.rejectVerification,
        {
          userId,
          reason: reason || "صور إثبات الهوية غير واضحة، يرجى إعادة رفع صور واضحة للبطاقة والسيلفي",
        }
      );
      return {
        success: true,
        data: response.data || null,
        message: response.message || "تم رفض طلب التوثيق وإشعار المستخدم",
      };
    } catch (error) {
      console.error("Failed to reject verification:", error);
      return {
        success: false,
        data: null,
        message: "فشل في رفض الطلب",
      };
    }
  }
}

export const accountsService = new AccountsService();
