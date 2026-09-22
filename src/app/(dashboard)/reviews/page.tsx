"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, HelpCircle, CheckCircle2, Clock, AlertCircle, Trash2, Star } from "lucide-react";
import {
  reviewsService,
  reviewFilterTabs,
  reviewStatCardsConfig,
} from "@/features/reviews/services";
import {
  ComplaintReviewItem,
  ReviewsStats,
  ReviewStatCardItem,
  ReviewFilterTabItem,
} from "@/features/reviews/types";
import {
  StatCard,
  StatusBadge,
  Pagination,
  ConfirmModal,
  ComplaintDetailsModal,
  ConfirmModalVariant,
  DataTable,
  Column,
  TableToolbar,
  Breadcrumb,
} from "@/components";
import { useTranslation } from "@/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
};

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function ReviewsAndComplaintsPage() {
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState<ReviewsStats | null>(null);
  const [filterTabs, setFilterTabs] = useState<ReviewFilterTabItem[]>(reviewFilterTabs);
  const [statCardsConfig, setStatCardsConfig] = useState<ReviewStatCardItem[]>(reviewStatCardsConfig);
  const [reviews, setReviews] = useState<ComplaintReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintReviewItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "danger",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load KPI Stats, Filter Tabs, and Stat Cards from service
  const loadMetadata = useCallback(async () => {
    try {
      const [statsRes, tabsRes, cardsRes] = await Promise.all([
        reviewsService.getReviewsStats(),
        reviewsService.getFilterTabs(),
        reviewsService.getStatCardsConfig(),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (tabsRes.success && tabsRes.data) setFilterTabs(tabsRes.data);
      if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
    } catch (err) {
      console.error("Failed to load reviews metadata:", err);
    }
  }, []);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  // Load Table Data
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewsService.getReviewsTable({
        page: currentPage,
        limit: 10,
        tab: activeTab as any,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setReviews(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, searchQuery]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle Resolve Complaint
  const handleResolve = async (id: string | number) => {
    try {
      setActionLoading(true);
      await reviewsService.resolveComplaint(id);
      setReviews((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "resolved", statusLabel: "تم الحل" } : item
        )
      );
      if (selectedComplaint && selectedComplaint.id === id) {
        setSelectedComplaint((prev) =>
          prev ? { ...prev, status: "resolved", statusLabel: "تم الحل" } : null
        );
      }
      loadMetadata();
    } catch (err) {
      console.error("Failed to resolve complaint:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Complaint
  const handleReject = async (id: string | number) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد رفض الشكوى",
      description: "هل أنت متأكد من رفض هذه الشكوى وإغلاقها؟",
      confirmText: "تأكيد الرفض",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await reviewsService.rejectComplaint(id);
          setReviews((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "rejected", statusLabel: "مرفوضة" } : item
            )
          );
          if (selectedComplaint && selectedComplaint.id === id) {
            setSelectedComplaint((prev) =>
              prev ? { ...prev, status: "rejected", statusLabel: "مرفوضة" } : null
            );
          }
          loadMetadata();
        } catch (err) {
          console.error("Failed to reject complaint:", err);
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Handle Delete Review
  const handleDeleteReview = (id: string | number) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف التقييم",
      description: "هل تريد حذف هذا التقييم بشكل نهائي من المنصة؟",
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await reviewsService.deleteReview(id);
          setReviews((prev) => prev.filter((item) => item.id !== id));
          setSelectedComplaint(null);
        } catch (err) {
          console.error("Failed to delete review:", err);
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Define Table Columns
  const columns: Column<ComplaintReviewItem>[] = [
    {
      key: "typeLabel",
      header: "النوع",
      sortable: true,
      align: "center",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
            item.type === "complaint"
              ? "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]"
              : "bg-[#FAF4E8] text-[#B8860B] border-[#EADBBD]"
          }`}
        >
          {item.typeLabel || (item.type === "complaint" ? "شكوى" : "تقييم")}
        </span>
      ),
    },
    {
      key: "subject",
      header: t("reviews.subject", "الموضوع / العنوان"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]">
          {item.subject}
        </span>
      ),
    },
    {
      key: "sellerName",
      header: t("reviews.merchant", "اسم البائع / المتجر"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">
          {item.sellerStore || item.sellerName}
        </span>
      ),
    },
    {
      key: "customerName",
      header: t("reviews.customer", "اسم العميل"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#4A4E5A]">
          {item.customerName}
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status", "الحالة"),
      sortable: true,
      align: "center",
      render: (item) => (
        <StatusBadge status={item.status} customLabel={item.statusLabel} />
      ),
    },
    {
      key: "rating",
      header: "التقييم",
      sortable: true,
      align: "center",
      render: (item) =>
        item.rating ? (
          <div className="flex items-center justify-center gap-1 font-bold text-xs text-[#1E1E2D] bg-[#FAF4E8] px-2 py-0.5 rounded-lg w-fit mx-auto border border-[#EADBBD]">
            <span>{item.rating}</span>
            <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
        ) : (
          <span className="text-xs text-[#8E8E93]">-</span>
        ),
    },
    {
      key: "joinedDate",
      header: "تاريخ الإرسال",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs text-[#8E8E93] font-medium">
          {item.joinedDate}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions", "الإجراءات"),
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComplaint(item);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#B8860B] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          {item.type === "review" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReview(item.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
              title="حذف التقييم"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle={t("reviews.title", "الشكاوى والتقييمات")} />

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((card) => {
          const IconComponent = iconMap[card.iconName] || HelpCircle;
          const count = stats ? stats[card.countKey] : 0;
          return (
            <StatCard
              key={card.id}
              title={card.label}
              value={count}
              icon={IconComponent}
              loading={!stats}
              variant="gold"
            />
          );
        })}
      </div>

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Card Title */}
        <h2 className="text-lg font-bold text-[#1E1E2D] mb-6">
          {t("reviews.complaintsTitle", "قائمة الشكاوى والتقييمات")}
        </h2>

        {/* Dynamic Table Toolbar */}
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="ابحث بالاسم، المتجر، الموضوع أو الوصف..."
          tabs={filterTabs}
          activeTab={activeTab}
          onTabChange={(tabKey) => {
            setActiveTab(tabKey);
            setCurrentPage(1);
          }}
          showSort={true}
          sortLabel="فرز"
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={reviews}
          loading={loading}
          keyExtractor={(item) => String(item.id)}
          onRowClick={(item) => setSelectedComplaint(item)}
          emptyMessage="لا توجد شكاوى أو تقييمات مطابقة"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        isOpen={Boolean(selectedComplaint)}
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onResolve={handleResolve}
        onReject={handleReject}
        onDeleteReview={handleDeleteReview}
        actionLoading={actionLoading}
      />

      {/* Reusable Confirm Modal */}
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
