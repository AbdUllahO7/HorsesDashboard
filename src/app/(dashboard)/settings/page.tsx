"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Layers,
  Ticket,
  FileText,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Crown,
  Sparkles,
  Gavel,
  ShoppingBag,
  Video,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { settingsService } from "@/features/settings/services";
import {
  FeaturePlanItem,
  FeaturePlanFormData,
  CouponItem,
  CouponFormData,
  SysPageContent,
  SysPageType,
  GeneralSettingsData,
  SettingsActiveTab,
} from "@/features/settings/types";
import {
  Breadcrumb,
  DataTable,
  Column,
  ToggleSwitch,
  PlanModal,
  CouponModal,
  ConfirmModal,
} from "@/components";
import { cn } from "@/core/utils/cn";

export default function SettingsPage() {
  // State
  const [activeTab, setActiveTab] = useState<SettingsActiveTab>("plans");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Plans State
  const [plans, setPlans] = useState<FeaturePlanItem[]>([]);
  const [selectedFeatureType, setSelectedFeatureType] = useState<number>(1);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<FeaturePlanItem | null>(null);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponItem | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<CouponItem | null>(null);

  // CMS State
  const [selectedSysPage, setSelectedSysPage] = useState<SysPageType>("privacy");
  const [sysPageContent, setSysPageContent] = useState<SysPageContent | null>(null);
  const [cmsTitle, setCmsTitle] = useState<string>("");
  const [cmsBody, setCmsBody] = useState<string>("");

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsData>({
    platformName: "منصة الخيول العربية للمزادات",
    contactEmail: "admin@horses.market",
    contactPhone: "+966501234567",
    defaultCurrency: "SAR",
    commissionPercentage: 2.5,
    taxPercentage: 15,
    enableAuctionsAutoApproval: false,
    enableSellerAutoApproval: false,
    maintenanceMode: false,
  });

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Load Plans
  const loadPlans = useCallback(async (featureType: number = selectedFeatureType) => {
    try {
      setLoading(true);
      const res = await settingsService.getPlans(featureType);
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load plans:", err);
      setErrorMsg("حدث خطأ أثناء تحميل باقات الميزات");
    } finally {
      setLoading(false);
    }
  }, [selectedFeatureType]);

  // Load Coupons
  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsService.getCoupons();
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load coupons:", err);
      setErrorMsg("حدث خطأ أثناء تحميل كوبونات الخصم");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load CMS Page
  const loadSysPage = useCallback(async (pageType: SysPageType) => {
    try {
      setLoading(true);
      const res = await settingsService.getSysPage(pageType);
      if (res.success && res.data) {
        setSysPageContent(res.data);
        setCmsTitle(res.data.title || "");
        setCmsBody(res.data.content || "");
      }
    } catch (err: unknown) {
      console.error("Failed to load sys page:", err);
      setErrorMsg("حدث خطأ أثناء تحميل محتوى الصفحة");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load General Settings
  const loadGeneralSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsService.getGeneralSettings();
      if (res.success && res.data) {
        setGeneralSettings(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load general settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load based on tab
  useEffect(() => {
    setErrorMsg(null);
    if (activeTab === "plans") {
      loadPlans();
    } else if (activeTab === "coupons") {
      loadCoupons();
    } else if (activeTab === "cms") {
      loadSysPage(selectedSysPage);
    } else if (activeTab === "general") {
      loadGeneralSettings();
    }
  }, [activeTab, loadPlans, loadCoupons, loadSysPage, selectedSysPage, loadGeneralSettings]);

  // Plan Handlers
  const handleSavePlan = async (formData: FeaturePlanFormData, id?: string | number) => {
    try {
      if (id) {
        const res = await settingsService.updatePlan(id, formData);
        if (res.success) {
          showToast("تم تحديث باقة الميزات بنجاح");
          await loadPlans();
        }
      } else {
        const res = await settingsService.createPlan(formData);
        if (res.success) {
          showToast("تم إنشاء باقة الميزات بنجاح");
          await loadPlans();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الباقة";
      setErrorMsg(msg);
      throw err;
    }
  };

  const handleTogglePlanStatus = async (id: string | number) => {
    try {
      const res = await settingsService.togglePlanStatus(id);
      if (res.success) {
        showToast("تم تحديث حالة الباقة بنجاح");
        await loadPlans();
      }
    } catch (err) {
      console.error("Failed to toggle plan status:", err);
      setErrorMsg("حدث خطأ أثناء تغيير حالة الباقة");
    }
  };

  // Coupon Handlers
  const handleSaveCoupon = async (formData: CouponFormData, id?: string | number) => {
    try {
      if (id) {
        const res = await settingsService.updateCoupon(id, formData);
        if (res.success) {
          showToast("تم تحديث كوبون الخصم بنجاح");
          await loadCoupons();
        }
      } else {
        const res = await settingsService.createCoupon(formData);
        if (res.success) {
          showToast("تم إنشاء كوبون الخصم بنجاح");
          await loadCoupons();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الكوبون";
      setErrorMsg(msg);
      throw err;
    }
  };

  const handleToggleCouponStatus = async (coupon: CouponItem) => {
    try {
      const res = await settingsService.changeCouponStatus(coupon.id, !coupon.isActive);
      if (res.success) {
        showToast("تم تغيير حالة الكوبون بنجاح");
        await loadCoupons();
      }
    } catch (err) {
      console.error("Failed to toggle coupon status:", err);
      setErrorMsg("حدث خطأ أثناء تغيير حالة الكوبون");
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    try {
      const res = await settingsService.deleteCoupon(couponToDelete.id);
      if (res.success) {
        showToast("تم حذف الكوبون بنجاح");
        await loadCoupons();
      }
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      setErrorMsg("حدث خطأ أثناء حذف الكوبون");
    } finally {
      setCouponToDelete(null);
    }
  };

  // CMS Handlers
  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsBody.trim()) {
      setErrorMsg("يرجى إدخال محتوى الصفحة");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await settingsService.updateSysPage(selectedSysPage, cmsBody, cmsTitle);
      if (res.success) {
        showToast("تم حفظ وتحديث محتوى الصفحة بنجاح في النظام");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء تحديث الصفحة";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // General Settings Handlers
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await settingsService.updateGeneralSettings(generalSettings);
      if (res.success) {
        showToast("تم حفظ الإعدادات العامة بنجاح");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الإعدادات";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Coupon Table Columns
  const couponColumns: Column<CouponItem>[] = [
    {
      key: "code",
      header: "كود الكوبون",
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#A6883C] bg-[#FAF4E6] border border-[#EADBBD] px-2.5 py-1 rounded-lg">
          {item.code}
        </span>
      ),
    },
    {
      key: "value",
      header: "قيمة الخصم",
      align: "center",
      render: (item) => {
        const isPerc = item.isPercentage !== undefined ? item.isPercentage : item.discountType === "percentage";
        const val = item.value ?? item.discountValue ?? 0;
        return (
          <span className="text-xs font-bold text-[#1E1E2D]">
            {isPerc ? `${val}%` : `${val}`}
          </span>
        );
      },
    },
    {
      key: "usageCount",
      header: "مرات الاستخدام",
      align: "center",
      render: (item) => {
        const used = item.usedCount ?? item.usageCount ?? 0;
        const limit = item.maxUsage ?? item.usageLimit;
        return (
          <span className="text-xs text-[#333748]">
            {used} / {limit ? limit : "∞"}
          </span>
        );
      },
    },
    {
      key: "expiryDate",
      header: "تاريخ الصلاحية",
      align: "center",
      render: (item) => {
        const exp = item.expireDate ? item.expireDate.split("T")[0] : item.expiryDate;
        return (
          <span className="text-xs text-[#8E8E93]">{exp || "غير محدد"}</span>
        );
      },
    },
    {
      key: "isActive",
      header: "الحالة",
      align: "center",
      render: (item) => (
        <ToggleSwitch
          checked={item.isActive}
          onChange={() => handleToggleCouponStatus(item)}
          color="gold"
        />
      ),
    },
    {
      key: "actions",
      header: "الاجراءات",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedCoupon(item);
              setIsCouponModalOpen(true);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A6883C] hover:bg-[#FAF4E6] transition-colors cursor-pointer"
            title="تعديل الكوبون"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCouponToDelete(item)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="حذف الكوبون"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle="الإعدادات، الباقات، الكوبونات والصفحات الثابتة" />

      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#10B981] px-5 py-3 text-xs font-bold text-white shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="font-semibold">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="mr-auto text-xs text-red-500 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F5F6FA] rounded-2xl border border-[#EDEEF2] overflow-x-auto shadow-2xs">
        {[
          { id: "plans", label: "باقات الميزات والاشتراكات", icon: Layers },
          { id: "coupons", label: "كوبونات الخصم", icon: Ticket },
          { id: "cms", label: "الصفحات الثابتة والسياسات", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsActiveTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-[#A6883C] text-white shadow-xs"
                  : "text-[#6B7280] hover:text-[#1E1E2D] hover:bg-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: FEATURE PLANS MANAGEMENT                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E1E2D]">باقات الميزات واشتراكات التجار</h2>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                تخصيص حدود المزادات والمنتجات والبثوث وشارات التوثيق للمرابط والمتاجر
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPlan(null);
                setIsPlanModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#A6883C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#937734] transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة باقة جديدة</span>
            </button>
          </div>

          {/* Feature Types Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 1, label: "باقات المزادات", icon: Gavel },
              { id: 2, label: "باقات الإعلانات والتمييز", icon: Sparkles },
              { id: 3, label: "باقات البث المباشر", icon: Video },
              { id: 4, label: "باقات المنتجات والمتاجر", icon: ShoppingBag },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = selectedFeatureType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedFeatureType(t.id);
                    loadPlans(t.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isSelected
                      ? "bg-[#A6883C] text-white shadow-xs"
                      : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#A6883C]/40 hover:text-[#1E1E2D]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Plans Grid */}
          {plans.length === 0 ? (
            <div className="rounded-3xl border border-[#EDEEF2] bg-white p-12 text-center">
              <Layers className="w-12 h-12 text-[#8E8E93]/40 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1E1E2D]">لا توجد باقات في هذا القسم حالياً</h3>
              <p className="text-xs text-[#8E8E93] mt-1 mb-4">يمكنك إضافة باقة جديدة بالضغط على الزر أدناه</p>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setIsPlanModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#A6883C] px-4 py-2 text-xs font-bold text-white hover:bg-[#937734] transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة باقة جديدة</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-3xl border bg-white p-6 shadow-2xs flex flex-col justify-between transition-all duration-300",
                    plan.isHighlighted
                      ? "border-[#A6883C] shadow-md ring-2 ring-[#A6883C]/20"
                      : "border-[#EDEEF2] hover:border-[#A6883C]/50"
                  )}
                >
                  {/* Highlighted Ribbon */}
                  {plan.isHighlighted && (
                    <div className="absolute -top-3 left-6 bg-[#A6883C] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>الأكثر طلباً</span>
                    </div>
                  )}

                  <div>
                    {/* Plan Top Details */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C]">
                          {plan.isBadgeIncluded ? <Crown className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1E1E2D]">{plan.name}</h3>
                          <span className="text-[11px] text-[#8E8E93]">صلاحية: {plan.durationInDays} يوم</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <ToggleSwitch
                          checked={plan.isActive}
                          onChange={() => handleTogglePlanStatus(plan.id)}
                          color="gold"
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="my-4 pb-4 border-b border-[#EDEEF2]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-[#A6883C]" dir="ltr">
                          {plan.price}
                        </span>
                        <span className="text-xs font-bold text-[#6B7280]"></span>
                        <span className="text-[11px] text-[#8E8E93] mr-1">/ {plan.durationInDays} يوم</span>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-[#8E8E93] mt-2 leading-relaxed">{plan.description}</p>
                      )}
                    </div>

                    {/* Limits Badges */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
                        <Gavel className="w-4 h-4 mx-auto text-[#A6883C] mb-1" />
                        <p className="text-[10px] text-[#8E8E93]">المزادات</p>
                        <p className="text-xs font-bold text-[#1E1E2D]">{plan.maxAuctions || "—"}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
                        <ShoppingBag className="w-4 h-4 mx-auto text-[#A6883C] mb-1" />
                        <p className="text-[10px] text-[#8E8E93]">المنتجات</p>
                        <p className="text-xs font-bold text-[#1E1E2D]">{plan.maxProducts || "—"}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
                        <Video className="w-4 h-4 mx-auto text-[#A6883C] mb-1" />
                        <p className="text-[10px] text-[#8E8E93]">البث المباشر</p>
                        <p className="text-xs font-bold text-[#1E1E2D]">{plan.maxLiveStreams || "—"}</p>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-[#1E1E2D]">الميزات المشمولة:</p>
                      {Array.isArray(plan.features) &&
                        plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#333748]">
                            <div className="w-4 h-4 rounded-full bg-[#FAF4E6] text-[#A6883C] flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span>{feat}</span>
                          </div>
                        ))}

                      {plan.isBadgeIncluded && (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#A6883C]">
                          <ShieldCheck className="w-4 h-4 shrink-0 text-[#A6883C]" />
                          <span>تتضمن شارة التوثيق الذهبية</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-4 border-t border-[#EDEEF2]">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsPlanModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#EDEEF2] bg-white text-xs font-bold text-[#333748] hover:bg-[#FAF4E6] hover:text-[#A6883C] hover:border-[#A6883C] transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل الباقة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: COUPONS MANAGEMENT                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E1E2D]">كوبونات الخصم والعروض الترويجية</h2>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                إدارة أكواد الخصم، نسب التخفيض، والحدود الزمنية لعمليات الدفع والاشتراك
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCoupon(null);
                setIsCouponModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#A6883C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#937734] transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة كوبون جديد</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
            <DataTable
              columns={couponColumns}
              data={coupons}
              loading={loading}
              keyExtractor={(item) => String(item.id)}
              emptyMessage="لا توجد كوبونات خصم مسجلة حالياً"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CMS & SYSTEM STATIC PAGES                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "cms" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E1E2D]">إدارة الصفحات الثابتة والسياسات</h2>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                تعديل سياسة الخصوصية، الشروط والأحكام، والأسئلة الشائعة المعروضة للمستخدمين
              </p>
            </div>
          </div>

          {/* Subtabs for Pages */}
          <div className="flex items-center gap-2 border-b border-[#EDEEF2] pb-3 overflow-x-auto">
            {[
              { id: "privacy", label: "سياسة الخصوصية" },
              { id: "terms", label: "الشروط والأحكام" },
              { id: "about", label: "عن المنصة" },
              { id: "faq", label: "الأسئلة الشائعة" },
              { id: "contact", label: "معلومات التواصل" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedSysPage(p.id as SysPageType)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  selectedSysPage === p.id
                    ? "bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD]"
                    : "text-[#6B7280] hover:text-[#1E1E2D] hover:bg-[#F9FAFB]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Editor Form */}
          <form onSubmit={handleSaveCMS} className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">عنوان الصفحة</label>
              <input
                type="text"
                value={cmsTitle}
                onChange={(e) => setCmsTitle(e.target.value)}
                placeholder="عنوان الصفحة..."
                className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">محتوى الصفحة (نص منسق / Markdown)</label>
              <textarea
                rows={12}
                value={cmsBody}
                onChange={(e) => setCmsBody(e.target.value)}
                placeholder="اكتب تفاصيل وبنود الصفحة هنا..."
                className="w-full rounded-xl border border-[#EDEEF2] bg-white p-4 text-xs text-[#1E1E2D] leading-relaxed outline-none focus:border-[#A6883C] transition-all font-sans resize-y"
                required
              />
            </div>

            {sysPageContent?.updatedAt && (
              <p className="text-[11px] text-[#8E8E93]">
                آخر تحديث: {sysPageContent.updatedAt}
              </p>
            )}

            <div className="flex justify-end pt-4 border-t border-[#EDEEF2]">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#A6883C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#937734] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات في النظام"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: GENERAL PLATFORM SETTINGS                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E1E2D]">الإعدادات العامة للنظام</h2>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                تعديل إعدادات التواصل، العملة، نسب الضرائب والعمولات، وخيارات الاعتماد الآلي
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#A6883C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#937734] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <h3 className="text-sm font-bold text-[#1E1E2D] pb-3 border-b border-[#EDEEF2]">
              المعلومات الأساسية وبيانات التواصل
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">اسم المنصة</label>
                <input
                  type="text"
                  value={generalSettings.platformName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">العملة الافتراضية</label>
                <input
                  type="text"
                  value={generalSettings.defaultCurrency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultCurrency: e.target.value })}
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">البريد الإلكتروني للإدارة</label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">رقم الهاتف للتواصل</label>
                <input
                  type="text"
                  value={generalSettings.contactPhone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C]"
                  dir="ltr"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#1E1E2D] pt-4 pb-3 border-b border-[#EDEEF2]">
              الرسوم، العمولات والضرائب
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">نسبة عمولة المنصة من المزادات (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={generalSettings.commissionPercentage}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, commissionPercentage: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1E2D] mb-1.5">ضريبة القيمة المضافة (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={generalSettings.taxPercentage}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, taxPercentage: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2.5 text-xs text-[#1E1E2D] outline-none focus:border-[#A6883C]"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#1E1E2D] pt-4 pb-3 border-b border-[#EDEEF2]">
              خيارات النظام والاعتماد التلقائي
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
                <div>
                  <p className="text-xs font-bold text-[#1E1E2D]">الموافقة التلقائية على المزادات</p>
                  <p className="text-[11px] text-[#8E8E93]">نشر المزادات مباشرة دون الحاجة لمراجعة الإدارة</p>
                </div>
                <ToggleSwitch
                  checked={generalSettings.enableAuctionsAutoApproval}
                  onChange={(val) => setGeneralSettings({ ...generalSettings, enableAuctionsAutoApproval: val })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
                <div>
                  <p className="text-xs font-bold text-[#1E1E2D]">الموافقة التلقائية على طلبات توثيق البائعين</p>
                  <p className="text-[11px] text-[#8E8E93]">اعتماد حسابات المرابط والمتاجر فور اكتمال المستندات</p>
                </div>
                <ToggleSwitch
                  checked={generalSettings.enableSellerAutoApproval}
                  onChange={(val) => setGeneralSettings({ ...generalSettings, enableSellerAutoApproval: val })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
                <div>
                  <p className="text-xs font-bold text-[#1E1E2D]">وضع الصيانة</p>
                  <p className="text-[11px] text-[#8E8E93]">إيقاف واجهة التطبيق والمتجر مؤقتاً لأعمال الصيانة</p>
                </div>
                <ToggleSwitch
                  checked={generalSettings.maintenanceMode}
                  onChange={(val) => setGeneralSettings({ ...generalSettings, maintenanceMode: val })}
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Plan Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSave={handleSavePlan}
        plan={selectedPlan}
      />

      {/* Coupon Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSave={handleSaveCoupon}
        coupon={selectedCoupon}
      />

      {/* Delete Coupon Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDeleteCoupon}
        title="تأكيد حذف الكوبون"
        description={`هل أنت متأكد من رغبتك في حذف الكوبون "${couponToDelete?.code}" نهائياً؟`}
        confirmText="حذف"
        variant="danger"
      />
    </div>
  );
}
