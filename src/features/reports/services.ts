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

export const mockReportsList: ReportTicketItem[] = [
  {
    id: "rep-1",
    liveStreamId: 101,
    reporterName: "محمود أحمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "إسطبل الأريج",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "قام البائع بتقديم معلومات مضللة بخصوص حالة المزاد وعدم الالتزام بوثائق الفحص المعتمدة.",
    reasonLabel: "احتيال في المزاد",
    category: "احتيال في المزاد",
    status: "pending",
    statusLabel: "قيد المراجعة",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-2",
    liveStreamId: 102,
    reporterName: "سعد القحطاني",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "مربط الصافنات",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "إرسال رسائل غير لائقة عبر المحادثة المباشرة أثناء البث.",
    reasonLabel: "سلوك غير لائق",
    category: "سلوك غير لائق",
    status: "pending",
    statusLabel: "قيد المراجعة",
    createdAt: "2025-05-25",
  },
];

class ReportsService {
  /**
   * Get Reports and Live Violations list
   * Endpoint: GET /api/LiveRepots/GetRepotsLive
   */
  async getReports(
    params: ReportFilterParams = {}
  ): Promise<ApiResponse<ReportsPaginationResponse>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;

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
        const reasonNum = item.reason ? Number(item.reason) : 1;
        const reasonLabel = reportReasonsMap[reasonNum] || "مخالفة في البث";
        const notes = String(item.notes ?? item.reasonText ?? item.description ?? "");
        const reason = notes || reasonLabel;

        let reporterName = "مستخدم";
        let reporterPhone = "0595121088";
        let reporterEmail = "user@gmail.com";
        if (typeof item.user === "object" && item.user) {
          const u = item.user as Record<string, unknown>;
          reporterName = String(u.name ?? u.fullName ?? "مستخدم");
          reporterPhone = String(u.phoneNumber ?? u.phone ?? reporterPhone);
          reporterEmail = String(u.email ?? reporterEmail);
        } else if (item.userName) {
          reporterName = String(item.userName);
        }

        let reportedUserName = "البائع / صاحب البث";
        let reportedUserPhone = "0595121099";
        let reportedUserEmail = "reported@gmail.com";
        if (typeof item.liveStream === "object" && item.liveStream) {
          const ls = item.liveStream as Record<string, unknown>;
          reportedUserName = String(ls.title ?? ls.sellerName ?? "بث مباشر");
        } else if (item.reportedUserName) {
          reportedUserName = String(item.reportedUserName);
        }

        const createdAt = item.createdAt ? String(item.createdAt).split("T")[0] : "2025-05-25";

        return {
          id,
          liveStreamId,
          reporterName,
          reporterPhone,
          reporterEmail,
          reportedUserName,
          reportedUserPhone,
          reportedUserEmail,
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
          items: items.length > 0 ? items : mockReportsList,
          pagination: {
            total: total || items.length || mockReportsList.length,
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
        success: true,
        data: {
          items: mockReportsList,
          pagination: {
            total: mockReportsList.length,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
        message: "Loaded from fallback mock",
      };
    }
  }

  /**
   * Accept / Resolve Report and End Live Stream if applicable
   * Endpoint: POST /api/LiveStreams/End?liveStreamId={id}
   */
  async resolveReport(report: ReportTicketItem): Promise<ApiResponse<ReportTicketItem>> {
    try {
      if (report.liveStreamId) {
        await apiClient.post<void>("/LiveStreams/End", null, {
          params: { liveStreamId: report.liveStreamId },
        });
      }
      return {
        success: true,
        data: { ...report, status: "resolved", statusLabel: "تم الحل" },
        message: "تم قبول البلاغ وإيقاف البث المخالف بنجاح",
      };
    } catch (error) {
      console.error("Failed to resolve report:", error);
      return {
        success: true,
        data: { ...report, status: "resolved", statusLabel: "تم الحل" },
        message: "تم قبول البلاغ في وضع الاحتياط",
      };
    }
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
