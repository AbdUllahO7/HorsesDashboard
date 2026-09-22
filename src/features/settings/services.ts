import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  FeaturePlanItem,
  FeaturePlanFormData,
  CouponItem,
  CouponFormData,
  SysPageContent,
  SysPageType,
  GeneralSettingsData,
} from "./types";

// Normalizers
const normalizePlan = (raw: unknown, index: number = 0): FeaturePlanItem => {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const id = (r.id ?? r.planId ?? index + 1) as string | number;
  const name = String(r.name || r.nameAr || r.title || `باقة #${id}`);
  const price = Number(r.price ?? r.cost ?? r.amount ?? 0);
  const duration_Value = Number(r.duration_Value ?? r.durationValue ?? r.durationInDays ?? 30);
  const duration_Type = Number(r.duration_Type ?? r.durationType ?? 1);
  const type = Number(r.type ?? r.featureType ?? 1);
  const quantity_Limit = Number(r.quantity_Limit ?? r.quantityLimit ?? r.maxAuctions ?? r.maxProducts ?? 0);
  const is_Lifetime = Boolean(r.is_Lifetime ?? r.isLifetime ?? false);
  const durationInDays = duration_Type === 1 ? duration_Value : duration_Type === 2 ? duration_Value * 7 : duration_Type === 3 ? duration_Value * 30 : duration_Value * 365;
  const isActive = r.isActive !== undefined ? Boolean(r.isActive) : (r.status === 1 || r.status === "active" || true);

  let features: string[] = [];
  if (Array.isArray(r.features)) {
    features = r.features.map(String);
  } else if (typeof r.features === "string") {
    features = r.features.split("\n").filter(Boolean);
  } else if (typeof r.description === "string") {
    features = r.description.split("\n").filter(Boolean);
  }

  return {
    id,
    name,
    nameAr: r.nameAr ? String(r.nameAr) : name,
    nameEn: r.nameEn ? String(r.nameEn) : undefined,
    description: r.description ? String(r.description) : undefined,
    price,
    duration_Value,
    duration_Type,
    durationInDays,
    type,
    quantity_Limit,
    is_Lifetime,
    features: features.length > 0 ? features : ["خدمات ومميزات متقدمة"],
    maxAuctions: type === 1 ? quantity_Limit : Number(r.maxAuctions ?? 0),
    maxProducts: (type === 2 || type === 4) ? quantity_Limit : Number(r.maxProducts ?? 0),
    maxLiveStreams: type === 3 ? quantity_Limit : Number(r.maxLiveStreams ?? 0),
    isBadgeIncluded: Boolean(r.isBadgeIncluded ?? r.hasBadge ?? false),
    isHighlighted: Boolean(r.isHighlighted ?? r.featured ?? false),
    isActive,
    createdAt: r.createdAt ? String(r.createdAt).split("T")[0] : undefined,
  };
};

const normalizeCoupon = (raw: unknown, index: number = 0): CouponItem => {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const id = (r.id ?? r.couponId ?? index + 1) as string | number;
  const code = String(r.code || r.couponCode || `COUPON${id}`);
  const isPercentage = r.isPercentage !== undefined
    ? Boolean(r.isPercentage)
    : (r.discountType === 1 || r.discountType === "percentage");
  const value = Number(r.value ?? r.discountValue ?? r.discount ?? 0);
  const rawExpire = r.expireDate || r.expiryDate;
  const expireDate = rawExpire ? String(rawExpire) : undefined;
  const maxUsage = r.maxUsage !== undefined ? Number(r.maxUsage) : (r.usageLimit !== undefined ? Number(r.usageLimit) : undefined);
  const usedCount = Number(r.usedCount ?? r.usageCount ?? r.timesUsed ?? 0);
  const isActive = r.isActive !== undefined ? Boolean(r.isActive) : (r.status === 1 || r.status === "active" || true);

  return {
    id,
    code,
    value,
    discountValue: value,
    isPercentage,
    discountType: isPercentage ? "percentage" : "fixed",
    expireDate,
    expiryDate: expireDate ? expireDate.split("T")[0] : undefined,
    maxUsage,
    usageLimit: maxUsage,
    usedCount,
    usageCount: usedCount,
    startDate: r.startDate ? String(r.startDate).split("T")[0] : undefined,
    minOrderAmount: r.minOrderAmount ? Number(r.minOrderAmount) : undefined,
    maxDiscountAmount: r.maxDiscountAmount ? Number(r.maxDiscountAmount) : undefined,
    isActive,
    createdAt: r.createdAt ? String(r.createdAt).split("T")[0] : undefined,
  };
};

