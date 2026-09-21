import { ApiResponse } from "@/types/api";
import {
  ComplaintReviewItem,
  ReviewFilterTabItem,
  ReviewFilterParams,
  ReviewsPaginationResponse,
} from "./types";

export const reviewFilterTabs: ReviewFilterTabItem[] = [
  { id: "all", label: "كل البائعين" },
  { id: "review", label: "تقييمات" },
  { id: "complaint", label: "شكاوي" },
];

export const mockComplaintsList: ComplaintReviewItem[] = [
  {
    id: "REV-101",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر العتيبي للماشية",
    customerName: "جمال احمد",
    customerPhone: "+966500000000",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: 4.8,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "كان يذكر إعلان المزاد أن عمر الأغنام عامين، ولكن عند التسليم بدت الأغنام أكبر سناً بكثير. حالة الحيوانات لا تتطابق مع الصور التي قدمت في القائمة. أشعر أن هذا إعلان كاذب وأود التحقيق في هذا الأمر.",
  },
  {
    id: "REV-102",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "مربط الأصالة للخيل",
    customerName: "جمال احمد",
    customerPhone: "+966511112233",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "تأخر التاجر في تسليم وثائق الفحص البيطري لمدة ثلاثة أيام عن الموعد المتفق عليه في شروط المزاد.",
  },
  {
    id: "REV-103",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر فرسان نجد",
    customerName: "جمال احمد",
    customerPhone: "+966522223344",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "المستلزمات المستلمة كانت ممتازة ولكن الشحن استغرق وقتاً أطول من المعتاد.",
  },
  {
    id: "REV-104",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر العتيبي للماشية",
    customerName: "جمال احمد",
    customerPhone: "+966533334455",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "تم تقديم شكوى بخصوص حالة السرج الجلدي المستلم، وتم التواصل مع البائع وحل الإشكال.",
  },
  {
    id: "REV-105",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "مزرعة البركة",
    customerName: "جمال احمد",
    customerPhone: "+966544445566",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "الحصان بحالة صحية ممتازة وتم التأكد من كافة التقارير الطبية.",
  },
  {
    id: "REV-106",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر العتيبي للماشية",
    customerName: "جمال احمد",
    customerPhone: "+966555556677",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "تم استلام المزاد في الوقت المحدد بدون أي ملاحظات سلبية.",
  },
  {
    id: "REV-107",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر الخيل العربي",
    customerName: "جمال احمد",
    customerPhone: "+966566667788",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "طلب إعادة فحص بيطري قبل إتمام عملية الدفع النهائية وتمت الموافقة من البائع.",
  },
  {
    id: "REV-108",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر العتيبي للماشية",
    customerName: "جمال احمد",
    customerPhone: "+966577778899",
    status: "pending",
    statusLabel: "قيد المراجعة",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "العميل يشكو من عدم تطابق مواصفات المزاد مع الحيوان المعروض، الملف حالياً تحت المراجعة من لجنة التحكيم.",
  },
  {
    id: "REV-109",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر فرسان نجد",
    customerName: "جمال احمد",
    customerPhone: "+966588889900",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "تم الاتفاق على تعويض العميل عن فارق تكاليف النقل الإضافية.",
  },
  {
    id: "REV-110",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "مزرعة الريان",
    customerName: "جمال احمد",
    customerPhone: "+966599990011",
    status: "resolved",
    statusLabel: "تم الحل",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "تم التحقق من بيانات المزاد واغلاق الشكوى برضا الطرفين.",
  },
  {
    id: "REV-111",
    type: "review",
    typeLabel: "تقييم",
    subject: "وصف مضلل للمزاد",
    sellerName: "محمود احمد",
    sellerStore: "متجر العتيبي للماشية",
    customerName: "جمال احمد",
    customerPhone: "+966500000000",
    status: "waiting",
    statusLabel: "قيد الانتظار",
    rating: null,
    joinedDate: "25 - 5 - 2025",
    joinedDateHijri: "١٤٤٥/٨/٥ هـ",
    description:
      "كان يذكر إعلان المزاد أن عمر الأغنام عامين، ولكن عند التسليم بدت الأغنام أكبر سناً بكثير. حالة الحيوانات لا تتطابق مع الصور التي قدمت في القائمة. أشعر أن هذا إعلان كاذب وأود التحقيق في هذا الأمر.",
  },
];

class ReviewsService {
  async getFilterTabs(): Promise<ApiResponse<ReviewFilterTabItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: reviewFilterTabs,
    };
  }

  async getReviewsTable(
    params: ReviewFilterParams = {}
  ): Promise<ApiResponse<ReviewsPaginationResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...mockComplaintsList];

    // Tab filter
    if (params.tab && params.tab !== "all") {
      filtered = filtered.filter((item) => item.type === params.tab);
    }

    // Status filter
    if (params.status && params.status !== "all") {
      filtered = filtered.filter((item) => item.status === params.status);
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.subject.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.typeLabel.toLowerCase().includes(q) ||
          (item.sellerStore && item.sellerStore.toLowerCase().includes(q))
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 11;
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

  async resolveComplaint(id: string): Promise<ApiResponse<ComplaintReviewItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const item = mockComplaintsList.find((c) => c.id === id);
    if (!item) {
      return { success: false, message: "Complaint not found", data: null as any };
    }
    item.status = "resolved";
    item.statusLabel = "تم الحل";
    return { success: true, data: item };
  }

  async rejectComplaint(id: string): Promise<ApiResponse<ComplaintReviewItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const item = mockComplaintsList.find((c) => c.id === id);
    if (!item) {
      return { success: false, message: "Complaint not found", data: null as any };
    }
    item.status = "pending";
    item.statusLabel = "مرفوضة";
    return { success: true, data: item };
  }

  async deleteComplaint(id: string): Promise<ApiResponse<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { success: true, data: true };
  }
}

export const reviewsService = new ReviewsService();
