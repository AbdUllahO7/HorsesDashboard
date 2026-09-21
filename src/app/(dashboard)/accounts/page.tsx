"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Check, X, Award } from "lucide-react";
import { accountsService } from "@/features/accounts/services";
import { UserAccountItem } from "@/features/accounts/types";
import {
  Breadcrumb,
  TableToolbar,
  DataTable,
  Column,
  Pagination,
  ApproveAccountModal,
  RejectAccountModal,
  DocumentPreviewModal,
} from "@/components";
import { useTranslation } from "@/i18n";

interface PreviewDocState {
  isOpen: boolean;
  title: string;
  url?: string;
  userName?: string;
}

export default function UserAccountsReviewPage() {
  const { t } = useTranslation();

  // State
  const [accounts, setAccounts] = useState<UserAccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

  // Modals state
  const [approvingAccount, setApprovingAccount] = useState<UserAccountItem | null>(null);
  const [rejectingAccount, setRejectingAccount] = useState<UserAccountItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocState>({
    isOpen: false,
    title: "",
  });

  // Load Accounts Data
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await accountsService.getAccounts({
        page: currentPage,
        limit: 11,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setAccounts(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Handle Approve
  const handleApproveConfirm = async () => {
    if (!approvingAccount) return;
    try {
      setActionLoading(true);
      const res = await accountsService.approveAccount(approvingAccount.id);
      if (res.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== approvingAccount.id));
      }
    } catch (err) {
      console.error("Failed to approve account:", err);
    } finally {
      setActionLoading(false);
      setApprovingAccount(null);
    }
  };

  // Handle Reject
  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingAccount) return;
    try {
      setActionLoading(true);
      const res = await accountsService.rejectAccount(rejectingAccount.id, reason);
      if (res.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== rejectingAccount.id));
      }
    } catch (err) {
      console.error("Failed to reject account:", err);
    } finally {
      setActionLoading(false);
      setRejectingAccount(null);
    }
  };

  // Columns Configuration
  const columns: Column<UserAccountItem>[] = [
    {
      key: "name",
      header: t("userAccounts.userName", "اسم المستخدم"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-bold text-[#1E1E2D]">{item.name}</span>
      ),
    },
    {
      key: "phone",
      header: t("userAccounts.phone", "رقم الهاتف"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]" dir="ltr">
          {item.phone}
        </span>
      ),
    },
    {
      key: "email",
      header: t("userAccounts.email", "البريد الالكتروني"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-medium text-[#333748]">{item.email}</span>
      ),
    },
    {
      key: "idFrontUrl",
      header: "الوجه الامامي للهوية",
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewDoc({
              isOpen: true,
              title: "الوجه الأمامي للهوية",
              url: item.idFrontUrl,
              userName: item.name,
            });
          }}
          title="معاينة الوجه الأمامي للهوية"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
    {
      key: "idBackUrl",
      header: "الوجه الخلفي للهوية",
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewDoc({
              isOpen: true,
              title: "الوجه الخلفي للهوية",
              url: item.idBackUrl,
              userName: item.name,
            });
          }}
          title="معاينة الوجه الخلفي للهوية"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
    {
      key: "selfieWithIdUrl",
      header: "صورة مع هوية",
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewDoc({
              isOpen: true,
              title: "صورة شخصية مع الهوية",
              url: item.selfieWithIdUrl,
              userName: item.name,
            });
          }}
          title="معاينة صورة مع الهوية"
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
          {/* Approve Action */}
          <button
            type="button"
            onClick={() => setApprovingAccount(item)}
            title="قبول المستخدم"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#10B981] text-[#10B981] hover:bg-[#E8F8F0] transition-colors cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          {/* Preview / Badge Action */}
          <button
            type="button"
            onClick={() =>
              setPreviewDoc({
                isOpen: true,
                title: "ملف وثائق المستخدم",
                url: item.idFrontUrl,
                userName: item.name,
              })
            }
            title="معاينة الوثائق"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer"
          >
            <Award className="h-3.5 w-3.5" />
          </button>

          {/* Reject Action */}
          <button
            type="button"
            onClick={() => setRejectingAccount(item)}
            title="رفض المستخدم"
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
      <Breadcrumb pageTitle={t("userAccounts.title", "حسابات المستخدمين")} />

      {/* 2. Page Header Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E1E2D]">
          {t("userAccounts.listTitle", "قائمة طلبات الحسابات")}
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
          data={accounts}
          loading={loading}
          keyExtractor={(item) => item.id}
          emptyMessage="لا توجد حسابات قيد المراجعة حالياً"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Approve Account Modal (Image 2) */}
      <ApproveAccountModal
        isOpen={Boolean(approvingAccount)}
        onClose={() => setApprovingAccount(null)}
        onConfirm={handleApproveConfirm}
        loading={actionLoading}
      />

      {/* Reject Account Modal with Reason (Image 3) */}
      <RejectAccountModal
        isOpen={Boolean(rejectingAccount)}
        onClose={() => setRejectingAccount(null)}
        onConfirm={handleRejectConfirm}
        loading={actionLoading}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDoc.isOpen}
        title={previewDoc.title}
        imageUrl={previewDoc.url}
        userName={previewDoc.userName}
        onClose={() => setPreviewDoc((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
