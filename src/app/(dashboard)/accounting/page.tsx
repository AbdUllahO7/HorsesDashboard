"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, FileText, LayoutGrid } from "lucide-react";
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
  const [totalPages, setTotalPages] = useState<number>(4);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, cardsRes, servicesRes, usersRes] = await Promise.all([
          accountingService.getStats(),
          accountingService.getStatCardsConfig(),
          accountingService.getProfitableServices(),
          accountingService.getActiveUsers(),
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
        if (servicesRes.success && servicesRes.data) setProfitableServices(servicesRes.data);
        if (usersRes.success && usersRes.data) setActiveUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to load accounting data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
        <span className="text-xs font-bold text-[#1E1E2D]" dir="ltr">
          {item.revenue}
        </span>
      ),
    },
  ];

  // Columns for Active Users Table
  const userColumns: Column<ActiveUserItem>[] = [
    {
      key: "userName",
      header: t("accounting.userName", "اسم المستخدم"),
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-xs font-medium text-[#1E1E2D]">{item.userName}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle={t("accounting.title", "المحاسبة")} />

      {/* 2. Page Header Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E1E2D]">{t("accounting.title", "المحاسبة")}</h1>
      </div>

      {/* 3. Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCardsConfig.map((card) => {
          const IconComponent = iconMap[card.iconName] || DollarSign;
          const count = stats ? (stats[card.countKey] ?? 0) : 0;
          return (
            <StatCard
              key={card.id}
              title={card.label}
              value={count}
              icon={IconComponent}
              loading={loading && !stats}
              variant="gold"
            />
          );
        })}
      </div>

      {/* 4. Section 1: أكثر الخدمات ربحا */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-[#1E1E2D] mb-4">
          {t("accounting.profitableServices", "أكثر الخدمات ربحا")}
        </h2>
        <DataTable
          columns={serviceColumns}
          data={profitableServices}
          loading={loading}
          keyExtractor={(item) => item.id}
        />
      </div>

      {/* 5. Section 2: أكثر المستخدمين نشاطا */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-[#1E1E2D] mb-4">
          {t("accounting.activeUsers", "أكثر المستخدمين نشاطا")}
        </h2>
        <DataTable
          columns={userColumns}
          data={activeUsers}
          loading={loading}
          keyExtractor={(item) => item.id}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>
    </div>
  );
}