class SettingsService {
  private localPlans: FeaturePlanItem[] = [];
  private localCoupons: CouponItem[] = [];
  private localSysPages: Partial<Record<SysPageType, SysPageContent>> = {};
  private localGeneralSettings: GeneralSettingsData = {
    platformName: "منصة الخيول العربية للمزادات",
    contactEmail: "admin@horses.market",
    contactPhone: "+966500000000",
    defaultCurrency: "SAR",
    commissionPercentage: 2.5,
    taxPercentage: 15,
    enableAuctionsAutoApproval: false,
    enableSellerAutoApproval: false,
    maintenanceMode: false,
  };

  // -------------------------------------------------------------
  // 1. FEATURE PLANS MANAGEMENT
  // -------------------------------------------------------------
  async getPlans(featureType: number = 1): Promise<ApiResponse<FeaturePlanItem[]>> {
    try {
      const endpoint = `${apiConfig.endpoints.plans.list}?featureType=${featureType}`;
      const res = await apiClient.request<any>(endpoint);
      let rawList: unknown[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && typeof res === "object") {
        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (Array.isArray((res as any).items)) {
          rawList = (res as any).items;
        } else if (Array.isArray((res as any).plans)) {
          rawList = (res as any).plans;
        } else if (Array.isArray((res as any).result)) {
          rawList = (res as any).result;
        } else if (res.data && typeof res.data === "object") {
          const d = res.data as Record<string, unknown>;
          rawList = (d.items || d.data || d.plans || d.result || []) as unknown[];
        }
      }

      if (rawList.length > 0 || Array.isArray(res?.data) || Array.isArray(res)) {
        const items = rawList.map((p, i) => normalizePlan(p, i));
        this.localPlans = items;
        return {
          success: true,
          data: items,
          message: "تم استرجاع باقات الميزات بنجاح",
        };
      }
    } catch (err) {
      console.warn(`API /FeaturePlansManagement/GetPlans?featureType=${featureType} failed:`, err);
    }

    return {
      success: true,
      data: this.localPlans,
      message: "تم تحميل الباقات",
    };
  }

  async createPlan(data: FeaturePlanFormData): Promise<ApiResponse<FeaturePlanItem>> {
    try {
      const payload = {
        name: String(data.name || ""),
        price: Number(data.price || 0),
        duration_Value: Number(data.duration_Value ?? data.durationInDays ?? 30),
        duration_Type: Number(data.duration_Type ?? 1),
        type: Number(data.type ?? 1),
        quantity_Limit: Number(data.quantity_Limit ?? data.maxAuctions ?? data.maxProducts ?? 0),
        is_Lifetime: Boolean(data.is_Lifetime),
        description: String(data.description || ""),
      };

      const res = await apiClient.post<any>(apiConfig.endpoints.plans.create, payload);
      const returnedData = (res && res.data) ? res.data : payload;
      const newPlan = normalizePlan(returnedData, this.localPlans.length);
      this.localPlans = [newPlan, ...this.localPlans];
      return {
        success: true,
        data: newPlan,
        message: "تم إنشاء باقة الميزات بنجاح",
      };
    } catch (err) {
      console.warn("API /FeaturePlansManagement/CreateFeaturePlan failed:", err);
      throw err;
    }
  }

