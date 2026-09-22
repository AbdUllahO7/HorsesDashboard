"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UsersRound,
  FileText,
  Gavel,
  Video,
  Eye,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { analyticsService } from "@/features/analytics/services";
import {
  DashboardOverviewStats,
  TopAuctionItem,
  TopLiveStreamItem,
} from "@/features/analytics/types";
import { useTranslation } from "@/i18n";
import { StatCard, SectionCard, ActionListItem } from "@/components";

export default function DashboardOverviewPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardOverviewStats | null>(null);
  const [topAuctions, setTopAuctions] = useState<TopAuctionItem[]>([]);
  const [topLiveStreams, setTopLiveStreams] = useState<TopLiveStreamItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, auctionsRes, liveRes] = await Promise.allSettled([
        analyticsService.getOverviewStats(),
        analyticsService.getTopAuctions(),
        analyticsService.getTopLiveStreams(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (auctionsRes.status === "fulfilled" && auctionsRes.value.success) {
        setTopAuctions(auctionsRes.value.data);
      }
      if (liveRes.status === "fulfilled" && liveRes.value.success) {
        setTopLiveStreams(liveRes.value.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statCardsConfig = [
    {
      id: "livestock",
      label: t("dashboard.livestockCount"),
      count: stats?.livestockSellersCount ?? 0,
      icon: Users,
      href: "/listings/sellers",
    },
    {
      id: "supplies",
      label: t("dashboard.suppliesCount"),
      count: stats?.suppliesSellersCount ?? 0,
      icon: UsersRound,
      href: "/listings/supplies-sellers",
    },
    {
      id: "customers",
      label: t("dashboard.customersCount"),
      count: stats?.customersCount ?? 0,
      icon: FileText,
      href: "/users",
    },
    {
      id: "auctions",
      label: t("dashboard.auctionsCount"),
      count: stats?.activeAuctionsCount ?? 0,
      icon: Gavel,
      href: "/auctions",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar with Page Title and Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E2D]">
            {t("dashboard.title", "لوحة التحكم الرئيسية")}
          </h1>
          <p className="text-xs text-[#8E8E93] mt-1">
            {t("dashboard.subtitle", "ملخص حركة ونشاط المنصة والمزادات والبائعين")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDashboardData(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EDEEF2] text-xs font-semibold text-[#4A4E5A] hover:text-[#1E1E2D] hover:bg-[#F3F4F8] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#B59E5F]" : ""}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* 4 Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((card) => (
          <StatCard
            key={card.id}
            title={card.label}
            value={card.count}
            icon={card.icon}
            loading={loading}
            href={card.href}
            variant="gold"
          />
        ))}
      </div>

      {/* Two Column Layout: Most Engaged Auctions & Most Viewed Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Right Column: المزادات الأكثر تفاعلاً */}
        <SectionCard
          title={t("dashboard.topAuctions")}
          icon={Gavel}
          actionText={t("common.viewAll")}
          actionHref="/auctions"
          loading={loading}
        >
          <div className="space-y-3">
            {topAuctions.length > 0 ? (
              topAuctions.map((auction) => (
                <ActionListItem
                  key={auction.id}
                  id={auction.id}
                  title={auction.name}
                  subtitle={auction.sellerName}
                  icon={Gavel}
                  badgeText={`${auction.viewsCount} ${t("common.views")}`}
                  badgeIcon={<Eye className="h-3.5 w-3.5" />}
                  href={`/auctions`}
                />
              ))
            ) : (
              <div className="py-8 text-center text-[#8E8E93] space-y-2">
                <Inbox className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-xs">لا توجد مزادات نشطة حالياً</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Left Column: البثوث الأكثر مشاهدة */}
        <SectionCard
          title={t("dashboard.topLives")}
          icon={Video}
          actionText={t("common.viewAll")}
          actionHref="/auctions"
          loading={loading}
        >
          <div className="space-y-3">
            {topLiveStreams.length > 0 ? (
              topLiveStreams.map((stream) => (
                <ActionListItem
                  key={stream.id}
                  id={stream.id}
                  title={stream.name}
                  subtitle={stream.sellerName}
                  icon={Video}
                  badgeText={`${stream.viewsCount} ${t("common.views")}`}
                  badgeIcon={<Eye className="h-3.5 w-3.5" />}
                  href={`/auctions`}
                />
              ))
            ) : (
              <div className="py-8 text-center text-[#8E8E93] space-y-2">
                <Inbox className="h-8 w-8 mx-auto opacity-40" />
                <p className="text-xs">لا توجد بثوث مباشرة نشطة حالياً</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
