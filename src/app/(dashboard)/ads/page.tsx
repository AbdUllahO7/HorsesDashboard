"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { adsService, adsFilterTabs } from "@/features/ads/services";
import {
  AdItem,
  AdFilterTabItem,
  AdFormData,
} from "@/features/ads/types";
import {
  Breadcrumb,
  TableToolbar,
  DataTable,
  Column,
  Pagination,
  ConfirmModal,
  AdModal,
  ConfirmModalVariant,
} from "@/components";
import { useTranslation } from "@/i18n";

type AdTabId = "types" | "published";

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function AdsManagementPage() {
  const { t } = useTranslation();

  // State
  const [filterTabs, setFilterTabs] = useState<AdFilterTabItem[]>(adsFilterTabs);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdTabId>("types");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "danger",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load Filter Tabs from service
  useEffect(() => {
    async function loadTabs() {
      try {
        const tabsRes = await adsService.getFilterTabs();
        if (tabsRes.success && tabsRes.data) {
          setFilterTabs(tabsRes.data);
        }
      } catch (err) {
        console.error("Failed to load ads tabs:", err);
      }
    }
    loadTabs();
  }, []);

  // Load Ads Data
  const loadAds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adsService.getAds({
        page: currentPage,
        limit: 10,
        tab: activeTab,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setAds(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load ads:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, currentPage]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  // Handle Save (Add or Edit)
  const handleSaveAd = async (data: AdFormData, id?: string) => {
    try {
      setErrorMessage(null);
      setActionLoading(true);
      if (id) {
        const res = await adsService.updateAd(id, data);
        if (res.success && res.data) {
          setAds((prev) => prev.map((a) => (String(a.id) === String(id) ? res.data : a)));
          setIsModalOpen(false);
          setEditingAd(null);
        } else {
          setErrorMessage(res.message || "حدث خطأ ما أثناء تحديث الإعلان");
        }
      } else {
        const res = await adsService.createAd(data);
        if (res.success && res.data) {
          setAds((prev) => [res.data, ...prev]);
          setIsModalOpen(false);
          setEditingAd(null);
        } else {
          setErrorMessage(res.message || "حدث خطأ ما أثناء إضافة الإعلان");
        }
      }
    } catch (err: unknown) {
      console.error("Failed to save ad:", err);
      const e = err as { message?: string };
      setErrorMessage(e?.message || "حدث خطأ ما أثناء حفظ الإعلان");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteAd = (ad: AdItem) => {
    setErrorMessage(null);
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف الإعلان",
      description: `هل أنت متأكد من حذف هذا الإعلان (${ad.categoryName || ad.title})؟ سيتم إزالته من النظام بشكل نهائي.`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await adsService.deleteAd(ad.id);
          if (res.success) {
            setAds((prev) => prev.filter((a) => a.id !== ad.id));
          } else {
            setErrorMessage(res.message || "حدث خطأ ما أثناء حذف الإعلان");
          }
        } catch (err) {
          console.error("Failed to delete ad:", err);
          setErrorMessage("حدث خطأ ما أثناء حذف الإعلان");
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Columns Configuration
  const columns: Column<AdItem>[] = [
    {
      key: "title",
      header: t("ads.adName", "نوع الاعلان / العنوان"),
      sortable: true,
      align: "right",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#B8860B] font-bold text-xs border border-[#EADBBD] overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onLoad={() => console.log("[AdsImg] loaded:", item.imageUrl)}
                onError={(e) => {
                  console.warn("[AdsImg] error loading:", item.imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector(".img-fallback")) {
                    const span = document.createElement("span");
                    span.className = "img-fallback text-sm";
                    span.textContent = "📢";
                    parent.appendChild(span);
                  }
                }}
              />
            ) : (
              <span className="text-sm">📢</span>
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-[#1E1E2D] block">{item.title}</span>
            {item.categoryName && item.categoryName !== item.title && (
              <span className="text-[11px] text-[#8E8E93]">{item.categoryName}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "duration",
      header: "مدة الظهور",
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.duration}</span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions", "الاجراءات"),
      align: "center",
      render: (item) => (
        <div
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Edit Action */}
          <button
            type="button"
            onClick={() => {
              setEditingAd(item);
              setIsModalOpen(true);
            }}
            title="تعديل الإعلان"
            className="flex h-6 w-6 items-center justify-center text-[#B8860B] hover:text-[#A37508] transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Delete Action */}
          <button
            type="button"
            onClick={() => handleDeleteAd(item)}
            title="حذف الإعلان"
            className="flex h-6 w-6 items-center justify-center text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
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
      <Breadcrumb pageTitle={t("ads.title", "ادارة الاعلانات")} />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Top Bar: Title & Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E1E2D]">
          {t("ads.listTitle", "قائمة الإعلانات")}
        </h1>
        <button
          type="button"
          onClick={() => {
            setEditingAd(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#B8860B] px-4 py-2 text-xs font-bold text-white hover:bg-[#A37508] transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("ads.addNewAd", "إضافة اعلان")}</span>
        </button>
      </div>

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Dynamic Toolbar */}
        <TableToolbar<AdTabId>
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          searchPlaceholder="ابحث هنا"
          tabs={filterTabs}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            setCurrentPage(1);
          }}
          showSort={true}
          sortLabel="فرز"
        />

        {/* Dynamic Data Table */}
        <DataTable
          columns={columns}
          data={ads}
          loading={loading}
          onRowClick={(item) => {
            setEditingAd(item);
            setIsModalOpen(true);
          }}
          keyExtractor={(item) => String(item.id)}
          emptyMessage="لا توجد إعلانات مطابقة"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Add / Edit Ad Modal */}
      <AdModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAd(null);
        }}
        onSave={handleSaveAd}
        ad={editingAd}
        loading={actionLoading}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        loading={actionLoading}
      />
    </div>
  );
}
