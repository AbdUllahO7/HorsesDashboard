"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UsersRound,
  FileText,
  Gavel,
  Video,
  Eye,
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

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, auctionsRes, liveRes] = await Promise.all([
          analyticsService.getOverviewStats(),
          analyticsService.getTopAuctions(),
          analyticsService.getTopLiveStreams(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (auctionsRes.success) setTopAuctions(auctionsRes.data);
        if (liveRes.success) setTopLiveStreams(liveRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCardsConfig = [
    {
      id: "livestock",
      label: t("dashboard.livestockCount"),
      count: stats?.livestockSellersCount ?? 55,
      icon: Users,
      href: "/listings/sellers",
    },
    {
      id: "supplies",
      label: t("dashboard.suppliesCount"),
      count: stats?.suppliesSellersCount ?? 55,
      icon: UsersRound,
      href: "/listings/supplies-sellers",
    },
    {
      id: "customers",
      label: t("dashboard.customersCount"),
      count: stats?.customersCount ?? 55,
      icon: FileText,
      href: "/users",
    },
    {
      id: "auctions",
      label: t("dashboard.auctionsCount"),
      count: stats?.activeAuctionsCount ?? 55,
      icon: Gavel,
      href: "/auctions",
    },
  ];

  return (
    <div className="space-y-6">
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

      {/* Two Column Layout: Most Engaged Auctions (Right) & Most Viewed Streams (Left) */}
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
            {topAuctions.map((auction) => (
              <ActionListItem
                key={auction.id}
                id={auction.id}
                title={auction.name}
                subtitle={auction.sellerName}
                icon={Gavel}
                badgeText={`${auction.viewsCount} ${t("common.views")}`}
                badgeIcon={<Eye className="h-3.5 w-3.5" />}
                href={`/auctions/${auction.id}`}
              />
            ))}
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
            {topLiveStreams.map((stream) => (
              <ActionListItem
                key={stream.id}
                id={stream.id}
                title={stream.name}
                subtitle={stream.sellerName}
                icon={Video}
                badgeText={`${stream.viewsCount} ${t("common.views")}`}
                badgeIcon={<Eye className="h-3.5 w-3.5" />}
                href={`/auctions/${stream.id}`}
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
