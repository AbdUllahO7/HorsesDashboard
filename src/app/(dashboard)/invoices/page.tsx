"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Download, ArrowRight } from "lucide-react";
import { invoicesService } from "@/features/invoices/services";
import { Invoice, InvoiceItem } from "@/features/invoices/types";
import {
  Breadcrumb,
  DataTable,
  Column,
  Pagination,
  InvoiceDetailsModal,
} from "@/components";

export default function InvoicesPage() {
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Fetch invoices from service
  const fetchInvoices = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await invoicesService.getInvoices({ page, limit: 10 });
      if (res.success && res.data) {
        setInvoices(res.data.items);
        setTotalPages(res.data.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [fetchInvoices, currentPage]);

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
    }
  };

  // Columns for List View Table (Image 1)
  const listColumns: Column<Invoice>[] = [
    {
      key: "serialNumber",
      header: "الرقم التسلسلي",
      sortable: true,
      align: "right",
      render: (item) => (
        <button
          onClick={() => handleViewDetails(item, "inline")}
          className="text-xs font-semibold text-[#1E1E2D] hover:text-[#A6883C] transition-colors cursor-pointer text-right"
        >
          {item.serialNumber}
        </button>
      ),
    },
    {
      key: "actions",
      header: "الاجراءات",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center gap-3">
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

  // Columns for Details View Table (Image 2)
  const detailsColumns: Column<InvoiceItem>[] = [
    {
      key: "productName",
      header: "اسم المنتج",
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-semibold text-[#1E1E2D]">{item.productName}</span>
      ),
    },
    {
      key: "quantity",
      header: "العدد",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.quantity}</span>
      ),
    },
    {
      key: "unitPrice",
      header: "السعر الافرادي",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.unitPrice}</span>
      ),
    },
    {
      key: "totalPrice",
      header: "السعر الاجمالي",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]">{item.totalPrice}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb */}
      {viewMode === "list" ? (
        <Breadcrumb pageTitle="الفواتير" />
      ) : (
        <Breadcrumb
          items={[
            { label: "الفواتير", href: "/invoices" },
            { label: `تفاصيل الفاتورة ${selectedInvoice?.serialNumber || ""}` },
          ]}
        />
      )}

      {/* Toast Notification for Download */}
      {downloadSuccessMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#10B981] px-5 py-3 text-xs font-bold text-white shadow-lg animate-fade-in">
          {downloadSuccessMsg}
        </div>
      )}

      {/* VIEW MODE 1: Invoices List View (Matching Image 1) */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#1E1E2D]">الفواتير</h1>
          </div>

          {/* Main Card Container */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
            <div className="min-h-[360px]">
              <DataTable
                columns={listColumns}
                data={invoices}
                loading={loading}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => handleViewDetails(item, "inline")}
                emptyMessage="لا توجد فواتير حالياً"
              />
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6 border-t border-[#EDEEF2] pt-4"
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Invoice Details View (Matching Image 2) */}
      {viewMode === "details" && selectedInvoice && (
        <div className="space-y-6">
          {/* Details Card Container Matching Image 2 */}
          <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
            {/* Header: تفاصيل الفاتورة السعر الإجمالي :50000 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#EDEEF2] gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-[#1E1E2D]">
                  تفاصيل الفاتورة
                </h1>
                <div className="text-base sm:text-lg font-bold text-[#A6883C]">
                  <span>السعر الإجمالي :</span>
                  <span className="font-extrabold">{selectedInvoice.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons: Download & Back to Invoices List */}
              <div className="flex items-center gap-2">
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

            {/* Invoice Items Table */}
            <div className="min-h-[360px] my-4">
              <DataTable
                columns={detailsColumns}
                data={selectedInvoice.items || []}
                loading={false}
                keyExtractor={(item) => item.id}
                emptyMessage="لا توجد منتجات مسجلة في هذه الفاتورة"
              />
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6 border-t border-[#EDEEF2] pt-4"
            />
          </div>
        </div>
      )}

      {/* Modal View for Invoice Details (Optional quick preview modal) */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  );
}
