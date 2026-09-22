"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DollarSign, FileText, LayoutGrid, TrendingUp, Users } from "lucide-react";
import {
  accountingService,
  accountingStatCardsConfig,
} from "@/features/accounting/services";
import {
  AccountingStats,
  AccountingStatCardItem,
  ProfitableServiceItem,
  ActiveUserItem,
} from "@/features/accounting/types";
import {
  Breadcrumb,
  StatCard,
  DataTable,
  Column,
  Pagination,
} from "@/components";
import { useTranslation } from "@/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  FileText,
  LayoutGrid,
};

export default function AccountingPage() {
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState<AccountingStats | null>(null);
  const [statCardsConfig, setStatCardsConfig] = useState<AccountingStatCardItem[]>(accountingStatCardsConfig);
  const [profitableServices, setProfitableServices] = useState<ProfitableServiceItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadData = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const [statsRes, cardsRes, servicesRes, usersRes] = await Promise.all([
        accountingService.getStats(),
        accountingService.getStatCardsConfig(),
        accountingService.getProfitableServices(),
        accountingService.getActiveUsers(page, 10),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
      if (servicesRes.success && servicesRes.data) setProfitableServices(servicesRes.data);
      if (usersRes.success && usersRes.data) {
        setActiveUsers(usersRes.data.items || []);
        setTotalPages(usersRes.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load accounting data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [loadData, currentPage]);

  // Columns for Profitable Services Table
  const serviceColumns: Column<ProfitableServiceItem>[] = [
    {
      key: "serviceName",
      header: t("accounting.serviceName", "اسم الخدمة"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-semibold text-[#1E1E2D]">{item.serviceName}</span>
      ),
    },
    {
      key: "revenue",
      header: t("accounting.revenue", "المبلغ العائد من الربح"),
      sortable: true,
      align: "right",
      render: (item) => (
        <span className="text-xs font-bold text-[#A6883C]" dir="ltr">
          {item.revenue}
        </span>
      ),
    },
  ];

  // Columns for Active Users Table
  const userColumns: Column<ActiveUserItem>[] = [
    {
      key: "userName",
      header: t("accounting.userName", "اسم المستخدم / الإسطبل"),
      sortable: true,
      align: "right",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF4E6] border border-[#EADBBD] flex items-center justify-center text-[#A6883C] text-xs font-bold shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-[#1E1E2D]">{item.userName}</span>
        </div>
      ),
    },
    {
      key: "activityCount",
      header: "عدد العمليات / النشاط",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-bold bg-[#F8F9FA] border border-[#EDEEF2] px-2.5 py-1 rounded-lg text-[#333748]">
          {item.activityCount || 0} عملية
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle={t("accounting.title", "المحاسبة والمالية")} />

      {/* 2. Page Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E2D]">{t("accounting.title", "المحاسبة والمالية")}</h1>
          <p className="text-xs text-[#8E8E93] mt-1">
            متابعة الإيرادات المحققة، أكثر الخدمات ربحية، والمستخدمين الأكثر نشاطاً في المنصة
          </p>
        </div>
      </div>

      {/* 3. Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCardsConfig.map((card) => {
          const IconComponent = iconMap[card.iconName] || DollarSign;
          const rawValue = stats ? (stats[card.countKey] ?? 0) : 0;
          const displayValue =
            card.countKey === "totalSales"
              ? `${Number(rawValue).toLocaleString()}`
              : Number(rawValue).toLocaleString();
          return (
            <StatCard
              key={card.id}
              title={card.label}
              value={displayValue}
              icon={IconComponent}
              loading={loading && !stats}
              variant="gold"
            />
          );
        })}
      </div>

      {/* 4. Section 1: أكثر الخدمات ربحا */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#A6883C]" />
            <h2 className="text-sm font-bold text-[#1E1E2D]">
              {t("accounting.profitableServices", "أكثر الخدمات ربحا")}
            </h2>
          </div>
          <span className="text-[11px] text-[#8E8E93]">إجمالي الخدمات النشطة: {profitableServices.length}</span>
        </div>
        <DataTable
          columns={serviceColumns}
          data={profitableServices}
          loading={loading}
          keyExtractor={(item) => item.id}
          emptyMessage="لا توجد بيانات خدمات حالياً"
        />
      </div>

      {/* 5. Section 2: أكثر المستخدمين نشاطا */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#A6883C]" />
            <h2 className="text-sm font-bold text-[#1E1E2D]">
              {t("accounting.activeUsers", "أكثر المستخدمين نشاطا")}
            </h2>
          </div>
        </div>
        <DataTable
          columns={userColumns}
          data={activeUsers}
          loading={loading}
          keyExtractor={(item) => item.id}
          emptyMessage="لا توجد بيانات مستخدمين حالياً"
        />

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
  );
}
