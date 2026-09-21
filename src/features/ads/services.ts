import { ApiResponse } from "@/types/api";
import {
  AdItem,
  AdFilterTabItem,
  AdFilterParams,
  AdFormData,
  AdsPaginationResponse,
} from "./types";

export const adsFilterTabs: AdFilterTabItem[] = [
  { id: "types", label: "انواع الاعلانات" },
  { id: "published", label: "الاعلانات المنشورة" },
];

export const mockAdTypesList: AdItem[] = [
  {
    id: "ad-1",
    title: "popup",
    type: "popup",
    typeLabel: "popup",
    categoryName: "إعلان منبثق",
    duration: "5 ثواني",
    status: "active",
  },
  {
    id: "ad-2",
    title: "Banner",
    type: "banner",
    typeLabel: "Banner",
    categoryName: "بانر رئيسي",
    duration: "5 ثواني",
    status: "active",
  },
];

export const mockPublishedAdsList: AdItem[] = [
  {
    id: "pub-1",
    title: "popup",
    type: "popup",
    typeLabel: "popup",
    categoryName: "عروض الخيول العربية",
    duration: "5 ثواني",
    imageUrl: "/images/ad-popup.jpg",
    status: "active",
  },
  {
    id: "pub-2",
    title: "Banner",
    type: "banner",
    typeLabel: "Banner",
    categoryName: "تخفيضات مستلزمات الفروسية",
    duration: "5 ثواني",
    imageUrl: "/images/ad-banner.jpg",
    status: "active",
  },
];

class AdsService {
  async getFilterTabs(): Promise<ApiResponse<AdFilterTabItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: adsFilterTabs,
    };
  }

  async getAds(
    params: AdFilterParams = {}
  ): Promise<ApiResponse<AdsPaginationResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const source = params.tab === "published" ? mockPublishedAdsList : mockAdTypesList;
    let filtered = [...source];

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.categoryName && a.categoryName.toLowerCase().includes(q)) ||
          a.duration.toLowerCase().includes(q)
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

  async createAd(data: AdFormData): Promise<ApiResponse<AdItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newAd: AdItem = {
      id: `ad-${Date.now()}`,
      title: data.type === "popup" ? "popup" : "Banner",
      type: data.type,
      typeLabel: data.type === "popup" ? "popup" : "Banner",
      categoryName: data.title,
      duration: data.duration || "5 ثواني",
      imageUrl: data.imageUrl,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    mockPublishedAdsList.unshift(newAd);
    return {
      success: true,
      data: newAd,
      message: "تمت إضافة الإعلان بنجاح",
    };
  }

  async updateAd(id: string, data: Partial<AdFormData>): Promise<ApiResponse<AdItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const list = [...mockAdTypesList, ...mockPublishedAdsList];
    const item = list.find((a) => a.id === id);
    if (!item) {
      return { success: false, message: "Ad not found", data: null as any };
    }
    if (data.title) item.categoryName = data.title;
    if (data.type) {
      item.type = data.type;
      item.title = data.type === "popup" ? "popup" : "Banner";
      item.typeLabel = data.type === "popup" ? "popup" : "Banner";
    }
    if (data.duration) item.duration = data.duration;
    if (data.imageUrl) item.imageUrl = data.imageUrl;

    return {
      success: true,
      data: item,
      message: "تم تحديث الإعلان بنجاح",
    };
  }

  async deleteAd(id: string): Promise<ApiResponse<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx1 = mockAdTypesList.findIndex((a) => a.id === id);
    if (idx1 !== -1) mockAdTypesList.splice(idx1, 1);
    const idx2 = mockPublishedAdsList.findIndex((a) => a.id === id);
    if (idx2 !== -1) mockPublishedAdsList.splice(idx2, 1);

    return {
      success: true,
      data: true,
      message: "تم حذف الإعلان بنجاح",
    };
  }
}

export const adsService = new AdsService();