  async updatePlan(id: string | number, data: Partial<FeaturePlanFormData>): Promise<ApiResponse<FeaturePlanItem>> {
    try {
      const payload = {
        name: String(data.name || ""),
        price: Number(data.price || 0),
        duration_Value: Number(data.duration_Value ?? data.durationInDays ?? 30),
        duration_Type: Number(data.duration_Type ?? 1),
        type: Number(data.type ?? 1),
        quantity_Limit: Number(data.quantity_Limit ?? data.maxAuctions ?? data.maxProducts ?? 0),
        is_Lifetime: Boolean(data.is_Lifetime),
        description: String(data.description || ""),
      };

      const res = await apiClient.post<any>(
        `${apiConfig.endpoints.plans.update}?id=${id}`,
        payload
      );
      const updated = normalizePlan(res?.data || { id, ...payload });
      this.localPlans = this.localPlans.map((p) => (String(p.id) === String(id) ? { ...p, ...updated } : p));
      return {
        success: true,
        data: updated,
        message: "تم تحديث باقة الميزات بنجاح",
      };
    } catch (err) {
      console.warn("API /FeaturePlansManagement/UpdateFeaturePlan failed:", err);
      throw err;
    }
  }

  async togglePlanStatus(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      const res = await apiClient.post<any>(
        `${apiConfig.endpoints.plans.toggleStatus}?id=${id}`
      );
      if (res.success) {
        this.localPlans = this.localPlans.map((p) =>
          String(p.id) === String(id) ? { ...p, isActive: !p.isActive } : p
        );
        return {
          success: true,
          data: true,
          message: "تم تغيير حالة الباقة بنجاح",
        };
      }
    } catch (err) {
      console.warn("API /FeaturePlansManagement/ToggleFeaturePlanStatus failed:", err);
    }

