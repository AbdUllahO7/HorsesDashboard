export interface FeaturePlanItem {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  price: number;
  duration_Value?: number;
  duration_Type?: number;
  durationInDays?: number;
  type?: number;
  quantity_Limit?: number;
  is_Lifetime?: boolean;
  features?: string[] | string;
  maxAuctions?: number;
  maxProducts?: number;
  maxLiveStreams?: number;
  isBadgeIncluded?: boolean;
  isHighlighted?: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface FeaturePlanFormData {
  name: string;
  price: number;
  duration_Value: number;
  duration_Type: number;
  type: number;
  quantity_Limit: number;
  is_Lifetime: boolean;
  description?: string;
  durationInDays?: number;
  features?: string;
  maxAuctions?: number;
  maxProducts?: number;
  maxLiveStreams?: number;
  isBadgeIncluded?: boolean;
  isHighlighted?: boolean;
  isActive?: boolean;
}

export interface CouponItem {
  id: string | number;
  code: string;
  value: number;
  isPercentage: boolean;
  expireDate?: string;
  maxUsage?: number;
  usedCount?: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  startDate?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CouponFormData {
  code: string;
  value: number;
  isPercentage: boolean;
  expireDate?: string;
  maxUsage?: number;
  usedCount?: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startDate?: string;
  expiryDate?: string;
  isActive?: boolean;
}

export type SysPageType = "privacy" | "terms" | "about" | "faq" | "contact";

export interface SysPageContent {
  id?: string | number;
  pageType: SysPageType;
  title: string;
  content: string;
  contentAr?: string;
  contentEn?: string;
  updatedAt?: string;
}

export interface GeneralSettingsData {
  platformName: string;
  contactEmail: string;
  contactPhone: string;
  defaultCurrency: string;
  commissionPercentage: number;
  taxPercentage: number;
  enableAuctionsAutoApproval: boolean;
  enableSellerAutoApproval: boolean;
  maintenanceMode: boolean;
}

export type SettingsActiveTab = "plans" | "coupons" | "cms" | "general";
