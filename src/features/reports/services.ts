import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  ReportTicketItem,
  ReportFilterParams,
  ReportsPaginationResponse,
} from "./types";

export const reportReasonsMap: Record<number, string> = {
  1: "محتوى غير لائق أو مخالف للآداب",
  2: "احتيال ومزايدة وهمية",
  3: "سلوك مسيء أو ألفاظ غير لائقة",
  4: "مخالفة شروط المزاد والبيع",
  5: "معلومات أو وثائق مضللة",
  6: "انتحال شخصية أو حساب مزيف",
  7: "محاولة البيع خارج المنصة",
  8: "أسباب أخرى",
};

class ReportsService {
  /**
   * Get Reports and Live Violations list from API
   * Endpoint: GET /api/LiveRepots/GetRepotsLive
   */
  async getReports(
    params: ReportFilterParams = {}
  ): Promise<ApiResponse<ReportsPaginationResponse>> {
    const page = params.page || 1;
    const limit = params.limit || 10;

    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        PageNumber: page,
        PageSize: limit,
        Search: params.search || undefined,
        LiveStream_Id: params.liveStreamId || undefined,
        Reason: params.reason || undefined,
        User_Id: params.userId || undefined,
        SortBy: params.sortBy || undefined,
        SortDirection: params.sortOrder || undefined,
      };

      const response = await apiClient.get<unknown>(apiConfig.endpoints.tickets.liveReports, {
        params: queryParams,
      });

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
          else if (Array.isArray(obj.reports)) rawList = obj.reports as Record<string, unknown>[];

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

      const items: ReportTicketItem[] = rawList.map((item, index) => {
        const id = (item.id as string | number) ?? index + 1;
        const liveStreamId = item.liveStream_Id ? Number(item.liveStream_Id) : (item.liveStreamId ? Number(item.liveStreamId) : undefined);
        const reasonNum = item.reason ? Number(item.reason) : (item.reason_Id ? Number(item.reason_Id) : 1);
        const reasonLabel = reportReasonsMap[reasonNum] || "مخالفة في البث";
        const notes = String(item.notes ?? item.reasonText ?? item.description ?? item.message ?? "");
        const reason = notes || reasonLabel;

        const isPhoneNumber = (val?: unknown): boolean => {
          if (!val || typeof val !== "string") return false;
          const trimmed = val.trim();
          return trimmed.startsWith("+") || /^[0-9\s\-+()]{7,}$/.test(trimmed);
        };

        let reporterName = "";
        let reporterPhone = "";
        let reporterEmail = "";
        if (typeof item.user === "object" && item.user) {
          const u = item.user as Record<string, unknown>;
          reporterName = String(u.fullName ?? u.name ?? u.user_Name ?? u.userName ?? "");
          reporterPhone = String(u.phoneNumber ?? u.phone ?? u.mobile ?? "");
          reporterEmail = String(u.email ?? "");
        }
        if (!reporterName) {
          const cand = String(item.user_Name ?? item.userName ?? item.customer_Name ?? item.reporterName ?? "");
          if (isPhoneNumber(cand)) {
            if (!reporterPhone) reporterPhone = cand;
            reporterName = "مستخدم المنصة";
          } else if (cand) {
            reporterName = cand;
          }
        }
        if (!reporterName) reporterName = "مستخدم";
        if (!reporterPhone && item.phone) reporterPhone = String(item.phone);
        if (!reporterPhone && item.phoneNumber) reporterPhone = String(item.phoneNumber);
        if (!reporterEmail && item.email) reporterEmail = String(item.email);

        let reportedUserName = "";
        let reportedUserPhone = "";
        let reportedUserEmail = "";
        if (typeof item.liveStream === "object" && item.liveStream) {
          const ls = item.liveStream as Record<string, unknown>;
          reportedUserName = String(ls.title ?? ls.sellerName ?? ls.seller_Name ?? ls.userName ?? "بث مباشر");
          reportedUserPhone = String(ls.phone ?? ls.phoneNumber ?? ls.sellerPhone ?? "");
        } else if (typeof item.reportedUser === "object" && item.reportedUser) {
          const ru = item.reportedUser as Record<string, unknown>;
          reportedUserName = String(ru.fullName ?? ru.name ?? ru.userName ?? "");
          reportedUserPhone = String(ru.phoneNumber ?? ru.phone ?? "");
          reportedUserEmail = String(ru.email ?? "");
        } else if (item.reported_User_Name || item.reportedUserName || item.seller_Name || item.sellerName) {
          reportedUserName = String(item.reported_User_Name ?? item.reportedUserName ?? item.seller_Name ?? item.sellerName);
        }
        if (!reportedUserName) reportedUserName = "البائع / صاحب البث";

        const createdAt = item.created_At
          ? String(item.created_At).split("T")[0]
          : item.createdAt
          ? String(item.createdAt).split("T")[0]
          : new Date().toISOString().split("T")[0];

        return {
          id,
          liveStreamId,
          reporterName,
          reporterPhone: reporterPhone || undefined,
          reporterEmail: reporterEmail || undefined,
          reportedUserName,
          reportedUserPhone: reportedUserPhone || undefined,
          reportedUserEmail: reportedUserEmail || undefined,
          reason,
          reasonLabel,
          category: reasonLabel,
          notes,
          status: "pending",
          statusLabel: "قيد المراجعة",
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
        message: "Reports loaded successfully",
      };
    } catch (error) {
      console.error("Failed to load reports from API:", error);
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
        message: "فشل تحميل البلاغات من الخادم",
      };
    }
  }

  /**
   * Accept / Resolve Report and End Live Stream if applicable
   */
  async resolveReport(report: ReportTicketItem): Promise<ApiResponse<ReportTicketItem>> {
    if (report.liveStreamId) {
      try {
        const res = await apiClient.post<void>(`/LiveStreams/End?liveStreamId=${report.liveStreamId}`);
        return {
          success: true,
          data: { ...report, status: "resolved", statusLabel: "تم الحل" },
          message: res.message || "تم قبول البلاغ وإيقاف البث المخالف بنجاح",
        };
      } catch (err: unknown) {
        const errorObj = err as { message?: string; statusCode?: number };
        const apiMsg = errorObj?.message || "حدث خطأ أثناء محاولة إيقاف البث";
        return {
          success: false,
          data: report,
          message: apiMsg,
        };
      }
    }

    return {
      success: true,
      data: { ...report, status: "resolved", statusLabel: "تم الحل" },
      message: "تم قبول البلاغ بنجاح",
    };
  }

  /**
   * Dismiss / Reject Report
   */
  async dismissReport(report: ReportTicketItem): Promise<ApiResponse<ReportTicketItem>> {
    return {
      success: true,
      data: { ...report, status: "dismissed", statusLabel: "مرفوض" },
      message: "تم رفض وتجاهل البلاغ بنجاح",
    };
  }
}

export const reportsService = new ReportsService();
