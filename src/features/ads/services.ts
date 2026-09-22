import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  AdItem,
  AdFilterTabItem,
  AdFilterParams,
  AdFormData,
  AdType,
  AdsPaginationResponse,
} from "./types";

export const adsFilterTabs: AdFilterTabItem[] = [
  { id: "types", label: "انواع الاعلانات" },
  { id: "published", label: "الاعلانات المنشورة" },
];

const parseAdType = (val: unknown): AdType => {
  if (val === 1 || val === "popup" || val === "Popup" || val === "إعلان منبثق") return "popup";
  if (val === 2 || val === "banner" || val === "Banner" || val === "بانر") return "banner";
  if (val === 3 || val === "story" || val === "Story" || val === "قصة") return "story";
  return "popup";
};

const parseAdImageUrl = (img?: unknown): string => {
  if (!img) return "";
  let str = "";
  if (typeof img === "object" && img !== null) {
    const o = img as Record<string, unknown>;
    str = String(
      o.image ||
      o.image_Name ||
      o.imageName ||
      o.url ||
      o.imageUrl ||
      o.image_Url ||
      o.path ||
      o.imagePath ||
      o.photo ||
      ""
    );
  } else if (typeof img === "string") {
    str = img;
  }
  if (!str || str === "null" || str === "undefined") return "";
  // If already an absolute URL, proxy it through /api/media/ to bypass ad-blockers
  if (str.startsWith("http://") || str.startsWith("https://")) {
    const urlPath = str.replace(/^https?:\/\/[^/]+\/img\//, "");
    return `/api/media/${urlPath}`;
  }
  if (str.startsWith("data:") || str.startsWith("blob:")) return str;
  const cleanName = str.replace(/^\/?(img\/)?/, "").replace(/^\//, "");
  // Route through internal proxy — avoids ad-blocker blocking of "AdsImages" paths
  return `/api/media/${cleanName}`;
};

class AdsService {
  async getFilterTabs(): Promise<ApiResponse<AdFilterTabItem[]>> {
    return {
      success: true,
      data: adsFilterTabs,
    };
  }

  /**
   * Get all Ads from API
   * Endpoint: GET /api/Ads/GetAllAds
   */
  async getAds(
    params: AdFilterParams = {}
  ): Promise<ApiResponse<AdsPaginationResponse>> {
    const page = params.page || 1;
    const limit = params.limit || 10;

    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        PageNumber: page,
        PageSize: limit,
        Search: params.search || undefined,
        Type: params.type || undefined,
        Status: params.status || undefined,
        SortBy: params.sortBy || undefined,
        SortDirection: params.sortOrder || undefined,
      };

      const response = await apiClient.get<unknown>(apiConfig.endpoints.ads.list, {
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
          else if (Array.isArray(obj.ads)) rawList = obj.ads as Record<string, unknown>[];

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

      const items: AdItem[] = rawList.map((item, index) => {
        const id = (item.id as string | number) ?? index + 1;
        const type = parseAdType(item.type ?? item.adType ?? item.type_Id);
        const typeLabel = type === "popup" ? "إعلان منبثق (Popup)" : type === "banner" ? "بانر (Banner)" : "قصة (Story)";
        const title = String(item.title ?? item.name ?? typeLabel);
        const categoryName = String(item.category_Name ?? item.categoryName ?? item.title ?? typeLabel);
        const duration = item.time_Show !== undefined && item.time_Show !== null
          ? `${item.time_Show} ثواني`
          : (item.duration ? `${item.duration} ثواني` : "5 ثواني");
        const imageUrl = parseAdImageUrl(item.image ?? item.image_Name ?? item.imageUrl ?? item.image_Url);
        const isActive = item.isActive !== false && item.status !== 0 && item.status !== "inactive";
        const status: "active" | "inactive" = isActive ? "active" : "inactive";
        const createdAt = item.created_At
          ? String(item.created_At).split("T")[0]
          : item.createdAt
          ? String(item.createdAt).split("T")[0]
          : new Date().toISOString().split("T")[0];

        return {
          id,
          title,
          type,
          typeLabel,
          categoryName,
          duration,
          imageUrl,
          status,
          statusLabel: isActive ? "نشط" : "متوقف",
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
        message: "تم جلب الإعلانات بنجاح من الخادم",
      };
    } catch (error) {
      console.error("Failed to load ads from API:", error);
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
        message: "فشل تحميل الإعلانات من الخادم",
      };
    }
  }

  /**
   * Get single Ad by ID
   * Endpoint: GET /api/Ads/GetById?id={id}
   */
  async getAdById(id: string | number): Promise<ApiResponse<AdItem>> {
    try {
      const response = await apiClient.get<Record<string, unknown>>(apiConfig.endpoints.ads.details, {
        params: { id },
      });
      const resData = (response.data || response) as Record<string, unknown>;
      const item = (resData.data || resData.value || resData) as Record<string, unknown>;

      const type = parseAdType(item.type ?? item.adType);
      const typeLabel = type === "popup" ? "popup" : type === "banner" ? "Banner" : "قصة";
      const title = String(item.title ?? item.name ?? typeLabel);
      const categoryName = String(item.category_Name ?? item.categoryName ?? item.title ?? "إعلان");
      const duration = item.duration ? `${item.duration} ثواني` : "5 ثواني";
      const imageUrl = parseAdImageUrl(item.image_Name ?? item.imageUrl ?? item.image);

      return {
        success: true,
        data: {
          id: String(id),
          title,
          type,
          typeLabel,
          categoryName,
          duration,
          imageUrl,
          status: item.isActive === false ? "inactive" : "active",
        },
        message: "Ad details loaded",
      };
    } catch (error) {
      console.error("Failed to load ad details:", error);
      return {
        success: false,
        data: undefined as unknown as AdItem,
        message: "حدث خطأ ما أثناء جلب تفاصيل الإعلان",
      };
    }
  }

  /**
   * Create / Add New Ad
   * Endpoint: POST /api/Ads/AddAd
   */
  async createAd(data: AdFormData): Promise<ApiResponse<AdItem>> {
    try {
      let typeCode = 1;
      if (data.type === "banner") typeCode = 2;
      else if (data.type === "story") typeCode = 3;

      const formData = new FormData();
      formData.append("Title", data.title || "");
      formData.append("Type", String(typeCode));
      formData.append("Duration", data.duration ? String(data.duration).replace(/[^0-9]/g, "") || "5" : "5");
      if (data.linkUrl) formData.append("LinkUrl", data.linkUrl);
      if (data.imageFile) {
        formData.append("Image", data.imageFile);
      } else if (data.imageUrl && data.imageUrl.startsWith("http")) {
        formData.append("ImageUrl", data.imageUrl);
      }

      const response = await apiClient.post<unknown>(apiConfig.endpoints.ads.add, formData);

      const resData = (response.data || response) as Record<string, unknown>;
      const item = (resData?.data || resData || {}) as Record<string, unknown>;

      const newAd: AdItem = {
        id: String(item.id ?? `ad-${Date.now()}`),
        title: data.type === "popup" ? "popup" : data.type === "banner" ? "Banner" : "قصة",
        type: data.type,
        typeLabel: data.type === "popup" ? "popup" : data.type === "banner" ? "Banner" : "قصة",
        categoryName: data.title,
        duration: data.duration || "5 ثواني",
        imageUrl: data.imageUrl || (item.image_Name ? parseAdImageUrl(item.image_Name) : undefined),
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };

      return {
        success: true,
        data: newAd,
        message: response.message || "تمت إضافة الإعلان بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to create ad:", error);
      const err = error as { message?: string };
      return {
        success: false,
        data: undefined as unknown as AdItem,
        message: err?.message ? `حدث خطأ ما: ${err.message}` : "حدث خطأ ما أثناء إضافة الإعلان",
      };
    }
  }

  /**
   * Update Ad
   */
  async updateAd(id: string | number, data: Partial<AdFormData>): Promise<ApiResponse<AdItem>> {
    try {
      let typeCode = 1;
      if (data.type === "banner") typeCode = 2;
      else if (data.type === "story") typeCode = 3;

      const formData = new FormData();
      formData.append("Id", String(id));
      if (data.title) formData.append("Title", data.title);
      formData.append("Type", String(typeCode));
      if (data.duration) formData.append("Duration", String(data.duration).replace(/[^0-9]/g, "") || "5");
      if (data.linkUrl) formData.append("LinkUrl", data.linkUrl);
      if (data.imageFile) {
        formData.append("Image", data.imageFile);
      } else if (data.imageUrl && data.imageUrl.startsWith("http")) {
        formData.append("ImageUrl", data.imageUrl);
      }

      await apiClient.post<unknown>(apiConfig.endpoints.ads.add, formData);

      const updated: AdItem = {
        id,
        title: data.type === "popup" ? "popup" : data.type === "banner" ? "Banner" : "قصة",
        type: data.type || "popup",
        typeLabel: data.type === "popup" ? "popup" : data.type === "banner" ? "Banner" : "قصة",
        categoryName: data.title || "إعلان",
        duration: data.duration || "5 ثواني",
        imageUrl: data.imageUrl,
        status: "active",
      };

      return {
        success: true,
        data: updated,
        message: "تم تحديث الإعلان بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to update ad:", error);
      const err = error as { message?: string };
      return {
        success: false,
        data: undefined as unknown as AdItem,
        message: err?.message ? `حدث خطأ ما: ${err.message}` : "حدث خطأ ما أثناء تحديث الإعلان",
      };
    }
  }

  /**
   * Change Ad Status (Active / Inactive)
   * Endpoint: POST /api/Ads/ChangeStatus?id={id}
   */
  async changeAdStatus(id: string | number): Promise<ApiResponse<void>> {
    try {
      await apiClient.post<void>(apiConfig.endpoints.ads.changeStatus, null, {
        params: { id },
      });
      return {
        success: true,
        data: undefined as unknown as void,
        message: "تم تغيير حالة الإعلان بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to change ad status:", error);
      return {
        success: false,
        data: undefined as unknown as void,
        message: "حدث خطأ ما أثناء تغيير حالة الإعلان",
      };
    }
  }

  /**
   * Delete Ad
   * Endpoint: POST /api/Ads/DeleteAd?id={id}
   */
  async deleteAd(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      await apiClient.post<void>(apiConfig.endpoints.ads.delete, null, {
        params: { id },
      });
      return {
        success: true,
        data: true,
        message: "تم حذف الإعلان بنجاح",
      };
    } catch (error: unknown) {
      console.error("Failed to delete ad:", error);
      const err = error as { message?: string };
      return {
        success: false,
        data: false,
        message: err?.message ? `حدث خطأ ما: ${err.message}` : "حدث خطأ ما أثناء حذف الإعلان",
      };
    }
  }
}

export const adsService = new AdsService();
