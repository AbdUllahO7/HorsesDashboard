"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Gavel, Radio, CheckCircle2, Clock, Trash2, ShieldAlert } from "lucide-react";
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
  Breadcrumb,
} from "@/components";

type StatusTab = "all" | "active" | "completed" | "stopped";

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
  const [totalPages, setTotalPages] = useState<number>(1);

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
  const loadMetadata = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

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
        setTotalPages(res.data.pagination.totalPages || 1);
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

  // Error / Success Message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Accept / Approve Auction
  const handleAcceptAuction = (auction: AuctionTableItem) => {
    setErrorMessage(null);
    setConfirmDialog({
      isOpen: true,
      variant: "gold",
      title: "قبول واعتماد المزاد",
      description: `هل أنت متأكد من قبول ونشر المزاد "${auction.title}"؟`,
      confirmText: "قبول واعتماد",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await auctionsService.acceptAuction(auction.id);
          if (res.success) {
            setAuctions((prev) =>
              prev.map((a) => (a.id === auction.id ? { ...a, status: "active", statusLabel: "نشط" } : a))
            );
            if (selectedAuction?.id === auction.id) {
              setSelectedAuction((prev) => (prev ? { ...prev, status: "active", statusLabel: "نشط" } : null));
            }
            loadMetadata();
          } else {
            setErrorMessage(res.message || "تعذر قبول المزاد (403 Forbidden)");
          }
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Handle Stop Auction
  const handleStopAuction = (auction: AuctionTableItem) => {
    setErrorMessage(null);
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "إيقاف المزاد",
      description: `هل تريد إيقاف المزاد "${auction.title}"؟ لن يتمكن المشترون من تقديم مزايدات جديدة.`,
      confirmText: "إيقاف المزاد",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await auctionsService.stopAuction(auction.id);
          if (res.success) {
            setAuctions((prev) =>
              prev.map((a) => (a.id === auction.id ? { ...a, status: "stopped", statusLabel: "متوقف" } : a))
            );
            if (selectedAuction?.id === auction.id) {
              setSelectedAuction((prev) => (prev ? { ...prev, status: "stopped", statusLabel: "متوقف" } : null));
            }
            loadMetadata();
          } else {
            setErrorMessage(res.message || "تعذر إيقاف المزاد");
          }
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Handle Delete Auction
  const handleDeleteAuction = (auction: AuctionTableItem) => {
    setErrorMessage(null);
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف المزاد",
      description: `هل أنت متأكد من حذف المزاد "${auction.title}" بشكل نهائي؟`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          const res = await auctionsService.deleteAuction(auction.id);
          if (res.success) {
            setAuctions((prev) => prev.filter((a) => a.id !== auction.id));
            setSelectedAuction(null);
            loadMetadata();
          } else {
            setErrorMessage(res.message || "تعذر حذف المزاد (403 Forbidden)");
          }
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Handle Toggle Live Stream
  const handleToggleAuctionLive = async (auction: AuctionTableItem) => {
    const nextState = !auction.isLiveEnabled;
    try {
      setActionLoading(true);
      await auctionsService.toggleAuctionLive(auction.id, nextState);
      setAuctions((prev) =>
        prev.map((a) => (a.id === auction.id ? { ...a, isLiveEnabled: nextState } : a))
      );
      if (selectedAuction?.id === auction.id) {
        setSelectedAuction((prev) => (prev ? { ...prev, isLiveEnabled: nextState } : null));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Dynamic Columns Configuration for DataTable
  const columns: Column<AuctionTableItem>[] = [
    {
      key: "title",
      header: t("auctions.auctionName", "عنوان المزاد"),
      sortable: true,
      align: "right",
      render: (auction) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#B8860B] font-bold text-xs border border-[#EADBBD]">
            🐎
          </div>
          <div>
            <span className="font-bold text-[#1E1E2D] block">{auction.title}</span>
            <span className="text-[11px] text-[#8E8E93]">سعر البداية: {auction.startingPrice?.toLocaleString()} ر.س</span>
          </div>
        </div>
      ),
    },
    {
      key: "sellerName",
      header: t("auctions.sellerName", "اسم البائع"),
      sortable: true,
      align: "right",
      render: (auction) => (
        <span className="font-medium text-[#1E1E2D]">{auction.sellerName}</span>
      ),
    },
    {
      key: "category",
      header: t("categories.categoryName", "التصنيف"),
      sortable: true,
      align: "right",
      render: (auction) => (
        <span className="text-[#4A4E5A]">{auction.category}</span>
      ),
    },
    {
      key: "status",
      header: t("common.status", "الحالة"),
      sortable: true,
      align: "center",
      render: (auction) => <StatusBadge status={auction.status} />,
    },
    {
      key: "currentBid",
      header: "أعلى مزايدة",
      sortable: true,
      align: "center",
      render: (auction) => (
        <span className="font-bold text-[#10B981]">
          {auction.currentBid ? `${auction.currentBid.toLocaleString()} ر.س` : "-"}
        </span>
      ),
    },
    {
      key: "totalBids",
      header: t("auctions.bidsCount", "إجمالي المزايدات"),
      sortable: true,
      align: "center",
      render: (auction) => (
        <span className="font-bold text-[#1E1E2D] bg-[#F8F9FA] px-2.5 py-1 rounded-lg">
          {auction.totalBids}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("categories.createdAt", "تاريخ الإنشاء"),
      sortable: true,
      align: "center",
      render: (auction) => (
        <span className="text-[#4A4E5A] text-xs">{auction.createdAt}</span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions", "الإجراءات"),
      align: "center",
      render: (auction) => (
        <div
          className="flex items-center justify-center gap-2"
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
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#B8860B] hover:bg-[#F3E7C4] transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Delete Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAuction(auction);
            }}
            title="حذف المزاد"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
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
      <Breadcrumb pageTitle={t("auctions.title", "إدارة المزادات")} />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
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
        <h2 className="text-lg font-bold text-[#1E1E2D] mb-6">
          {t("auctions.listTitle", "قائمة المزادات")}
        </h2>

        {/* Dynamic Reusable Table Toolbar */}
        <TableToolbar<StatusTab>
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          searchPlaceholder="ابحث باسم المزاد، البائع، أو التصنيف..."
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
        onAccept={handleAcceptAuction}
        onStop={handleStopAuction}
        onDelete={handleDeleteAuction}
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
