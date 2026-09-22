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
} from "lucide-react";
import { invoicesService } from "@/features/invoices/services";
import { Invoice, InvoiceItem, PaymentStatus } from "@/features/invoices/types";
import {
  Breadcrumb,
  DataTable,
  Column,
  Pagination,
  InvoiceDetailsModal,
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
    fetchInvoices(currentPage, searchTerm, statusFilter);
  }, [fetchInvoices, currentPage, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoices(1, searchTerm, statusFilter);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
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
      render: (item) => (
        <div className="text-right">
          <p className="text-xs font-semibold text-[#1E1E2D]">{item.customerName || "—"}</p>
          {item.customerPhone && (
            <p className="text-[11px] text-[#8E8E93]" dir="ltr">
              {item.customerPhone}
            </p>
          )}
        </div>
      ),
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
    </div>
  );
}
