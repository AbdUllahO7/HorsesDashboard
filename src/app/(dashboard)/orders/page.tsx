"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UsersRound,
  UserCheck,
  Gavel,
  Video,
  TrendingUp,
  BarChart2,
  ChevronDown,
  Eye,
} from "lucide-react";
import {
  analyticsService,
  analyticsStatCardsConfig,
} from "@/features/analytics/services";
import {
  DashboardOverviewStats,
  AnalyticsStatCardItem,
  PlatformGrowthDataPoint,
  AuctionCompletionTrendPoint,
  TopAuctionItem,
  TopLiveStreamItem,
} from "@/features/analytics/types";
import { Breadcrumb, StatCard } from "@/components";
import { cn } from "@/core/utils/cn";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  UsersRound,
  UserCheck,
  Gavel,
};

export default function ReportsAndAnalyticsPage() {
  // State
  const [stats, setStats] = useState<DashboardOverviewStats | null>(null);
  const [statCardsConfig, setStatCardsConfig] = useState<AnalyticsStatCardItem[]>(analyticsStatCardsConfig);
  const [growthData, setGrowthData] = useState<PlatformGrowthDataPoint[]>([]);
  const [trendData, setTrendData] = useState<AuctionCompletionTrendPoint[]>([]);
  const [topAuctions, setTopAuctions] = useState<TopAuctionItem[]>([]);
  const [topLiveStreams, setTopLiveStreams] = useState<TopLiveStreamItem[]>([]);
  const [timeframe, setTimeframe] = useState<string>("yearly");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [statsRes, cardsRes, growthRes, trendsRes, auctionsRes, streamsRes] =
          await Promise.all([
            analyticsService.getOverviewStats(),
            analyticsService.getStatCardsConfig(),
            analyticsService.getPlatformGrowth(),
            analyticsService.getAuctionTrends(timeframe),
            analyticsService.getTopAuctions(),
            analyticsService.getTopLiveStreams(),
          ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
        if (growthRes.success && growthRes.data) setGrowthData(growthRes.data);
        if (trendsRes.success && trendsRes.data) setTrendData(trendsRes.data);
        if (auctionsRes.success && auctionsRes.data) setTopAuctions(auctionsRes.data);
        if (streamsRes.success && streamsRes.data) setTopLiveStreams(streamsRes.data);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [timeframe]);

  // Max value for bar chart calculation
  const maxGrowthValue = Math.max(...growthData.map((d) => d.value), 100);

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle="التقارير والإحصائيات" />

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((card) => {
          const IconComponent = iconMap[card.iconName] || Users;
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

      {/* 3. Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Right Card: Platform Growth (آخر 6 أشهر) */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[#1E1E2D] font-bold text-sm">
                نمو المنصة (آخر 6 أشهر)
              </span>
              <TrendingUp className="h-4 w-4 text-[#1E1E2D]" />
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between gap-2 h-56 pt-6 px-2 border-b border-[#F0F2F5]">
            {growthData.map((item, idx) => {
              const heightPercent = Math.round((item.value / maxGrowthValue) * 100);
              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                  {/* Vertical Bar */}
                  <div className="w-full flex items-end justify-center h-44">
                    <div
                      style={{ height: `${Math.max(heightPercent, 12)}%` }}
                      className="w-3 sm:w-4 rounded-full bg-[#B8860B] group-hover:bg-[#A37508] transition-all duration-300 shadow-2xs"
                    />
                  </div>
                  {/* Number Value below Bar */}
                  <span className="text-[11px] font-bold text-[#1E1E2D] mt-2 group-hover:text-[#B8860B] transition-colors">
                    {item.value}
                  </span>
                  {/* Month Label */}
                  <span className="text-[10px] text-[#8E8E93] mt-0.5 whitespace-nowrap">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Card: Auction Completion Trends */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs flex flex-col justify-between">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-1 pr-6 text-xs text-[#6B7280] outline-none hover:border-[#B8860B] transition-colors cursor-pointer"
              >
                <option value="yearly">سنوياً</option>
                <option value="monthly">شهرياً</option>
              </select>
              <ChevronDown className="pointer-events-none absolute left-2 top-2 h-3 w-3 text-[#6B7280]" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#1E1E2D] font-bold text-sm">
                اتجاه معدل إتمام المزادات
              </span>
              <BarChart2 className="h-4 w-4 text-[#1E1E2D]" />
            </div>
          </div>

          {/* Area Line Chart with SVG */}
          <div className="relative h-56 w-full flex items-end">
            {/* Y Axis Grid & Labels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#9CA3AF] py-2">
              <div className="flex items-center justify-between border-b border-[#F3F4F8] pb-1">
                <span>100k</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F3F4F8] pb-1">
                <span>50k</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F3F4F8] pb-1">
                <span>20k</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F3F4F8] pb-1">
                <span>10k</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#F3F4F8] pb-1">
                <span>0</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full h-44 z-10 pr-6">
              <svg
                viewBox="0 0 500 160"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8860B" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#EADBBD" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FAF4E8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <path
                  d="M 0,140 Q 60,130 100,105 T 200,60 T 260,130 T 340,90 T 420,40 L 500,20 L 500,160 L 0,160 Z"
                  fill="url(#goldGradient)"
                />

                {/* Line Stroke */}
                <path
                  d="M 0,140 Q 60,130 100,105 T 200,60 T 260,130 T 340,90 T 420,40 L 500,20"
                  fill="none"
                  stroke="#B8860B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between items-center text-[10px] text-[#9CA3AF] mt-2 pr-2">
                {trendData.map((d, i) => (
                  <span key={i}>{d.year}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Top Engaged Auctions & Top Viewed Live Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Right Card: المزادات الأكثر تفاعلاً */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/auctions"
              className="text-xs text-[#8E8E93] hover:text-[#B8860B] font-medium transition-colors"
            >
              عرض الكل &gt;
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[#1E1E2D] font-bold text-sm">
                المزادات الأكثر تفاعلاً
              </span>
              <Gavel className="h-4 w-4 text-[#1E1E2D]" />
            </div>
          </div>

          {/* List of Items */}
          <div className="space-y-3">
            {topAuctions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#EDEEF2] bg-white p-4 flex items-center justify-between border-r-4 border-r-[#B8860B] shadow-2xs hover:border-[#B8860B] transition-all"
              >
                {/* View Badge on Left (in RTL) */}
                <div className="flex items-center gap-1.5 rounded-xl border border-[#EADBBD] bg-[#FAF4E8] px-3 py-1.5 text-xs font-bold text-[#A6883C]">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{item.viewsCount} مشاهدة</span>
                </div>

                {/* Title & Seller on Right (in RTL) */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-[#1E1E2D]">{item.name}</h4>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">{item.sellerName}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#A6883C] border border-[#EADBBD]">
                    <Gavel className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Card: البثوث الأكثر مشاهدة */}
        <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href="/auctions"
              className="text-xs text-[#8E8E93] hover:text-[#B8860B] font-medium transition-colors"
            >
              عرض الكل &gt;
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[#1E1E2D] font-bold text-sm">
                البثوث الأكثر مشاهدة
              </span>
              <Video className="h-4 w-4 text-[#1E1E2D]" />
            </div>
          </div>

          {/* List of Items */}
          <div className="space-y-3">
            {topLiveStreams.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#EDEEF2] bg-white p-4 flex items-center justify-between border-r-4 border-r-[#B8860B] shadow-2xs hover:border-[#B8860B] transition-all"
              >
                {/* View Badge on Left (in RTL) */}
                <div className="flex items-center gap-1.5 rounded-xl border border-[#EADBBD] bg-[#FAF4E8] px-3 py-1.5 text-xs font-bold text-[#A6883C]">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{item.viewsCount} مشاهدة</span>
                </div>

                {/* Title & Seller on Right (in RTL) */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-[#1E1E2D]">{item.name}</h4>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">{item.sellerName}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#A6883C] border border-[#EADBBD]">
                    <Video className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
