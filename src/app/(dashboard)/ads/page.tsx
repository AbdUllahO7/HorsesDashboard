"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<AdTabId>("types");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

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
        setTotalPages(res.data.pagination.totalPages || 4);
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
      setActionLoading(true);
      if (id) {
        const res = await adsService.updateAd(id, data);
        if (res.success && res.data) {
          setAds((prev) => prev.map((a) => (a.id === id ? res.data : a)));
        }
      } else {
        const res = await adsService.createAd(data);
        if (res.success && res.data) {
          setAds((prev) => [res.data, ...prev]);
        }
      }
      setIsModalOpen(false);
      setEditingAd(null);
    } catch (err) {
      console.error("Failed to save ad:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteAd = (ad: AdItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف الإعلان",
      description: `هل أنت متأكد من حذف هذا الإعلان (${ad.categoryName || ad.title})؟ سيتم إزالته من النظام بشكل نهائي.`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await adsService.deleteAd(ad.id);
          setAds((prev) => prev.filter((a) => a.id !== ad.id));
        } catch (err) {
          console.error("Failed to delete ad:", err);
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
      header: t("ads.adName", "نوع الاعلان"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]">{item.title}</span>
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
          keyExtractor={(item) => item.id}
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
