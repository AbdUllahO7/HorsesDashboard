"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { categoriesService, categoryFilterTabs } from "@/features/categories/services";
import {
  CategoryItem,
  CategoryFilterTabItem,
  CategoryFormData,
} from "@/features/categories/types";
import {
  Breadcrumb,
  TableToolbar,
  Pagination,
  ConfirmModal,
  CategoryModal,
  ConfirmModalVariant,
} from "@/components";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";

type FilterTabId = "all" | "livestock" | "supplies";

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function CategoriesPage() {
  const { t } = useTranslation();

  // State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [filterTabs, setFilterTabs] = useState<CategoryFilterTabItem[]>(categoryFilterTabs);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<FilterTabId>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
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
        const tabsRes = await categoriesService.getFilterTabs();
        if (tabsRes.success && tabsRes.data) {
          setFilterTabs(tabsRes.data);
        }
      } catch (err) {
        console.error("Failed to load category filter tabs:", err);
      }
    }
    loadTabs();
  }, []);

  // Load Categories Data
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await categoriesService.getCategories({
        page: currentPage,
        limit: 10,
        typeTab: activeTab,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setCategories(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, currentPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle Save (Add or Edit)
  const handleSaveCategory = async (data: CategoryFormData, id?: string) => {
    try {
      setActionLoading(true);
      if (id) {
        const res = await categoriesService.updateCategory(id, data);
        if (res.success && res.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === id ? res.data : c))
          );
        }
      } else {
        const res = await categoriesService.createCategory(data);
        if (res.success && res.data) {
          setCategories((prev) => [res.data, ...prev]);
        }
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteCategory = (category: CategoryItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف التصنيف",
      description: "هل تريد حذف هذا التصنيف؟ سيتم إزالته من قائمة التصنيفات في النظام.",
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await categoriesService.deleteCategory(category.id);
          setCategories((prev) => prev.filter((c) => c.id !== category.id));
        } catch (err) {
          console.error("Failed to delete category:", err);
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle={t("categories.title", "إدارة التصنيفات")} />

      {/* 2. Top Bar: Title & Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E1E2D]">
          {t("categories.listTitle", "قائمة التصنيفات")}
        </h1>
        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#B8860B] px-4 py-2 text-xs font-bold text-white hover:bg-[#A37508] transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("categories.addNewCategory", "إضافة تصنيف")}</span>
        </button>
      </div>

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Dynamic Toolbar */}
        <TableToolbar<FilterTabId>
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

        {/* 4. Responsive Grid of Category Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl border border-[#EDEEF2] bg-stone-50 animate-pulse p-4"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8E8E93]">
            لا توجد تصنيفات مطابقة
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 my-6">
            {categories.map((cat) => {
              const isLivestock = cat.type === "livestock";
              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-[#EDEEF2] bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Top Content */}
                  <div className="text-center sm:text-right">
                    <h3 className="text-sm font-bold text-[#1E1E2D] mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#8E8E93] mb-3">
                      {cat.description}
                    </p>
                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-medium border",
                          isLivestock
                            ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                            : "bg-[#EBF3FC] text-[#2563EB] border-[#BFDBFE]"
                        )}
                      >
                        {cat.typeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#F3F4F8]">
                    {/* Action buttons (Edit, Delete) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsModalOpen(true);
                        }}
                        title="تعديل"
                        className="flex h-6 w-6 items-center justify-center text-[#10B981] hover:text-[#059669] transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        title="حذف"
                        className="flex h-6 w-6 items-center justify-center text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Count */}
                    <span className="text-xs text-[#8E8E93] font-medium">
                      {cat.itemsCount} عنصر
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        loading={actionLoading}
      />
    </div>
  );
}