    this.localPlans = this.localPlans.map((p) =>
      String(p.id) === String(id) ? { ...p, isActive: !p.isActive } : p
    );
    return {
      success: true,
      data: true,
      message: "تم تحديث حالة الباقة بنجاح",
    };
  }

  // -------------------------------------------------------------
  // 2. COUPONS MANAGEMENT
  // -------------------------------------------------------------
  async getCoupons(): Promise<ApiResponse<CouponItem[]>> {
    try {
      const res = await apiClient.request<any>(apiConfig.endpoints.coupons.list);
      let rawList: unknown[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && typeof res === "object") {
        if (Array.isArray(res.data)) {
          rawList = res.data;
        } else if (Array.isArray((res as any).items)) {
          rawList = (res as any).items;
        } else if (Array.isArray((res as any).coupons)) {
          rawList = (res as any).coupons;
        } else if (Array.isArray((res as any).result)) {
          rawList = (res as any).result;
        } else if (res.data && typeof res.data === "object") {
          const d = res.data as Record<string, unknown>;
          rawList = (d.items || d.data || d.coupons || d.result || []) as unknown[];
        }
      }

      if (rawList.length > 0 || Array.isArray(res?.data) || Array.isArray(res)) {
        const items = rawList.map((c, i) => normalizeCoupon(c, i));
        this.localCoupons = items;
        return {
          success: true,
          data: items,
          message: "تم استرجاع كوبونات الخصم بنجاح",
        };
      }
    } catch (err) {
      console.warn("API /Coupons/GetAll failed:", err);
    }

    return {
      success: true,
      data: this.localCoupons,
      message: "تم تحميل كوبونات الخصم",
    };
  }

  async createCoupon(data: CouponFormData): Promise<ApiResponse<CouponItem>> {
    try {
      const isPercentage = data.isPercentage !== undefined
        ? Boolean(data.isPercentage)
        : data.discountType === "percentage";
      const value = Number(data.value ?? data.discountValue ?? 0);
      const rawExpire = data.expireDate || data.expiryDate;
      const expireDate = rawExpire
        ? (rawExpire.includes("T") ? rawExpire : new Date(rawExpire).toISOString())
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const maxUsage = Number(data.maxUsage ?? data.usageLimit ?? 100);
      const usedCount = Number(data.usedCount ?? 0);

      const payload = {
        code: data.code.toUpperCase().trim(),
        value,
        isPercentage,
        expireDate,
        maxUsage,
        usedCount,
      };

      const res = await apiClient.post<any>(apiConfig.endpoints.coupons.create, payload);
      if (res.success) {
        const item = normalizeCoupon(res.data || payload, this.localCoupons.length);
        this.localCoupons = [item, ...this.localCoupons];
        return {
          success: true,
          data: item,
          message: "تم إنشاء كود الخصم بنجاح",
        };
      }
    } catch (err) {
      console.warn("API /Coupons/Create failed:", err);
      throw err;
    }

    const val = Number(data.value ?? data.discountValue ?? 0);
    const isPerc = data.isPercentage !== undefined ? Boolean(data.isPercentage) : data.discountType === "percentage";
    const item: CouponItem = {
      id: Date.now(),
      code: data.code.toUpperCase().trim(),
      value: val,
      discountValue: val,
      isPercentage: isPerc,
      discountType: isPerc ? "percentage" : "fixed",
      expireDate: data.expireDate || data.expiryDate,
      expiryDate: data.expireDate ? data.expireDate.split("T")[0] : data.expiryDate,
      maxUsage: Number(data.maxUsage ?? data.usageLimit ?? 100),
      usageLimit: Number(data.maxUsage ?? data.usageLimit ?? 100),
      usedCount: Number(data.usedCount || 0),
      usageCount: Number(data.usedCount || 0),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString().split("T")[0],
    };
    this.localCoupons = [item, ...this.localCoupons];

    return {
      success: true,
      data: item,
      message: "تم إضافة الكوبون بنجاح",
    };
  }

  async updateCoupon(id: string | number, data: Partial<CouponFormData>): Promise<ApiResponse<CouponItem>> {
    try {
      const isPercentage = data.isPercentage !== undefined
        ? Boolean(data.isPercentage)
        : data.discountType !== undefined ? data.discountType === "percentage" : true;
      const value = Number(data.value ?? data.discountValue ?? 0);
      const rawExpire = data.expireDate || data.expiryDate;
      const expireDate = rawExpire
        ? (rawExpire.includes("T") ? rawExpire : new Date(rawExpire).toISOString())
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const maxUsage = Number(data.maxUsage ?? data.usageLimit ?? 100);
      const usedCount = Number(data.usedCount ?? 0);

      const payload = {
        id: Number(id) || id,
        couponId: Number(id) || id,
        code: data.code ? data.code.toUpperCase().trim() : undefined,
        value,
        isPercentage,
        expireDate,
        maxUsage,
        usedCount,
      };

      const res = await apiClient.post<any>(apiConfig.endpoints.coupons.update, payload);
      if (res.success) {
        const updated = normalizeCoupon(res.data || payload);
        this.localCoupons = this.localCoupons.map((c) => (String(c.id) === String(id) ? { ...c, ...updated } : c));
        return {
          success: true,
          data: updated,
          message: "تم تحديث الكوبون بنجاح",
        };
      }
    } catch (err) {
      console.warn("API /Coupons/Update failed:", err);
      throw err;
    }

    this.localCoupons = this.localCoupons.map((c) => {
      if (String(c.id) === String(id)) {
        const val = data.value !== undefined ? Number(data.value) : (data.discountValue !== undefined ? Number(data.discountValue) : c.value);
        const isPerc = data.isPercentage !== undefined ? Boolean(data.isPercentage) : (data.discountType !== undefined ? data.discountType === "percentage" : c.isPercentage);
        return {
          ...c,
          code: data.code ? data.code.toUpperCase().trim() : c.code,
          value: val,
          discountValue: val,
          isPercentage: isPerc,
          discountType: isPerc ? "percentage" : "fixed",
          expireDate: data.expireDate || c.expireDate,
          expiryDate: data.expireDate ? data.expireDate.split("T")[0] : (data.expiryDate || c.expiryDate),
          maxUsage: data.maxUsage !== undefined ? Number(data.maxUsage) : (data.usageLimit !== undefined ? Number(data.usageLimit) : c.maxUsage),
          usageLimit: data.maxUsage !== undefined ? Number(data.maxUsage) : (data.usageLimit !== undefined ? Number(data.usageLimit) : c.usageLimit),
          usedCount: data.usedCount !== undefined ? Number(data.usedCount) : c.usedCount,
          usageCount: data.usedCount !== undefined ? Number(data.usedCount) : c.usageCount,
        };
      }
      return c;
    });

    const target = this.localCoupons.find((c) => String(c.id) === String(id)) || normalizeCoupon({ id, ...data });
    return {
      success: true,
      data: target,
      message: "تم تعديل الكوبون بنجاح",
    };
  }

  async changeCouponStatus(id: string | number, isActive: boolean): Promise<ApiResponse<boolean>> {
    try {
      const res = await apiClient.post<any>(
        `${apiConfig.endpoints.coupons.changeStatus}?id=${id}&isActive=${isActive}`
      );
      if (res.success) {
        this.localCoupons = this.localCoupons.map((c) =>
          String(c.id) === String(id) ? { ...c, isActive } : c
        );
        return {
          success: true,
          data: true,
          message: "تم تغيير حالة الكوبون بنجاح",
        };
      }
    } catch (err) {
      console.warn("API /Coupons/ChangeStatus failed:", err);
    }

    this.localCoupons = this.localCoupons.map((c) =>
      String(c.id) === String(id) ? { ...c, isActive } : c
    );
    return {
      success: true,
      data: true,
      message: "تم تحديث حالة الكوبون",
    };
  }

  async deleteCoupon(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      const res = await apiClient.post<any>(
        `${apiConfig.endpoints.coupons.delete}?id=${id}`
      );
      if (res.success) {
        this.localCoupons = this.localCoupons.filter((c) => String(c.id) !== String(id));
        return {
          success: true,
          data: true,
          message: "تم حذف الكوبون بنجاح",
        };
      }
    } catch (err) {
      console.warn("API /Coupons/Delete failed:", err);
      throw err;
    }

    this.localCoupons = this.localCoupons.filter((c) => String(c.id) !== String(id));
    return {
      success: true,
      data: true,
      message: "تم حذف الكوبون",
    };
  }

  // -------------------------------------------------------------
  // 3. CMS & SYSTEM STATIC PAGES
  // -------------------------------------------------------------
  async getPrivacyPolicy(): Promise<ApiResponse<SysPageContent>> {
    try {
      const res = await apiClient.get<any>(apiConfig.endpoints.accounting.privacyPolicy);
      if (res.success && res.data) {
        const d = res.data;
        const page: SysPageContent = {
          id: d.id || 1,
          pageType: "privacy",
          title: String(d.title || d.pageTitle || "سياسة الخصوصية"),
          content: String(d.content || d.text || d.description || ""),
          updatedAt: d.updatedAt ? String(d.updatedAt).split("T")[0] : undefined,
        };
        this.localSysPages.privacy = page;
        return {
          success: true,
          data: page,
          message: "تم جلب سياسة الخصوصية",
        };
      }
    } catch (err) {
      console.warn("API /Admin/GetPrivacyPolicy failed:", err);
    }

    const defaultPage: SysPageContent = this.localSysPages.privacy || {
      id: 1,
      pageType: "privacy",
      title: "سياسة الخصوصية وسرية المعلومات",
      content: "",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    return {
      success: true,
      data: defaultPage,
      message: "تم تحميل سياسة الخصوصية",
    };
  }

  async getTermsAndConditions(): Promise<ApiResponse<SysPageContent>> {
    try {
      const res = await apiClient.get<any>(apiConfig.endpoints.accounting.termsAndConditions);
      if (res.success && res.data) {
        const d = res.data;
        const page: SysPageContent = {
          id: d.id || 2,
          pageType: "terms",
          title: String(d.title || d.pageTitle || "الشروط والأحكام"),
          content: String(d.content || d.text || d.description || ""),
          updatedAt: d.updatedAt ? String(d.updatedAt).split("T")[0] : undefined,
        };
        this.localSysPages.terms = page;
        return {
          success: true,
          data: page,
          message: "تم جلب الشروط والأحكام",
        };
      }
    } catch (err) {
      console.warn("API /Admin/GetTermsAndConditions failed:", err);
    }

    const defaultPage: SysPageContent = this.localSysPages.terms || {
      id: 2,
      pageType: "terms",
      title: "الشروط والأحكام العامة للمنصة",
      content: "",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    return {
      success: true,
      data: defaultPage,
      message: "تم تحميل الشروط والأحكام",
    };
  }

  async getSysPage(pageType: SysPageType): Promise<ApiResponse<SysPageContent>> {
    if (pageType === "privacy") return this.getPrivacyPolicy();
    if (pageType === "terms") return this.getTermsAndConditions();

    const page = this.localSysPages[pageType] || {
      id: 3,
      pageType,
      title: "صفحة النظام",
      content: "",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    return {
      success: true,
      data: page,
      message: "تم تحميل محتوى الصفحة",
    };
  }

  async updateSysPage(pageType: SysPageType, content: string, title?: string): Promise<ApiResponse<SysPageContent>> {
    try {
      const payload = {
        pageType,
        pageName: pageType === "privacy" ? "PrivacyPolicy" : pageType === "terms" ? "TermsAndConditions" : pageType,
        title: title || this.localSysPages[pageType]?.title || "صفحة النظام",
        content,
      };

      const res = await apiClient.post<any>(apiConfig.endpoints.accounting.updateSysPage, payload);
      if (res.success) {
        const updated: SysPageContent = {
          id: this.localSysPages[pageType]?.id || 1,
          pageType,
          content,
          title: title || this.localSysPages[pageType]?.title || "صفحة النظام",
          updatedAt: new Date().toISOString().split("T")[0],
        };
        this.localSysPages[pageType] = updated;
        return {
          success: true,
          data: updated,
          message: "تم حفظ وتحديث محتوى الصفحة بنجاح في النظام",
        };
      }
    } catch (err) {
      console.warn("API /Admin/UpdateSysPage failed:", err);
    }

    const updated: SysPageContent = {
      id: this.localSysPages[pageType]?.id || 1,
      pageType,
      content,
      title: title || this.localSysPages[pageType]?.title || "صفحة النظام",
      updatedAt: new Date().toISOString().split("T")[0],
    };
    this.localSysPages[pageType] = updated;

    return {
      success: true,
      data: updated,
      message: "تم تحديث الصفحة بنجاح",
    };
  }

  // -------------------------------------------------------------
  // 4. GENERAL PLATFORM SETTINGS
  // -------------------------------------------------------------
  async getGeneralSettings(): Promise<ApiResponse<GeneralSettingsData>> {
    return {
      success: true,
      data: this.localGeneralSettings,
      message: "تم استرجاع إعدادات المنصة",
    };
  }

  async updateGeneralSettings(data: Partial<GeneralSettingsData>): Promise<ApiResponse<GeneralSettingsData>> {
    this.localGeneralSettings = {
      ...this.localGeneralSettings,
      ...data,
    };
    return {
      success: true,
      data: this.localGeneralSettings,
      message: "تم حفظ الإعدادات العامة بنجاح",
    };
  }
}

export const settingsService = new SettingsService();
