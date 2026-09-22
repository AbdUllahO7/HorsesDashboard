"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Package, Tag, Store, Trash2, CheckCircle2, DollarSign } from "lucide-react";
import { listingsService } from "@/features/listings/services";
import { ProductItem } from "@/features/listings/types";
import { useTranslation } from "@/i18n";
import {
  Breadcrumb,
  StatCard,
  Pagination,
  ConfirmModal,
  DataTable,
  Column,
  ProductDetailsModal,
  ConfirmModalVariant,
} from "@/components";

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function ListingsPage() {
  const { t } = useTranslation();

  // State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "danger",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load Products list
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listingsService.getProducts({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setProducts(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalProductsCount(res.data.pagination.totalItems || res.data.items.length);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle Delete Product
  const handleDeleteProduct = (product: ProductItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف المنتج",
      description: `هل أنت متأكد من حذف المنتج "${product.name}"؟ سيتم إزالته نهائياً من المتجر.`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await listingsService.deleteProduct(product.id);
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          setSelectedProduct(null);
        } catch (err) {
          console.error("Failed to delete product:", err);
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Columns definition
  const columns: Column<ProductItem>[] = [
    {
      key: "name",
      header: "اسم المنتج",
      sortable: true,
      align: "right",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-[#EDEEF2] bg-[#FAF4E8]">
            <img
              src={product.images[0] || "/images/placeholder-product.png"}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/100x100/F5F1E8/B59E5F?text=Item";
              }}
            />
          </div>
          <div>
            <span className="font-bold text-[#1E1E2D] block">{product.name}</span>
            {product.breedName && (
              <span className="text-[11px] text-[#8E8E93]">{product.breedName}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "categoryName",
      header: "التصنيف",
      sortable: true,
      align: "right",
      render: (product) => (
        <span className="inline-flex items-center rounded-full bg-[#FAF4E8] text-[#A6883C] px-2.5 py-1 text-xs font-semibold border border-[#EADBBD]">
          {product.categoryName || "مستلزمات"}
        </span>
      ),
    },
    {
      key: "sellerName",
      header: "اسم البائع / المتجر",
      sortable: true,
      align: "right",
      render: (product) => (
        <span className="font-medium text-[#1E1E2D]">{product.sellerName}</span>
      ),
    },
    {
      key: "price",
      header: "السعر",
      sortable: true,
      align: "center",
      render: (product) => (
        <span className="font-bold text-[#10B981]">
          {product.price.toLocaleString()} 
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الإضافة",
      sortable: true,
      align: "center",
      render: (product) => (
        <span className="text-[#8E8E93] text-xs">{product.createdAt}</span>
      ),
    },
    {
      key: "actions",
      header: "الإجراءات",
      align: "center",
      render: (product) => (
        <div
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            title="عرض التفاصيل"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#B8860B] hover:bg-[#F3E7C4] transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(product);
            }}
            title="حذف المنتج"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle="إدارة المنتجات والإعلانات" />

      {/* 2. Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي المنتجات المعروضة"
          value={totalProductsCount || products.length}
          icon={Package}
          variant="gold"
        />
        <StatCard
          title="المنتجات النشطة"
          value={products.filter((p) => p.isActive).length || products.length}
          icon={CheckCircle2}
          variant="gold"
        />
        <StatCard
          title="المتاجر والبائعين"
          value={new Set(products.map((p) => p.sellerName)).size || 12}
          icon={Store}
          variant="gold"
        />
      </div>

      {/* 3. Main Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-[#1E1E2D]">
            قائمة المنتجات المعروضة في المنصة
          </h2>
          <div className="w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث باسم المنتج، البائع، أو التصنيف..."
              className="w-full rounded-xl border border-[#EDEEF2] bg-[#F8F9FA] px-4 py-2.5 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable<ProductItem>
          columns={columns}
          data={products}
          loading={loading}
          onRowClick={(product) => setSelectedProduct(product)}
          keyExtractor={(product) => String(product.id)}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDelete={handleDeleteProduct}
      />

      {/* Confirm Modal */}
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
