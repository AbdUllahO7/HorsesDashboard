"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Gavel, Radio, CheckCircle2, Clock } from "lucide-react";
import {
  auctionsService,
  auctionFilterTabs,
  auctionStatCardsConfig,
} from "@/features/auctions/services";
import {
  AuctionTableItem,
  AuctionStats,
  AuctionStatCardItem,
  AuctionFilterTabItem,
} from "@/features/auctions/types";
import { useTranslation } from "@/i18n";
import {
  StatCard,
  StatusBadge,
  ToggleSwitch,
  Pagination,
  ConfirmModal,
  AuctionDetailsModal,
  ConfirmModalVariant,
  DataTable,
  Column,
  TableToolbar,
} from "@/components";

type StatusTab = "all" | "active" | "completed";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gavel,
  Radio,
  CheckCircle2,
  Clock,
};

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function AuctionsPage() {
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState<AuctionStats | null>(null);
  const [filterTabs, setFilterTabs] = useState<AuctionFilterTabItem[]>(auctionFilterTabs);
  const [statCardsConfig, setStatCardsConfig] = useState<AuctionStatCardItem[]>(auctionStatCardsConfig);
  const [auctions, setAuctions] = useState<AuctionTableItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

  // Modals state
  const [selectedAuction, setSelectedAuction] = useState<AuctionTableItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "gold",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load KPI Stats, Filter Tabs, and Stat Cards from service
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [statsRes, tabsRes, cardsRes] = await Promise.all([
          auctionsService.getAuctionsStats(),
          auctionsService.getFilterTabs(),
          auctionsService.getStatCardsConfig(),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (tabsRes.success && tabsRes.data) setFilterTabs(tabsRes.data);
        if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
      } catch (err) {
        console.error("Failed to load auction metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Load Auctions Table Data from service
  const loadAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auctionsService.getAuctionsTable({
        page: currentPage,
        limit: 10,
        statusTab: activeTab,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setAuctions(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to load auctions table:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, currentPage]);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  // Handle Toggle Live Stream / Auction feature
  const handleToggleAuctionLive = (auction: AuctionTableItem) => {
    if (!auction.isLiveEnabled) {
      setConfirmDialog({
        isOpen: true,
        variant: "gold",
        title: "تأكيد تفعيل المزادات",
        description: `هل تريد تفعيل ميزة المزادات لهذا المزاد (${auction.title})؟ سيتمكن المستخدمون من المزايدة الفورية.`,
        confirmText: "تفعيل",
        onConfirm: async () => {
          setActionLoading(true);
          try {
            await auctionsService.toggleAuctionLive(auction.id, true);
            setAuctions((prev) =>
              prev.map((a) => (a.id === auction.id ? { ...a, isLiveEnabled: true } : a))
            );
            if (selectedAuction?.id === auction.id) {
              setSelectedAuction((prev) => (prev ? { ...prev, isLiveEnabled: true } : null));
            }
          } finally {
            setActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else {
      setAuctions((prev) =>
        prev.map((a) => (a.id === auction.id ? { ...a, isLiveEnabled: false } : a))
      );
      if (selectedAuction?.id === auction.id) {
        setSelectedAuction((prev) => (prev ? { ...prev, isLiveEnabled: false } : null));
      }
      auctionsService.toggleAuctionLive(auction.id, false);
    }
  };

  // Dynamic Columns Configuration for DataTable matching Image 4
  const columns: Column<AuctionTableItem>[] = [
    {
      key: "title",
      header: "عنوان المزاد",
      sortable: true,
      align: "right",
      render: (auction) => (
        <span className="font-bold text-[#1E1E2D]">{auction.title}</span>
      ),
    },
    {
      key: "sellerName",
      header: "اسم البائع",
      sortable: true,
      align: "right",
      render: (auction) => (
        <span className="font-medium text-[#1E1E2D]">{auction.sellerName}</span>
      ),
    },
    {
      key: "category",
      header: "التصنيف",
      sortable: true,
      align: "right",
      render: (auction) => (
        <span className="text-[#4A4E5A]">{auction.category}</span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      sortable: true,
      align: "center",
      render: (auction) => <StatusBadge status={auction.status} />,
    },
    {
      key: "totalBids",
      header: "اجمالي المزايدات",
      sortable: true,
      align: "center",
      render: (auction) => (
        <span className="font-bold text-[#1E1E2D]">{auction.totalBids}</span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الانشاء",
      sortable: true,
      align: "center",
      render: (auction) => (
        <span className="text-[#4A4E5A]">{auction.createdAt}</span>
      ),
    },
    {
      key: "actions",
      header: "الاجراءات",
      align: "center",
      render: (auction) => (
        <div
          className="flex items-center justify-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* View Details Eye Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAuction(auction);
            }}
            title="عرض التفاصيل"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Live / Activation Toggle */}
          <ToggleSwitch
            checked={auction.isLiveEnabled}
            onChange={() => handleToggleAuctionLive(auction)}
            color="green"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <div className="flex items-center justify-start text-xs text-[#8E8E93] font-medium gap-1.5">
        <span className="text-[#1E1E2D] font-bold">إدارة المزادات</span>
        <span>&gt;</span>
        <span>لوحة التحكم</span>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((card) => {
          const IconComponent = iconMap[card.iconName] || Gavel;
          const count = stats ? stats[card.countKey] : 0;
          return (
            <StatCard
              key={card.id}
              title={card.label}
              value={count}
              icon={IconComponent}
              loading={!stats}
              variant="gold"
            />
          );
        })}
      </div>

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Card Title */}
        <h2 className="text-lg font-bold text-[#1E1E2D] mb-6">قائمة المزادات</h2>

        {/* Dynamic Reusable Table Toolbar */}
        <TableToolbar<StatusTab>
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          searchPlaceholder="ابحث هنا"
          tabs={filterTabs}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            setCurrentPage(1);
          }}
        />

        {/* Reusable Dynamic Data Table */}
        <DataTable<AuctionTableItem>
          columns={columns}
          data={auctions}
          loading={loading}
          onRowClick={(auction) => setSelectedAuction(auction)}
          keyExtractor={(auction) => auction.id}
        />

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Auction Details Modal */}
      <AuctionDetailsModal
        isOpen={Boolean(selectedAuction)}
        auction={selectedAuction}
        onClose={() => setSelectedAuction(null)}
        onToggleLive={handleToggleAuctionLive}
      />

      {/* Dynamic Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        loading={actionLoading}
      />
    </div>
  );
}
