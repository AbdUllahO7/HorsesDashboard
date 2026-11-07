"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Download,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Printer,
  CreditCard,
  User,
  Store,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { invoicesService } from "@/features/invoices/services";
import {
  Invoice,
  InvoiceItem,
  PaymentStatus,
  PaymentRequiringReviewItem,
} from "@/features/invoices/types";
import {
  Breadcrumb,
  DataTable,
  Column,
  Pagination,
  InvoiceDetailsModal,
  ResolvePaymentReviewModal,
} from "@/components";
import { useTranslation } from "@/i18n";
import { cn } from "@/core/utils/cn";

export default function InvoicesPage() {
  const { t } = useTranslation();

  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payments Requiring Review State
  const [activeTab, setActiveTab] = useState<"invoices" | "review">("invoices");
  const [reviewPayments, setReviewPayments] = useState<PaymentRequiringReviewItem[]>([]);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewTotalCount, setReviewTotalCount] = useState<number>(0);
  const [reviewPage, setReviewPage] = useState<number>(1);
  const [reviewTotalPages, setReviewTotalPages] = useState<number>(1);
  const [selectedReviewPayment, setSelectedReviewPayment] = useState<PaymentRequiringReviewItem | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch payments requiring review from service
  const fetchReviewPayments = useCallback(async (page: number = 1, search: string = "") => {
    try {
      setReviewLoading(true);
      const res = await invoicesService.getPaymentsRequiringReview({
        page,
        limit: 10,
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setReviewPayments(res.data.items);
        setReviewTotalCount(res.data.total);
        setReviewTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch payments requiring review:", err);
    } finally {
      setReviewLoading(false);
    }
  }, []);

  // Fetch invoices from service
  const fetchInvoices = useCallback(async (page: number = 1, search: string = "", status: string = "all") => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await invoicesService.getInvoices({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
      });

      if (res.success && res.data) {
        setInvoices(res.data.items);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || res.data.items.length);
      } else {
        setErrorMessage(res.message || "حدث خطأ أثناء تحميل الفواتير");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch invoices:", err);
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء تحميل الفواتير";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  console.log("invoices",invoices)

  useEffect(() => {
    if (activeTab === "review") {
      fetchReviewPayments(reviewPage, searchTerm);
    } else {
      fetchInvoices(currentPage, searchTerm, statusFilter);
    }
  }, [activeTab, fetchInvoices, currentPage, statusFilter, fetchReviewPayments, reviewPage]);

  // Load initial review count on mount
  useEffect(() => {
    fetchReviewPayments(1, "");
  }, [fetchReviewPayments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "review") {
      setReviewPage(1);
      fetchReviewPayments(1, searchTerm);
    } else {
      setCurrentPage(1);
      fetchInvoices(1, searchTerm, statusFilter);
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleResolvePayment = async (
    paymentId: string | number,
    action: string,
    notes?: string
  ) => {
    try {
      setActionLoading(true);
      const res = await invoicesService.resolvePaymentReview({
        paymentId,
        action,
        notes,
      });
      if (res.success) {
        setDownloadSuccessMsg(res.message || "تمت معالجة الدفعة بنجاح");
        setTimeout(() => setDownloadSuccessMsg(null), 4000);
        await fetchReviewPayments(reviewPage, searchTerm);
        await fetchInvoices(currentPage, searchTerm, statusFilter);
      } else {
        setErrorMessage(res.message || "فشل في معالجة الدفعة");
        if (res.message?.includes("409") || res.message?.includes("تعارض")) {
          await fetchReviewPayments(reviewPage, searchTerm);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to resolve payment:", err);
      const msg = err instanceof Error ? err.message : "فشل في معالجة الدفعة";
      setErrorMessage(msg);
      await fetchReviewPayments(reviewPage, searchTerm);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers
  const handleViewDetails = (invoice: Invoice, mode: "inline" | "modal" = "inline") => {
    setSelectedInvoice(invoice);
    if (mode === "modal") {
      setModalOpen(true);
    } else {
      setViewMode("details");
    }
  };

  const handleDownload = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await invoicesService.downloadInvoice(id);
      if (res.success && res.data) {
        setDownloadSuccessMsg(`تم تحميل ${res.data.fileName} بنجاح`);
        setTimeout(() => setDownloadSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error("Failed to download invoice:", err);
      setErrorMessage("حدث خطأ أثناء تحميل ملف الفاتورة");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const renderStatusBadge = (status: PaymentStatus, label?: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#10B981] border border-[#B9ECCE]">
            <CheckCircle2 className="w-3 h-3" />
            {label || "مدفوعة"}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF9EB] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3 h-3" />
            {label || "قيد الانتظار"}
          </span>
        );
      case "cancelled":
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
            <XCircle className="w-3 h-3" />
            {label || (status === "cancelled" ? "ملغية" : "فشلت")}
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            {label || "مسترجعة"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD]">
            {label || "مدفوعة"}
          </span>
        );
    }
  };

  // Columns for List View Table
  const listColumns: Column<Invoice>[] = [
    {
      key: "serialNumber",
      header: t("invoices.serialNumber", "الرقم التسلسلي"),
      sortable: true,
      align: "right",
      render: (item) => (
        <button
          onClick={() => handleViewDetails(item, "inline")}
          className="text-xs font-bold text-[#A6883C] hover:underline transition-all cursor-pointer text-right flex items-center gap-1.5"
        >
          <span>{item.serialNumber}</span>
          {item.transactionId && (
            <span className="text-[10px] text-[#8E8E93] font-normal">({item.transactionId})</span>
          )}
        </button>
      ),
    },
    {
      key: "customerName",
      header: "العميل",
      sortable: true,
      align: "right",
      render: (item) => {
        const isPhone = (val?: string) => Boolean(val && (val.startsWith("+") || /^[0-9\s\-+()]{7,}$/.test(val.trim())));
        const name = isPhone(item.customerName) ? "مستخدم المنصة" : (item.customerName || "—");
        const phone = item.customerPhone || (isPhone(item.customerName) ? item.customerName : null);
        return (
          <div className="text-right">
            <p className="text-xs font-semibold text-[#1E1E2D]">{name}</p>
            {phone && (
              <p className="text-[11px] text-[#8E8E93]" dir="ltr">
                {phone}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "sellerName",
      header: "التاجر / المتجر",
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs text-[#333748] font-medium">{item.sellerName || "—"}</span>
      ),
    },
    {
      key: "paymentMethod",
      header: "طريقة الدفع",
      align: "center",
      render: (item) => (
        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#EDEEF2] text-[#333748] font-medium">
          {item.paymentMethodLabel || item.paymentMethod || "مدى"}
        </span>
      ),
    },
    {
      key: "totalAmount",
      header: "المبلغ الإجمالي",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]" dir="ltr">
          {Number(item.totalAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      align: "center",
      render: (item) => renderStatusBadge(item.status, item.statusLabel),
    },
    {
      key: "createdAt",
      header: "التاريخ",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs text-[#8E8E93]">{item.createdAt || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions", "الاجراءات"),
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(item, "inline");
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A6883C] hover:bg-[#FAF4E6] transition-colors cursor-pointer"
            title="عرض تفاصيل الفاتورة"
            aria-label="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => handleDownload(item.id, e)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#333748] hover:bg-[#F3F4F8] transition-colors cursor-pointer"
            title="تحميل الفاتورة"
            aria-label="تحميل الفاتورة"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Columns for Payments Requiring Review
  const reviewColumns: Column<PaymentRequiringReviewItem>[] = [
    {
      key: "paymentId",
      header: "رقم الدفعة",
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="font-mono text-xs font-bold text-[#A6883C] bg-[#FAF4E6] border border-[#EADBBD] px-2.5 py-1 rounded-lg">
          #{item.paymentId}
        </span>
      ),
    },
    {
      key: "customerName",
      header: "العميل",
      align: "right",
      render: (item) => (
        <div>
          <span className="text-xs font-semibold text-[#1E1E2D] block">{item.customerName}</span>
          {item.customerPhone && (
            <span className="text-[11px] text-[#8E8E93] font-mono" dir="ltr">
              {item.customerPhone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "المبلغ",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]" dir="ltr">
          {Number(item.amount).toLocaleString()} {item.currency || "KWD"}
        </span>
      ),
    },
    {
      key: "gateway",
      header: "بوابة الدفع",
      align: "center",
      render: (item) => (
        <span className="text-xs font-medium text-[#4B5563] bg-[#F3F4F6] px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
          {item.gateway || "UPayments"}
        </span>
      ),
    },
    {
      key: "reason",
      header: "سبب المراجعة",
      align: "right",
      render: (item) => (
        <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-lg">
          {item.reason}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الإنشاء",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs text-[#8E8E93]">
          {item.createdAt ? (item.createdAt.includes("T") ? item.createdAt.replace("T", " ").substring(0, 16) : item.createdAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "معالجة الدفعة",
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReviewPayment(item);
            setResolveModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A6883C] hover:bg-[#8F7432] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>اتخاذ قرار</span>
        </button>
      ),
    },
  ];

  // Columns for Details View Table
  const detailsColumns: Column<InvoiceItem>[] = [
    {
      key: "productName",
      header: t("invoices.productName", "اسم المنتج"),
      sortable: true,
      align: "right",
      render: (item) => (
        <div className="text-right">
          <span className="text-xs font-semibold text-[#1E1E2D]">{item.productName}</span>
          {item.notes && <p className="text-[10px] text-[#8E8E93]">{item.notes}</p>}
        </div>
      ),
    },
    {
      key: "quantity",
      header: t("invoices.quantity", "العدد"),
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.quantity}</span>
      ),
    },
    {
      key: "unitPrice",
      header: t("invoices.unitPrice", "السعر الافرادي"),
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]" dir="ltr">
          {Number(item.unitPrice).toLocaleString()}
        </span>
      ),
    },
    {
      key: "totalPrice",
      header: t("invoices.totalPrice", "السعر الاجمالي"),
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-[#A6883C]" dir="ltr">
          {Number(item.totalPrice).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb */}
      {viewMode === "list" ? (
        <Breadcrumb pageTitle={t("invoices.title", "الفواتير وعمليات الدفع")} />
      ) : (
        <Breadcrumb
          items={[
            { label: t("invoices.title", "الفواتير"), href: "/invoices" },
            { label: `${t("invoices.invoiceDetails", "تفاصيل الفاتورة")} ${selectedInvoice?.serialNumber || ""}` },
          ]}
        />
      )}

      {/* Toast Notification for Download */}
      {downloadSuccessMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#10B981] px-5 py-3 text-xs font-bold text-white shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="font-semibold">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="mr-auto text-xs text-red-500 hover:underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* VIEW MODE 1: Invoices List View */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Main Section Navigation Switcher */}
          <div className="flex items-center gap-2 border-b border-[#EDEEF2] pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("invoices")}
              className={cn(
                "flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer",
                activeTab === "invoices"
                  ? "border-[#A6883C] text-[#A6883C]"
                  : "border-transparent text-[#6B7280] hover:text-[#1E1E2D]"
              )}
            >
              <Receipt className="w-4 h-4" />
              <span>سجل الفواتير وعمليات الدفع</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD]">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("review");
                fetchReviewPayments(1, searchTerm);
              }}
              className={cn(
                "flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer",
                activeTab === "review"
                  ? "border-[#D97706] text-[#D97706]"
                  : "border-transparent text-[#6B7280] hover:text-[#1E1E2D]"
              )}
            >
              <ShieldAlert className="w-4 h-4 text-[#D97706]" />
              <span>دفعات تحتاج مراجعة</span>
              {reviewTotalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700 font-bold animate-pulse">
                  {reviewTotalCount}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: ALL INVOICES */}
          {activeTab === "invoices" && (
            <>
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#1E1E2D]">الفواتير وسجل عمليات الدفع</h1>
                  <p className="text-xs text-[#8E8E93] mt-1">
                    إجمالي الفواتير المسجلة: {Number(totalCount).toLocaleString()} فاتورة
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F5F6FA] rounded-xl border border-[#EDEEF2] overflow-x-auto">
                  {[
                    { id: "all", label: "الكل" },
                    { id: "paid", label: "مدفوعة" },
                    { id: "pending", label: "قيد الانتظار" },
                    { id: "cancelled", label: "ملغية" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleStatusChange(tab.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                        statusFilter === tab.id
                          ? "bg-[#A6883C] text-white shadow-2xs"
                          : "text-[#6B7280] hover:text-[#1E1E2D] hover:bg-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث برقم الفاتورة، اسم العميل، التاجر..."
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white py-2.5 pr-10 pl-4 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#A6883C] focus:ring-1 focus:ring-[#A6883C] transition-all shadow-2xs"
                />
                <Search className="absolute right-3.5 top-3 h-4 w-4 text-[#8E8E93]" />
              </form>

              {/* Main Card Container */}
              <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
                <div className="min-h-[360px]">
                  <DataTable
                    columns={listColumns}
                    data={invoices}
                    loading={loading}
                    keyExtractor={(item) => item.id}
                    onRowClick={(item) => handleViewDetails(item, "inline")}
                    emptyMessage="لا توجد فواتير مطابقة للبحث حالياً"
                  />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="mt-6 border-t border-[#EDEEF2] pt-4"
                  />
                )}
              </div>
            </>
          )}

          {/* TAB 2: PAYMENTS REQUIRING REVIEW */}
          {activeTab === "review" && (
            <>
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#1E1E2D]">دفعات تحتاج مراجعة إدارية</h1>
                  <p className="text-xs text-[#8E8E93] mt-1">
                    مراجعة العمليات العالقة وتأخر ردود KNET لاتخاذ قرار الاعتماد أو الرفض أو الاسترجاع
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchReviewPayments(reviewPage, searchTerm)}
                  disabled={reviewLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDEEF2] bg-white text-xs font-bold text-[#A6883C] hover:bg-[#FAF4E6] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", reviewLoading && "animate-spin")} />
                  <span>تحديث القائمة</span>
                </button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث برقم الدفعة، اسم العميل..."
                  className="w-full rounded-xl border border-[#EDEEF2] bg-white py-2.5 pr-10 pl-4 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all shadow-2xs"
                />
                <Search className="absolute right-3.5 top-3 h-4 w-4 text-[#8E8E93]" />
              </form>

              {/* Review Table Card */}
              <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
                <div className="min-h-[360px]">
                  <DataTable
                    columns={reviewColumns}
                    data={reviewPayments}
                    loading={reviewLoading}
                    keyExtractor={(item) => String(item.id)}
                    emptyMessage="لا توجد أي دفعات معلقة تحتاج إلى مراجعة حالياً"
                  />
                </div>

                {/* Pagination */}
                {reviewTotalPages > 1 && (
                  <Pagination
                    currentPage={reviewPage}
                    totalPages={reviewTotalPages}
                    onPageChange={(p) => {
                      setReviewPage(p);
                      fetchReviewPayments(p, searchTerm);
                    }}
                    className="mt-6 border-t border-[#EDEEF2] pt-4"
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Invoice Details View */}
      {viewMode === "details" && selectedInvoice && (
        <div className="space-y-6">
          {/* Details Card Container */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            {/* Header: تفاصيل الفاتورة السعر الإجمالي : 50000 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-[#EDEEF2] gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-[#1E1E2D]">
                  تفاصيل الفاتورة
                </h1>
                <div className="text-base sm:text-lg font-bold text-[#A6883C] flex items-center gap-1.5">
                  <span>السعر الإجمالي :</span>
                  <span className="font-extrabold" dir="ltr">
                    {Number(selectedInvoice.totalAmount).toLocaleString()}
                  </span>
                </div>
                {renderStatusBadge(selectedInvoice.status, selectedInvoice.statusLabel)}
              </div>

              {/* Action Buttons: Print, Download & Back */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2 text-xs font-bold text-[#333748] hover:bg-[#F9FAFB] transition-colors cursor-pointer shadow-2xs"
                  title="طباعة الفاتورة"
                >
                  <Printer className="h-4 w-4 text-[#333748]" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>

                <button
                  onClick={() => handleDownload(selectedInvoice.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#EDEEF2] bg-white px-3.5 py-2 text-xs font-bold text-[#333748] hover:bg-[#F9FAFB] transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="h-4 w-4 text-[#333748]" />
                  <span>تحميل الفاتورة</span>
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-1.5 rounded-xl border border-[#A6883C] bg-[#FAF4E6] px-3.5 py-2 text-xs font-bold text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer shadow-2xs"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>العودة إلى الفواتير</span>
                </button>
              </div>
            </div>

            {/* Metadata Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8E8E93]">اسم العميل</p>
                  <p className="text-xs font-bold text-[#1E1E2D]">{selectedInvoice.customerName || "—"}</p>
                  {selectedInvoice.customerPhone && (
                    <p className="text-[10px] text-[#8E8E93]" dir="ltr">{selectedInvoice.customerPhone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8E8E93]">التاجر / المتجر</p>
                  <p className="text-xs font-bold text-[#1E1E2D]">{selectedInvoice.sellerName || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8E8E93]">طريقة الدفع</p>
                  <p className="text-xs font-bold text-[#1E1E2D]">
                    {selectedInvoice.paymentMethodLabel || selectedInvoice.paymentMethod || "مدى"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8E8E93]">تاريخ الإنشاء</p>
                  <p className="text-xs font-bold text-[#1E1E2D]">{selectedInvoice.createdAt || "—"}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1E1E2D]">المنتجات المسجلة في الفاتورة</h3>
              <div className="min-h-[220px]">
                <DataTable
                  columns={detailsColumns}
                  data={selectedInvoice.items || []}
                  loading={false}
                  keyExtractor={(item) => item.id}
                  emptyMessage="لا توجد منتجات مسجلة في هذه الفاتورة"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="flex justify-end pt-4 border-t border-[#EDEEF2]">
              <div className="w-full sm:w-72 space-y-2 p-4 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2] text-xs">
                <div className="flex justify-between text-[#6B7280]">
                  <span>عدد العناصر:</span>
                  <span className="font-bold text-[#1E1E2D]">{selectedInvoice.itemsCount}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>المبلغ الفرعي:</span>
                  <span className="font-bold text-[#1E1E2D]" dir="ltr">
                    {Number(selectedInvoice.totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>ضريبة القيمة المضافة (15% شاملة):</span>
                  <span className="font-bold text-[#1E1E2D]" dir="ltr">
                    {Number(selectedInvoice.totalAmount * 0.15).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#A6883C] pt-2 border-t border-[#EDEEF2]">
                  <span>الإجمالي النهائي:</span>
                  <span dir="ltr">{Number(selectedInvoice.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal View for Invoice Details */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
      />

      {/* Modal for Resolving Payments Requiring Review */}
      <ResolvePaymentReviewModal
        isOpen={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setSelectedReviewPayment(null);
        }}
        payment={selectedReviewPayment}
        onConfirm={handleResolvePayment}
        loading={actionLoading}
      />
    </div>
  );
}
