import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  ComplaintReviewItem,
  ReviewsStats,
  ReviewStatCardItem,
  ReviewFilterTabItem,
  ReviewFilterParams,
  ReviewsPaginationResponse,
  ComplaintStatus,
} from "./types";

export const reviewFilterTabs: ReviewFilterTabItem[] = [
  { id: "all", label: "الكل" },
  { id: "complaint", label: "شكاوى" },
  { id: "review", label: "تقييمات" },
];

export const reviewStatCardsConfig: ReviewStatCardItem[] = [
  {
    id: "total",
    label: "إجمالي الشكاوى",
    countKey: "totalComplaints",
    iconName: "HelpCircle",
  },
  {
    id: "resolved",
    label: "تم الحل",
    countKey: "resolvedComplaints",
    iconName: "CheckCircle2",
  },
  {
    id: "pending",
    label: "قيد المراجعة",
    countKey: "pendingComplaints",
    iconName: "Clock",
  },
  {
    id: "waiting",
    label: "قيد الانتظار",
    countKey: "waitingComplaints",
    iconName: "AlertCircle",
  },
];

class ReviewsService {
  /**
   * Get KPI Stats
   */
  async getReviewsStats(): Promise<ApiResponse<ReviewsStats>> {
    try {
      const compRes = await apiClient.get<unknown>(apiConfig.endpoints.complaints.list);
      let list: Record<string, unknown>[] = [];
      if (compRes && compRes.data) {
        if (Array.isArray(compRes.data)) list = compRes.data as Record<string, unknown>[];
        else if (typeof compRes.data === "object") {
          const obj = compRes.data as Record<string, unknown>;
          if (Array.isArray(obj.items)) list = obj.items as Record<string, unknown>[];
          else if (Array.isArray(obj.data)) list = obj.data as Record<string, unknown>[];
        }
      }

      let total = list.length;
      let resolved = 0;
      let pending = 0;
      let waiting = 0;

      list.forEach((item) => {
        const s = item.status;
        if (s === 3 || s === "resolved") resolved++;
        else if (s === 1 || s === "pending") pending++;
        else if (s === 2 || s === "in_progress" || s === "waiting") waiting++;
        else pending++;
      });

      return {
        success: true,
        data: {
          totalComplaints: total,
          resolvedComplaints: resolved,
          pendingComplaints: pending,
          waitingComplaints: waiting,
        },
        message: "Complaints stats loaded",
      };
    } catch {
      return {
        success: true,
        data: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          waitingComplaints: 0,
        },
        message: "Stats initialized",
      };
    }
  }

  async getStatCardsConfig(): Promise<ApiResponse<ReviewStatCardItem[]>> {
    return {
      success: true,
      data: reviewStatCardsConfig,
    };
  }

  async getFilterTabs(): Promise<ApiResponse<ReviewFilterTabItem[]>> {
    return {
      success: true,
      data: reviewFilterTabs,
    };
  }

  /**
   * Get Reviews & Complaints Table from API
   * Endpoints: GET /api/Complaints/GetAll & GET /api/Reviews/GetAllReviews
   */
  async getReviewsTable(
    params: ReviewFilterParams = {}
  ): Promise<ApiResponse<ReviewsPaginationResponse>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const shouldFetchComplaints = !params.tab || params.tab === "all" || params.tab === "complaint";
    const shouldFetchReviews = !params.tab || params.tab === "all" || params.tab === "review";

    let combinedItems: ComplaintReviewItem[] = [];

    try {
      const promises: Promise<unknown>[] = [];

      if (shouldFetchComplaints) {
        promises.push(
          apiClient.get<unknown>(apiConfig.endpoints.complaints.list).catch(() => ({ data: [] }))
        );
      }

      if (shouldFetchReviews) {
        promises.push(
          apiClient
            .get<unknown>(apiConfig.endpoints.reviews.list, {
              params: {
                PageNumber: 1,
                PageSize: 50,
                Search: params.search || undefined,
              },
            })
            .catch(() => ({ data: [] }))
        );
      }

      const results = await Promise.all(promises);

      // Parse complaints
      if (shouldFetchComplaints && results[0]) {
        const compRes = results[0] as { data?: unknown };
        let compList: Record<string, unknown>[] = [];
        if (compRes && compRes.data) {
          if (Array.isArray(compRes.data)) compList = compRes.data as Record<string, unknown>[];
          else if (typeof compRes.data === "object") {
            const obj = compRes.data as Record<string, unknown>;
            if (Array.isArray(obj.items)) compList = obj.items as Record<string, unknown>[];
            else if (Array.isArray(obj.data)) compList = obj.data as Record<string, unknown>[];
          }
        }

        const mappedComplaints: ComplaintReviewItem[] = compList.map((c, i) => {
          const id = String(c.id ?? c.complaintId ?? `COMP-${i + 1}`);
          const subject = String(c.title ?? c.subject ?? "شكوى بخصوص المزاد");
          const description = String(c.description ?? c.content ?? "");
          const rawStatus = c.status;
          let status: ComplaintStatus = "pending";
          let statusLabel = "قيد المراجعة";
          if (rawStatus === 3 || rawStatus === "resolved") {
            status = "resolved";
            statusLabel = "تم الحل";
          } else if (rawStatus === 2 || rawStatus === "in_progress") {
            status = "waiting";
            statusLabel = "قيد المعالجة";
          } else if (rawStatus === 4 || rawStatus === "rejected") {
            status = "rejected";
            statusLabel = "مرفوضة";
          }

          let sellerName = "بائع";
          if (typeof c.seller === "object" && c.seller) {
            const s = c.seller as Record<string, unknown>;
            sellerName = String(s.name ?? s.fullName ?? "بائع");
          } else if (c.sellerName) {
            sellerName = String(c.sellerName);
          }

          let customerName = "عميل";
          let customerPhone = "";
          if (typeof c.user === "object" && c.user) {
            const u = c.user as Record<string, unknown>;
            customerName = String(u.name ?? u.fullName ?? "عميل");
            customerPhone = String(u.phoneNumber ?? u.phone ?? "");
          } else if (c.userName) {
            customerName = String(c.userName);
          }

          const joinedDate = c.createdAt ? String(c.createdAt).split("T")[0] : new Date().toISOString().split("T")[0];

          return {
            id,
            type: "complaint",
            typeLabel: "شكوى",
            subject,
            sellerName,
            sellerStore: c.sellerStore ? String(c.sellerStore) : undefined,
            customerName,
            customerPhone,
            status,
            statusLabel,
            rating: null,
            joinedDate,
            description,
          };
        });

        combinedItems.push(...mappedComplaints);
      }

      // Parse reviews
      const revIdx = shouldFetchComplaints ? 1 : 0;
      if (shouldFetchReviews && results[revIdx]) {
        const revRes = results[revIdx] as { data?: unknown };
        let revList: Record<string, unknown>[] = [];
        if (revRes && revRes.data) {
          if (Array.isArray(revRes.data)) revList = revRes.data as Record<string, unknown>[];
          else if (typeof revRes.data === "object") {
            const obj = revRes.data as Record<string, unknown>;
            if (Array.isArray(obj.items)) revList = obj.items as Record<string, unknown>[];
            else if (Array.isArray(obj.data)) revList = obj.data as Record<string, unknown>[];
          }
        }

        const mappedReviews: ComplaintReviewItem[] = revList.map((r, i) => {
          const id = String(r.id ?? r.reviewId ?? `REV-${i + 1}`);
          const rating = Number(r.rate ?? r.rating ?? r.stars ?? 5);
          const comment = String(r.comment ?? r.review ?? r.content ?? "تقييم ممتاز");
          const subject = String(r.title ?? r.subject ?? `تقييم خدمة ${rating} نجوم`);

          let sellerName = "بائع";
          if (typeof r.seller === "object" && r.seller) {
            const s = r.seller as Record<string, unknown>;
            sellerName = String(s.name ?? s.fullName ?? "بائع");
          } else if (r.sellerName) {
            sellerName = String(r.sellerName);
          }

          let customerName = "عميل";
          let customerPhone = "";
          if (typeof r.user === "object" && r.user) {
            const u = r.user as Record<string, unknown>;
            customerName = String(u.name ?? u.fullName ?? "عميل");
            customerPhone = String(u.phoneNumber ?? u.phone ?? "");
          } else if (r.userName) {
            customerName = String(r.userName);
          }

          const joinedDate = r.createdAt ? String(r.createdAt).split("T")[0] : new Date().toISOString().split("T")[0];

          return {
            id,
            type: "review",
            typeLabel: "تقييم",
            subject,
            sellerName,
            sellerStore: r.sellerStore ? String(r.sellerStore) : undefined,
            customerName,
            customerPhone,
            status: "resolved",
            statusLabel: "تم النشر",
            rating,
            joinedDate,
            description: comment,
          };
        });

        combinedItems.push(...mappedReviews);
      }

      // Filter by search query if provided
      if (params.search) {
        const q = params.search.toLowerCase();
        combinedItems = combinedItems.filter(
          (item) =>
            item.subject.toLowerCase().includes(q) ||
            item.sellerName.toLowerCase().includes(q) ||
            item.customerName.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        );
      }

      // Filter by status if provided
      if (params.status && params.status !== "all") {
        combinedItems = combinedItems.filter((item) => item.status === params.status);
      }

      const total = combinedItems.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginatedItems = combinedItems.slice(start, start + limit);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: {
            total,
            page,
            limit,
            totalPages,
          },
        },
        message: "Data loaded from API",
      };
    } catch (error) {
      console.error("Failed to load reviews/complaints:", error);
      return {
        success: false,
        data: {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
        message: "حدث خطأ ما أثناء جلب البيانات",
      };
    }
  }

  /**
   * Update Complaint Status
   * Endpoint: POST /api/Complaints/UpdateStatus?id={id}&status={status}
   */
  async updateComplaintStatus(
    id: string | number,
    status: number | string
  ): Promise<ApiResponse<void>> {
    try {
      const statusCode = typeof status === "number" ? status : status === "resolved" ? 3 : status === "rejected" ? 4 : 2;
      await apiClient.post<void>(apiConfig.endpoints.complaints.updateStatus, null, {
        params: { id, status: statusCode },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم تحديث حالة الشكوى بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to update complaint status:", error);
      const err = error as { message?: string };
      return {
        success: false,
        data: undefined as unknown as void,
        message: err?.message ? `حدث خطأ ما: ${err.message}` : "حدث خطأ ما أثناء تحديث حالة الشكوى",
      };
    }
  }

  async resolveComplaint(id: string | number): Promise<ApiResponse<void>> {
    return this.updateComplaintStatus(id, 3);
  }

  async rejectComplaint(id: string | number): Promise<ApiResponse<void>> {
    return this.updateComplaintStatus(id, 4);
  }

  /**
   * Delete Review
   * Endpoint: POST /api/Reviews/Delete?id={id}
   */
  async deleteReview(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      await apiClient.post<void>(apiConfig.endpoints.reviews.delete, null, {
        params: { id },
      });
      return {
        success: true,
        data: true,
        message: "تم حذف التقييم بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to delete review:", error);
      const err = error as { message?: string };
      return {
        success: false,
        data: false,
        message: err?.message ? `حدث خطأ ما: ${err.message}` : "حدث خطأ ما أثناء حذف التقييم",
      };
    }
  }
}

export const reviewsService = new ReviewsService();
