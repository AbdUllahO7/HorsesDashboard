import { ApiResponse } from "@/types/api";
import {
  ReportTicketItem,
  ReportFilterParams,
  ReportsPaginationResponse,
} from "./types";

export const mockReportsList: ReportTicketItem[] = [
  {
    id: "rep-1",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "قام البائع بتقديم معلومات مضللة بخصوص حالة المزاد وعدم الالتزام بوثائق الفحص المعتمدة.",
    category: "احتيال في المزاد",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-2",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "المشتري لم يقم بإتمام عملية الدفع خلال المهلة المحددة بعد فوزه بالمزاد.",
    category: "تأخر في الدفع",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-3",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "مزايدة وهمية لرفع سعر الحصان بدون نية الشراء الحقيقية.",
    category: "مزايدة وهمية",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-4",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "استخدام صور غير حقيقية للماشية المعروضة في المزاد.",
    category: "محتوى غير مطابق",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-5",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "إرسال رسائل غير لائقة عبر المحادثة المباشرة أثناء البث.",
    category: "سلوك غير لائق",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-6",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "تأخر استلام الشحنة وتضرر المستلزمات أثناء النقل.",
    category: "مشكلة في الشحن",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-7",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "عدم تطابق السلالة المذكورة مع الشهادة المرفقة.",
    category: "عدم تطابق البيانات",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-8",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "عرض ماشية بدون تصريح بيطري ساري المفعول.",
    category: "مخالفة الشروط",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-9",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "محاولة الاتفاق على البيع خارج المنصة للتهرب من الرسوم.",
    category: "معاملات خارجية",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "rep-10",
    reporterName: "محمود احمد",
    reporterPhone: "0595121088",
    reporterEmail: "reporter@gmail.com",
    reportedUserName: "محمود احمد",
    reportedUserPhone: "0595121099",
    reportedUserEmail: "reported@gmail.com",
    reason: "إلغاء المزاد بدون إشعار مسبق بعد بدء المزايدات.",
    category: "إلغاء غير مبرر",
    status: "pending",
    createdAt: "2025-05-25",
  },
];

class ReportsService {
  async getReports(
    params: ReportFilterParams = {}
  ): Promise<ApiResponse<ReportsPaginationResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...mockReportsList];

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reporterName.toLowerCase().includes(q) ||
          r.reportedUserName.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          (r.category && r.category.toLowerCase().includes(q))
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 4;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        items: items.length > 0 ? items : filtered,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  async resolveReport(id: string): Promise<ApiResponse<ReportTicketItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockReportsList.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: "Report not found", data: null as any };
    }
    mockReportsList[index].status = "resolved";
    return {
      success: true,
      data: mockReportsList[index],
      message: "تم قبول البلاغ واتخاذ الإجراء اللازم بنجاح",
    };
  }

  async dismissReport(id: string): Promise<ApiResponse<ReportTicketItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockReportsList.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: "Report not found", data: null as any };
    }
    mockReportsList[index].status = "dismissed";
    return {
      success: true,
      data: mockReportsList[index],
      message: "تم رفض/تجاهل البلاغ بنجاح",
    };
  }
}

export const reportsService = new ReportsService();
