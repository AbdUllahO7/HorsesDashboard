"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Check, X, ShieldAlert } from "lucide-react";
import { reportsService } from "@/features/reports/services";
import { ReportTicketItem } from "@/features/reports/types";
import {
  Breadcrumb,
  TableToolbar,
  DataTable,
  Column,
  Pagination,
  ConfirmModal,
  ReportDetailsModal,
  ConfirmModalVariant,
} from "@/components";
import { useTranslation } from "@/i18n";

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function ReportsAndTicketsPage() {
  const { t } = useTranslation();

  // State
  const [reports, setReports] = useState<ReportTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [selectedReport, setSelectedReport] = useState<ReportTicketItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "gold",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Reports Data
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportsService.getReports({
        page: currentPage,
        limit: 10,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setReports(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Handle Accept / Resolve Report
  const handleResolveReport = (report: ReportTicketItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "gold",
      title: "تأكيد قبول البلاغ",
      description: `هل أنت متأكد من قبول البلاغ المقدم ضد (${report.reportedUserName}) واتخاذ الإجراء المناسب؟`,
      confirmText: "قبول البلاغ",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await reportsService.resolveReport(report);
          if (res.success) {
            setReports((prev) => prev.filter((r) => r.id !== report.id));
            if (selectedReport?.id === report.id) setSelectedReport(null);
            showToast(res.message || "تم قبول البلاغ بنجاح", "success");
          } else {
            showToast(res.message || "فشل قبول البلاغ", "error");
            setErrorMessage(res.message || "فشل قبول البلاغ");
          }
        } catch (err: unknown) {
          console.error("Failed to resolve report:", err);
          const e = err as { message?: string };
          const msg = e?.message || "حدث خطأ أثناء تنفيذ الإجراء";
          showToast(msg, "error");
          setErrorMessage(msg);
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Handle Dismiss / Reject Report
  const handleDismissReport = (report: ReportTicketItem) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد رفض البلاغ",
      description: `هل أنت متأكد من رفض وتجاهل هذا البلاغ المقدم من (${report.reporterName})؟`,
      confirmText: "رفض البلاغ",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await reportsService.dismissReport(report);
          if (res.success) {
            setReports((prev) => prev.filter((r) => r.id !== report.id));
            if (selectedReport?.id === report.id) setSelectedReport(null);
            showToast(res.message || "تم رفض البلاغ بنجاح", "success");
          } else {
            showToast(res.message || "فشل رفض البلاغ", "error");
            setErrorMessage(res.message || "فشل رفض البلاغ");
          }
        } catch (err: unknown) {
          console.error("Failed to dismiss report:", err);
          const e = err as { message?: string };
          const msg = e?.message || "حدث خطأ أثناء تنفيذ الإجراء";
          showToast(msg, "error");
          setErrorMessage(msg);
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Columns Configuration
  const columns: Column<ReportTicketItem>[] = [
    {
      key: "reporterName",
      header: t("tickets.reporter", "مقدم البلاغ"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.reporterName}</span>
      ),
    },
    {
      key: "reportedUserName",
      header: t("tickets.reportedUser", "المبلغ عليه"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.reportedUserName}</span>
      ),
    },
    {
      key: "reason",
      header: t("tickets.reason", "سبب البلاغ"),
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReport(item);
          }}
          title="معاينة سبب البلاغ"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
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
          {/* Resolve / Accept Action */}
          <button
            type="button"
            onClick={() => handleResolveReport(item)}
            title="قبول البلاغ"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#10B981] text-[#10B981] hover:bg-[#E8F8F0] transition-colors cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          {/* Dismiss / Reject Action */}
          <button
            type="button"
            onClick={() => handleDismissReport(item)}
            title="رفض البلاغ"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle={t("tickets.title", "البلاغات")} />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg animate-fade-in flex items-center gap-2 ${
            toast.type === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          ) : (
            <ShieldAlert className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

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

      {/* 2. Page Header Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E1E2D]">
          {t("tickets.listTitle", "قائمة البلاغات")}
        </h1>
      </div>

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Dynamic Toolbar */}
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          searchPlaceholder="ابحث هنا"
          showSort={true}
          sortLabel="فرز"
        />

        {/* Dynamic Data Table */}
        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          onRowClick={(item) => setSelectedReport(item)}
          keyExtractor={(item) => String(item.id)}
          emptyMessage="لا توجد بلاغات حالياً"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Report Details Modal */}
      <ReportDetailsModal
        isOpen={Boolean(selectedReport)}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onResolve={(rep) => {
          setSelectedReport(null);
          handleResolveReport(rep);
        }}
        onDismiss={(rep) => {
          setSelectedReport(null);
          handleDismissReport(rep);
        }}
        loading={actionLoading}
      />

      {/* Confirm Action Modal */}
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
