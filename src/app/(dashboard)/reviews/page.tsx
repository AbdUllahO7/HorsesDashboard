"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye } from "lucide-react";
import { reviewsService } from "@/features/reviews/services";
import {
  ComplaintReviewItem,
  ReviewFilterTabItem,
} from "@/features/reviews/types";
import { reviewFilterTabs } from "@/features/reviews/services";
import {
  StatusBadge,
  Pagination,
  ConfirmModal,
  ComplaintDetailsModal,
  ConfirmModalVariant,
  DataTable,
  Column,
  TableToolbar,
} from "@/components";

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function ReviewsAndComplaintsPage() {
  // State
  const [filterTabs, setFilterTabs] = useState<ReviewFilterTabItem[]>(reviewFilterTabs);
  const [reviews, setReviews] = useState<ComplaintReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintReviewItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "danger",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load Filter Tabs from service
  useEffect(() => {
    async function loadMetadata() {
      try {
        const tabsRes = await reviewsService.getFilterTabs();
        if (tabsRes.success && tabsRes.data) {
          setFilterTabs(tabsRes.data);
        }
      } catch (err) {
        console.error("Failed to load tabs metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Load Table Data
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewsService.getReviewsTable({
        page: currentPage,
        limit: 11,
        tab: activeTab as any,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setReviews(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
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

  // Actions
  const handleResolve = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await reviewsService.resolveComplaint(id);
      if (res.success && res.data) {
        setReviews((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "resolved", statusLabel: "تم الحل" } : item))
        );
        if (selectedComplaint && selectedComplaint.id === id) {
          setSelectedComplaint((prev) =>
            prev ? { ...prev, status: "resolved", statusLabel: "تم الحل" } : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to resolve complaint:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد رفض الشكوى",
      description: "هل تريد بالتأكيد رفض هذه الشكوى؟ سيتم تحديث حالة الشكوى في النظام.",
      confirmText: "تأكيد الرفض",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await reviewsService.rejectComplaint(id);
          if (res.success && res.data) {
            setReviews((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "pending", statusLabel: "مرفوضة" } : item
              )
            );
            if (selectedComplaint && selectedComplaint.id === id) {
              setSelectedComplaint((prev) =>
                prev ? { ...prev, status: "pending", statusLabel: "مرفوضة" } : null
              );
            }
          }
        } catch (err) {
          console.error("Failed to reject complaint:", err);
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
      render: (item) => (
        <span className="text-xs font-semibold text-[#333748]">
          {item.typeLabel || (item.type === "complaint" ? "شكوى" : "تقييم")}
        </span>
      ),
    },
    {
      key: "subject",
      header: "الموضوع",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]">
          {item.subject}
        </span>
      ),
    },
    {
      key: "sellerName",
      header: "اسم البائع",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-[#333748]">
          {item.sellerName}
        </span>
      ),
    },
    {
      key: "customerName",
      header: "اسم العميل",
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium text-[#333748]">
          {item.customerName}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.status} customLabel={item.statusLabel} />
      ),
    },
    {
      key: "rating",
      header: "التقييم",
      sortable: true,
      render: (item) =>
        item.rating ? (
          <div className="flex items-center gap-1 font-bold text-xs text-[#1E1E2D]">
            <span>{item.rating}</span>
            <span className="text-[#F59E0B] text-xs">⭐</span>
          </div>
        ) : (
          <span className="text-xs text-[#8E8E93]">-</span>
        ),
    },
    {
      key: "joinedDate",
      header: "تاريخ الانضمام",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-[#4B5563] font-medium" dir="ltr">
          {item.joinedDate}
        </span>
      ),
    },
    {
      key: "actions",
      header: "الاجراءات",
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComplaint(item);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
          title="عرض التفاصيل"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E1E2D]">قائمة الشكاوى والتقييمات</h1>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Table Toolbar */}
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="ابحث هنا"
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
          keyExtractor={(item) => item.id}
          onRowClick={(item) => setSelectedComplaint(item)}
          emptyMessage="لا توجد شكاوى أو تقييمات مطابقة"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        isOpen={Boolean(selectedComplaint)}
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onResolve={handleResolve}
        onReject={handleReject}
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
