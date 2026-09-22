"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Layers, Sparkles } from "lucide-react";
import { categoriesService, categoryFilterTabs } from "@/features/categories/services";
import {
  CategoryItem,
  CategoryFilterTabItem,
  CategoryFormData,
  BreedItem,
} from "@/features/categories/types";
import {
  Breadcrumb,
  TableToolbar,
  Pagination,
  ConfirmModal,
  CategoryModal,
  BreedModal,
  ConfirmModalVariant,
} from "@/components";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";

type MainTab = "categories" | "breeds";
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

  // Active top-level mode: Categories vs Horse Breeds
  const [mainMode, setMainMode] = useState<MainTab>("categories");

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [filterTabs, setFilterTabs] = useState<CategoryFilterTabItem[]>(categoryFilterTabs);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState<FilterTabId>("all");
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [categoryPage, setCategoryPage] = useState<number>(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState<number>(1);

  // Breeds State
  const [breeds, setBreeds] = useState<BreedItem[]>([]);
  const [breedsLoading, setBreedsLoading] = useState<boolean>(false);
  const [breedSearch, setBreedSearch] = useState<string>("");
  const [breedPage, setBreedPage] = useState<number>(1);
  const [breedTotalPages, setBreedTotalPages] = useState<number>(1);

  // Modal states
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [isBreedModalOpen, setIsBreedModalOpen] = useState<boolean>(false);
  const [editingBreed, setEditingBreed] = useState<BreedItem | null>(null);

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
      setCategoriesLoading(true);
      const res = await categoriesService.getCategories({
        page: categoryPage,
        limit: 12,
        typeTab: activeCategoryTab,
        search: categorySearch,
      });

      if (res.success && res.data) {
        setCategories(res.data.items);
        setCategoryTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [activeCategoryTab, categorySearch, categoryPage]);

  // Load Breeds Data
  const loadBreeds = useCallback(async () => {
    try {
      setBreedsLoading(true);
      const res = await categoriesService.getBreeds({
        page: breedPage,
        limit: 12,
        search: breedSearch,
      });

      if (res.success && res.data) {
        setBreeds(res.data.items);
        setBreedTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load breeds:", err);
    } finally {
      setBreedsLoading(false);
    }
  }, [breedSearch, breedPage]);

  useEffect(() => {
    if (mainMode === "categories") {
      loadCategories();
    } else {
      loadBreeds();
    }
  }, [mainMode, loadCategories, loadBreeds]);

  // Handle Category Save (Add or Edit)
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
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Category Delete
  const handleDeleteCategory = (category: CategoryItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف التصنيف",
      description: `هل أنت متأكد من حذف التصنيف "${category.name}"؟`,
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

  // Handle Breed Save (Add or Edit)
  const handleSaveBreed = async (name: string, id?: string | number) => {
    try {
      setActionLoading(true);
      if (id) {
        const res = await categoriesService.updateBreed(id, name);
        if (res.success && res.data) {
          setBreeds((prev) =>
            prev.map((b) => (b.id === id ? res.data : b))
          );
        }
      } else {
        const res = await categoriesService.createBreed(name);
        if (res.success && res.data) {
          setBreeds((prev) => [res.data, ...prev]);
        }
      }
      setIsBreedModalOpen(false);
      setEditingBreed(null);
    } catch (err) {
      console.error("Failed to save breed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Breed Delete
  const handleDeleteBreed = (breed: BreedItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف سلالة الخيل",
      description: `هل أنت متأكد من حذف السلالة "${breed.name}"؟`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await categoriesService.deleteBreed(breed.id);
          setBreeds((prev) => prev.filter((b) => b.id !== breed.id));
        } catch (err) {
          console.error("Failed to delete breed:", err);
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
      <Breadcrumb pageTitle={t("categories.title", "إدارة التصنيفات وسلالات الخيول")} />

      {/* 2. Mode Selector: Categories vs Breeds */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#F3F4F8] p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setMainMode("categories")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              mainMode === "categories"
                ? "bg-white text-[#1E1E2D] shadow-sm"
                : "text-[#8E8E93] hover:text-[#1E1E2D]"
            )}
          >
            <Layers className="h-4 w-4 text-[#B8860B]" />
            <span>التصنيفات العامة</span>
          </button>

          <button
            type="button"
            onClick={() => setMainMode("breeds")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              mainMode === "breeds"
                ? "bg-white text-[#1E1E2D] shadow-sm"
                : "text-[#8E8E93] hover:text-[#1E1E2D]"
            )}
          >
            <Sparkles className="h-4 w-4 text-[#B8860B]" />
            <span>سلالات الخيول</span>
          </button>
        </div>

        {/* Action Button */}
        {mainMode === "categories" ? (
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#B8860B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t("categories.addNewCategory", "إضافة تصنيف جديد")}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingBreed(null);
              setIsBreedModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#B8860B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#A37508] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة سلالة خيل</span>
          </button>
        )}
      </div>

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {mainMode === "categories" ? (
          <>
            {/* Categories Toolbar */}
            <TableToolbar<FilterTabId>
              searchQuery={categorySearch}
              onSearchChange={(query) => {
                setCategorySearch(query);
                setCategoryPage(1);
              }}
              searchPlaceholder="ابحث في التصنيفات..."
              tabs={filterTabs}
              activeTab={activeCategoryTab}
              onTabChange={(tabId) => {
                setActiveCategoryTab(tabId);
                setCategoryPage(1);
              }}
              showSort={true}
              sortLabel="فرز"
            />

            {/* Categories Grid */}
            {categoriesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
                {Array.from({ length: 8 }).map((_, i) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
                {categories.map((cat) => {
                  const isLivestock = cat.type === "livestock";
                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl border border-[#EDEEF2] bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Top Content */}
                      <div className="text-right">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-[#1E1E2D]">
                            {cat.name}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border shrink-0",
                              isLivestock
                                ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                                : "bg-[#EBF3FC] text-[#2563EB] border-[#BFDBFE]"
                            )}
                          >
                            {cat.typeLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E8E93] line-clamp-2 mb-3">
                          {cat.description || "لا يوجد وصف"}
                        </p>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#F3F4F8]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            title="تعديل"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#10B981] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            title="حذف"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-xs text-[#8E8E93] font-medium">
                          {cat.itemsCount} عنصر
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Categories Pagination */}
            <Pagination
              currentPage={categoryPage}
              totalPages={categoryTotalPages}
              onPageChange={setCategoryPage}
              className="mt-6 border-t border-[#EDEEF2] pt-4"
            />
          </>
        ) : (
          <>
            {/* Breeds Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#EDEEF2]">
              <div className="w-full sm:w-80">
                <input
                  type="text"
                  value={breedSearch}
                  onChange={(e) => {
                    setBreedSearch(e.target.value);
                    setBreedPage(1);
                  }}
                  placeholder="ابحث في سلالات الخيول..."
                  className="w-full rounded-xl border border-[#EDEEF2] bg-[#F8F9FA] px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B8860B] transition-colors"
                />
              </div>
              <div className="text-xs text-[#8E8E93] font-medium">
                إجمالي السلالات: {breeds.length}
              </div>
            </div>

            {/* Breeds Grid */}
            {breedsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl border border-[#EDEEF2] bg-stone-50 animate-pulse p-4"
                  />
                ))}
              </div>
            ) : breeds.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8E8E93]">
                لا توجد سلالات مطابقة
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
                {breeds.map((breed) => (
                  <div
                    key={breed.id}
                    className="rounded-2xl border border-[#EDEEF2] bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF4E6] text-[#B8860B] font-bold text-xs">
                          🐎
                        </div>
                        <h3 className="text-sm font-bold text-[#1E1E2D]">
                          {breed.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#F3F4F8]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBreed(breed);
                            setIsBreedModalOpen(true);
                          }}
                          title="تعديل"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#10B981] hover:bg-[#DCFCE7] transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBreed(breed)}
                          title="حذف"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-xs text-[#8E8E93] font-medium">
                        {breed.horsesCount ?? 0} خيل مسجل
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Breeds Pagination */}
            <Pagination
              currentPage={breedPage}
              totalPages={breedTotalPages}
              onPageChange={setBreedPage}
              className="mt-6 border-t border-[#EDEEF2] pt-4"
            />
          </>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
        loading={actionLoading}
      />

      {/* Add / Edit Breed Modal */}
      <BreedModal
        isOpen={isBreedModalOpen}
        onClose={() => {
          setIsBreedModalOpen(false);
          setEditingBreed(null);
        }}
        onSave={handleSaveBreed}
        breed={editingBreed}
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
