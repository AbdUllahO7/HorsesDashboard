"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Check,
  X,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Download,
} from "lucide-react";
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
import { cn } from "@/core/utils/cn";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [approvingAccount, setApprovingAccount] = useState<UserAccountItem | null>(null);
  const [rejectingAccount, setRejectingAccount] = useState<UserAccountItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocState>({
    isOpen: false,
    title: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      setSuccessMessage(msg);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Load Accounts Data
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await accountsService.getAccounts({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });

      if (res.success && res.data) {
        setAccounts(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err: unknown) {
      console.error("Failed to load accounts:", err);
      const e = err as { message?: string };
      setErrorMessage(e?.message || "فشل تحميل طلبات توثيق الحسابات");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedStatus]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Handle Approve
  const handleApproveConfirm = async () => {
    if (!approvingAccount) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await accountsService.approveAccount(approvingAccount.id);
      if (res.success) {
        showToast(res.message || "تم قبول وتفعيل حساب المستخدم بنجاح", "success");
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === approvingAccount.id ? { ...a, status: "approved" } : a
          )
        );
      } else {
        const msg = res.message || "فشل في اعتماد التوثيق";
        showToast(msg, "error");
        // If conflict (409) or already updated, reload to reflect reality
        if (msg.includes("409") || msg.includes("تعارض") || msg.includes("مسبق") || msg.includes("already") || msg.includes("معتمد")) {
          loadAccounts();
        }
      }
    } catch (err: unknown) {
      console.error("Failed to approve account:", err);
      const e = err as { message?: string };
      const msg = e?.message || "فشل في اعتماد التوثيق";
      showToast(msg, "error");
      loadAccounts();
    } finally {
      setActionLoading(false);
      setApprovingAccount(null);
    }
  };

  // Handle Reject or Request Amendment
  const handleRejectConfirm = async (reason: string, actionType: "amendment" | "reject" = "reject") => {
    if (!rejectingAccount) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const res = await accountsService.rejectAccount(rejectingAccount.id, reason, actionType);
      if (res.success) {
        showToast(res.message || "تم تنفيذ العملية بنجاح", "success");
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === rejectingAccount.id
              ? {
                  ...a,
                  status: actionType === "amendment" ? "pending" : "rejected",
                  rejectionReason: reason,
                }
              : a
          )
        );
        loadAccounts();
      } else {
        const msg = res.message || "فشل في تنفيذ العملية";
        showToast(msg, "error");
        if (msg.includes("409") || msg.includes("تعارض")) {
          loadAccounts();
        }
      }
    } catch (err: unknown) {
      console.error("Failed to process account rejection/amendment:", err);
      const e = err as { message?: string };
      showToast(e?.message || "فشل في تنفيذ العملية", "error");
      loadAccounts();
    } finally {
      setActionLoading(false);
      setRejectingAccount(null);
    }
  };

  // Handle Bulk Approve
  const handleBulkApprove = async (selectedIds: string[], clearSelection: () => void) => {
    if (!selectedIds.length) return;
    const pendingItems = accounts.filter(
      (a) => selectedIds.includes(a.id) && a.status === "pending"
    );

    if (pendingItems.length === 0) {
      showToast("لا توجد طلبات قيد المراجعة ضمن الحسابات المحددة للاعتماد", "error");
      return;
    }

    try {
      setActionLoading(true);
      let successCount = 0;
      let lastErrorMessage = "";
      for (const item of pendingItems) {
        try {
          const res = await accountsService.approveAccount(item.id);
          if (res.success) {
            successCount++;
          } else if (res.message) {
            lastErrorMessage = res.message;
          }
        } catch (e: any) {
          console.debug("Failed to approve in bulk for ID:", item.id, e);
          if (e?.message) lastErrorMessage = e.message;
        }
      }

      if (successCount > 0) {
        showToast(
          `تمت الموافقة بنجاح على ${successCount} من أصل ${pendingItems.length} حساب قيد المراجعة`,
          "success"
        );
      } else {
        showToast(lastErrorMessage || "تعذر اعتماد الحسابات المحددة", "error");
      }
      clearSelection();
      loadAccounts();
    } catch (err) {
      console.error("Bulk approve error:", err);
      showToast("حدث خطأ أثناء تنفيذ الاعتماد المجمع", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Export Selected
  const handleExportSelected = (selectedItems: UserAccountItem[]) => {
    if (!selectedItems.length) return;
    const headers = ["المعرف", "الاسم", "رقم الهاتف", "الدور", "الحالة", "تاريخ الطلب"];
    const rows = selectedItems.map((u) => [
      u.id,
      `"${u.name || ""}"`,
      `"${u.phone || ""}"`,
      `"${u.roleName || ""}"`,
      `"${u.status || ""}"`,
      `"${u.createdAt || ""}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `selected_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`تم تصدير ${selectedItems.length} حساب بصيغة CSV بنجاح`, "success");
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const r = role.toLowerCase();
    if (r.includes("stable")) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#FAF4E6] text-[#A6883C] border border-[#EADBBD]">
          صاحب مربط
        </span>
      );
    }
    if (r.includes("store")) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
          صاحب متجر
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
        عميل / مشتري
      </span>
    );
  };

  const getStatusBadge = (item: UserAccountItem) => {
    if (item.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تم التوثيق</span>
        </span>
      );
    }
    if (item.status === "rejected") {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] cursor-help"
          title={item.rejectionReason ? `سبب الرفض: ${item.rejectionReason}` : "تم رفض التوثيق"}
        >
          <X className="w-3.5 h-3.5" />
          <span>مرفوض</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
        <Clock className="w-3.5 h-3.5" />
        <span>قيد المراجعة</span>
      </span>
    );
  };

  // Columns Configuration
  const columns: Column<UserAccountItem>[] = [
    {
      key: "name",
      header: t("userAccounts.userName", "اسم المستخدم"),
      sortable: true,
      align: "right",
      render: (item) => (
        <div className="text-right">
          <p className="text-xs font-bold text-[#1E1E2D]">{item.name}</p>
          <p className="text-[11px] text-[#8E8E93]" dir="ltr">
            {item.phone}
          </p>
        </div>
      ),
    },
    {
      key: "roleName",
      header: "نوع الحساب",
      align: "center",
      render: (item) => getRoleBadge(item.roleName),
    },
    {
      key: "status",
      header: "حالة التوثيق",
      align: "center",
      render: (item) => getStatusBadge(item),
    },
    {
      key: "idFrontUrl",
      header: "الوجه الامامي",
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
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer mx-auto"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
    {
      key: "idBackUrl",
      header: "الوجه الخلفي",
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
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer mx-auto"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
    {
      key: "selfieWithIdUrl",
      header: "صورة مع الهوية",
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
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E8] text-[#A6883C] hover:bg-[#F3E7C9] transition-colors cursor-pointer mx-auto"
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
          {/* Status-specific actions */}
          {item.status === "approved" ? (
            <span className="flex h-7 px-2.5 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669] text-[11px] font-bold border border-[#A7F3D0]">
              <ShieldCheck className="w-3.5 h-3.5 ml-1 text-[#059669]" />
              <span>معتمد</span>
            </span>
          ) : item.status === "rejected" ? (
            /* Rejected accounts cannot be approved or rejected again per backend rules */
            <span
              className="flex h-7 px-2.5 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#DC2626] text-[11px] font-bold border border-[#FECACA]"
              title={item.rejectionReason ? `سبب الرفض: ${item.rejectionReason}` : "تم رفض طلب التوثيق"}
            >
              <X className="w-3.5 h-3.5 ml-1 text-[#DC2626]" strokeWidth={2.5} />
              <span>مرفوض</span>
            </span>
          ) : (
            /* Only pending accounts can be approved or rejected */
            <>
              {/* Approve Action */}
              <button
                type="button"
                onClick={() => setApprovingAccount(item)}
                title="قبول واعتماد توثيق المستخدم"
                className="flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg border border-[#10B981] bg-[#ECFDF5] text-[#059669] hover:bg-[#10B981] hover:text-white transition-colors cursor-pointer text-xs font-bold shadow-2xs"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>قبول</span>
              </button>

              {/* Reject Action */}
              <button
                type="button"
                onClick={() => setRejectingAccount(item)}
                title="رفض طلب التوثيق"
                className="flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg border border-[#EF4444] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#EF4444] hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>رفض</span>
              </button>
            </>
          )}

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
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A6883C] bg-[#FAF4E6] hover:bg-[#F3E7C9] transition-colors cursor-pointer"
          >
            <Award className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle={t("userAccounts.title", "حسابات المستخدمين")} />

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#10B981] px-5 py-3 text-xs font-bold text-white shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E2D]">
            {t("userAccounts.listTitle", "قائمة طلبات الحسابات والتوثيق")}
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            مراجعة هويات ومستندات أصحاب المرابط، المتاجر، والعملاء واعتمادها
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8F9FA] border border-[#EDEEF2]">
          {[
            { id: "all", label: "جميع الطلبات" },
            { id: "pending", label: "قيد المراجعة" },
            { id: "approved", label: "المعتمدة" },
            { id: "rejected", label: "المرفوضة" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                selectedStatus === tab.id
                  ? "bg-[#A6883C] text-white shadow-2xs"
                  : "text-[#6B7280] hover:text-[#1E1E2D] hover:bg-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
          searchPlaceholder="ابحث باسم المستخدم أو رقم الهاتف..."
          showSort={true}
          sortLabel="فرز"
        />

        {/* Dynamic Data Table with Bulk Actions & Shimmer Skeletons */}
        <DataTable
          columns={columns}
          data={accounts}
          loading={loading}
          keyExtractor={(item) => item.id}
          emptyMessage="لا توجد طلبات توثيق مسجلة في هذا القسم"
          selectable={true}
          renderBulkActions={(selectedIds, selectedItems, clearSelection) => {
            const pendingSelectedCount = selectedItems.filter((i) => i.status === "pending").length;
            return (
              <>
                <button
                  type="button"
                  onClick={() => handleBulkApprove(selectedIds, clearSelection)}
                  disabled={actionLoading || pendingSelectedCount === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title={
                    pendingSelectedCount === 0
                      ? "لا توجد طلبات قيد المراجعة محددة"
                      : `اعتماد ${pendingSelectedCount} طلب قيد المراجعة`
                  }
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>اعتماد قيد المراجعة ({pendingSelectedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportSelected(selectedItems)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EFE9E0] text-xs font-semibold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C88F45]" />
                  <span>تصدير CSV ({selectedItems.length})</span>
                </button>
              </>
            );
          }}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#ECE4D9] pt-4"
        />
      </div>

      {/* Approve Account Modal */}
      <ApproveAccountModal
        isOpen={Boolean(approvingAccount)}
        onClose={() => setApprovingAccount(null)}
        onConfirm={handleApproveConfirm}
        loading={actionLoading}
      />

      {/* Reject Account Modal with Reason */}
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
