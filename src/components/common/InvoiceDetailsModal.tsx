"use client";

import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Invoice, InvoiceItem } from "@/features/invoices/types";
import { DataTable, Column } from "./DataTable";
import { Pagination } from "./Pagination";

export interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (id: string) => void;
}

export function InvoiceDetailsModal({
  invoice,
  isOpen,
  onClose,
  onDownload,
}: InvoiceDetailsModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const columns: Column<InvoiceItem>[] = [
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
        <span className="text-xs font-medium text-[#1E1E2D]" dir="ltr">
          {Number(item.unitPrice).toLocaleString()} 
        </span>
      ),
    },
    {
      key: "totalPrice",
      header: "السعر الاجمالي",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-right shadow-2xl transition-all duration-300"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDEEF2]">
          {/* Header: تفاصيل الفاتورة  السعر الإجمالي : 50000 */}
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-[#1E1E2D]">
              تفاصيل الفاتورة
            </h2>
            <div className="text-base sm:text-lg font-bold text-[#A6883C] flex items-center gap-1">
              <span>السعر الإجمالي :</span>
              <span className="font-extrabold" dir="ltr">
                {Number(invoice.totalAmount).toLocaleString()} 
              </span>
            </div>
            {invoice.serialNumber && (
              <span className="text-xs bg-[#FAF4E6] text-[#A6883C] px-2.5 py-1 rounded-full font-bold">
                {invoice.serialNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(invoice.id)}
                className="flex items-center gap-1.5 rounded-lg border border-[#EDEEF2] px-3 py-1.5 text-xs font-bold text-[#333748] hover:bg-[#F9FAFB] hover:text-[#1E1E2D] transition-colors cursor-pointer"
                title="تحميل الفاتورة"
              >
                <Download className="h-4 w-4 text-[#333748]" />
                <span className="hidden sm:inline">تحميل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1E1E2D] transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto flex-1 my-4">
          <DataTable
            columns={columns}
            data={invoice.items || []}
            loading={false}
            keyExtractor={(item) => item.id}
            emptyMessage="لا توجد منتجات في هذه الفاتورة"
          />
        </div>

        {/* Modal Footer / Pagination */}
        <div className="pt-3 border-t border-[#EDEEF2]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
