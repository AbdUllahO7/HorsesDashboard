"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Search,
  ArrowUpDown,
  Check,
  Ban,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { listingsService } from "@/features/listings/services";
import {
  LivestockSeller,
  SellersStats,
  SellerStatus,
  SellerFilterTabItem,
  SellerStatCardItem,
} from "@/features/listings/types";
import {
  sellerFilterTabs,
  sellerStatCardsConfig,
} from "@/features/listings/services";
import { useTranslation } from "@/i18n";
import {
  StatCard,
  StatusBadge,
  ToggleSwitch,
  Pagination,
  ConfirmModal,
  SellerDetailsModal,
  ConfirmModalVariant,
  DataTable,
  Column,
  TableToolbar,
  Breadcrumb,
} from "@/components";

type StatusTab = "all" | SellerStatus;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  UserCheck,
  UserX,
  UserMinus,
};

interface ConfirmDialogState {
  isOpen: boolean;
  variant: ConfirmModalVariant;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
}

export default function LivestockSellersPage() {
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState<SellersStats | null>(null);
  const [filterTabs, setFilterTabs] = useState<SellerFilterTabItem[]>(sellerFilterTabs);
  const [statCardsConfig, setStatCardsConfig] = useState<SellerStatCardItem[]>(sellerStatCardsConfig);
  const [sellers, setSellers] = useState<LivestockSeller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

  // Modals state
  const [selectedSeller, setSelectedSeller] = useState<LivestockSeller | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    variant: "danger",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load KPI Stats, Filter Tabs, and Stat Cards from service
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [statsRes, tabsRes, cardsRes] = await Promise.all([
          listingsService.getLivestockSellersStats(),
          listingsService.getFilterTabs(),
          listingsService.getStatCardsConfig(),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (tabsRes.success && tabsRes.data) setFilterTabs(tabsRes.data);
        if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    }
    loadMetadata();
  }, []);


  // Load Sellers Table Data
  const loadSellers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listingsService.getLivestockSellers({
        page: currentPage,
        limit: 10,
        statusTab: activeTab,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setSellers(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to load sellers:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, currentPage]);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  // Handlers for Toggles & Actions
  const handleToggleAuctions = (seller: LivestockSeller) => {
    if (!seller.isAuctionsEnabled) {
      // Prompt modal when turning ON auctions
      setConfirmDialog({
        isOpen: true,
        variant: "gold",
        title: "تأكيد تفعيل المزادات",
        description: "هل تريد تفعيل ميزة المزادات لهذا البائع؟ سيتمكن من إنشاء وإدارة المزادات.",
        confirmText: "تفعيل",
        onConfirm: async () => {
          setActionLoading(true);
          try {
            await listingsService.toggleSellerAuctions(seller.id, true);
            setSellers((prev) =>
              prev.map((s) => (s.id === seller.id ? { ...s, isAuctionsEnabled: true } : s))
            );
            if (selectedSeller?.id === seller.id) {
              setSelectedSeller((prev) => (prev ? { ...prev, isAuctionsEnabled: true } : null));
            }
          } finally {
            setActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else {
      // Toggle directly OFF
      setSellers((prev) =>
        prev.map((s) => (s.id === seller.id ? { ...s, isAuctionsEnabled: false } : s))
      );
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller((prev) => (prev ? { ...prev, isAuctionsEnabled: false } : null));
      }
      listingsService.toggleSellerAuctions(seller.id, false);
    }
  };

  const handleToggleLiveStream = async (sellerId: string, currentVal: boolean) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, isLiveStreamEnabled: !currentVal } : s))
    );
    if (selectedSeller?.id === sellerId) {
      setSelectedSeller((prev) => (prev ? { ...prev, isLiveStreamEnabled: !currentVal } : null));
    }
    await listingsService.toggleSellerLiveStream(sellerId, !currentVal);
  };

  const handleStatusChange = (seller: LivestockSeller, newStatus: SellerStatus) => {
    if (newStatus === "blocked") {
      setConfirmDialog({
        isOpen: true,
        variant: "warning",
        title: "تأكيد حظر المستخدم",
        description: `هل أنت متأكد أنك تريد حظر المستخدم ${seller.name}؟ بمجرد الحظر، لن يتمكن المستخدم من الوصول إلى الحساب أو إجراء أي عمليات داخل النظام`,
        confirmText: "تأكيد الحظر",
        onConfirm: async () => {
          setActionLoading(true);
          try {
            await listingsService.updateSellerStatus(seller.id, "blocked");
            setSellers((prev) =>
              prev.map((s) => (s.id === seller.id ? { ...s, status: "blocked" } : s))
            );
            if (selectedSeller?.id === seller.id) {
              setSelectedSeller((prev) => (prev ? { ...prev, status: "blocked" } : null));
            }
          } finally {
            setActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else if (newStatus === "active" && seller.status === "blocked") {
      setConfirmDialog({
        isOpen: true,
        variant: "unban",
        title: "تأكيد رفع حظر المستخدم",
        description: `هل تريد بالتأكيد رفع الحظر عن المستخدم ${seller.name}؟ سيتمكن المستخدم من الوصول إلى حسابه مجددًا فور رفع الحظر.`,
        confirmText: "تأكيد رفع الحظر",
        onConfirm: async () => {
          setActionLoading(true);
          try {
            await listingsService.updateSellerStatus(seller.id, "active");
            setSellers((prev) =>
              prev.map((s) => (s.id === seller.id ? { ...s, status: "active" } : s))
            );
            if (selectedSeller?.id === seller.id) {
              setSelectedSeller((prev) => (prev ? { ...prev, status: "active" } : null));
            }
          } finally {
            setActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else {
      setSellers((prev) =>
        prev.map((s) => (s.id === seller.id ? { ...s, status: newStatus } : s))
      );
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      listingsService.updateSellerStatus(seller.id, newStatus);
    }
  };

  const handleDeleteSeller = (seller: LivestockSeller) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف مستخدم",
      description: `هل انت متاكد انك تريد حذف مستخدم ${seller.name} هذا الاجراء سيؤدي لحذف المستخدم بشكل نهائي`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await listingsService.deleteSeller(seller.id);
          setSellers((prev) => prev.filter((s) => s.id !== seller.id));
          if (selectedSeller?.id === seller.id) {
            setSelectedSeller(null);
          }
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };



  // Dynamic Columns Configuration for DataTable
  const columns: Column<LivestockSeller>[] = [
    {
      key: "phone",
      header: "رقم الهاتف",
      sortable: true,
      align: "right",
      render: (seller) => (
        <span className="font-medium text-[#1E1E2D]">{seller.phone}</span>
      ),
    },
    {
      key: "email",
      header: "بريد الكتروني",
      sortable: true,
      align: "right",
      render: (seller) => (
        <span className="text-[#4A4E5A]">{seller.email}</span>
      ),
    },
    {
      key: "name",
      header: "اسم البائع",
      sortable: true,
      align: "right",
      render: (seller) => (
        <button
          type="button"
          onClick={() => setSelectedSeller(seller)}
          className="text-right font-bold text-[#1E1E2D] hover:text-[#B8860B] transition-colors cursor-pointer"
          title="عرض تفاصيل البائع"
        >
          {seller.name}
        </button>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      sortable: true,
      align: "center",
      render: (seller) => <StatusBadge status={seller.status} />,
    },
    {
      key: "auctions",
      header: "المزادات",
      sortable: true,
      align: "center",
      render: (seller) => (
        <ToggleSwitch
          checked={seller.isAuctionsEnabled}
          onChange={() => handleToggleAuctions(seller)}
          color="gold"
        />
      ),
    },
    {
      key: "auctionsCount",
      header: "عدد المزادات",
      sortable: true,
      align: "center",
      render: (seller) => (
        <span className="font-bold text-[#1E1E2D]">{seller.auctionsCount}</span>
      ),
    },
    {
      key: "liveStream",
      header: "البث المباشر",
      sortable: true,
      align: "center",
      render: (seller) => (
        <ToggleSwitch
          checked={seller.isLiveStreamEnabled}
          onChange={() => handleToggleLiveStream(seller.id, seller.isLiveStreamEnabled)}
          color="green"
        />
      ),
    },
    {
      key: "actions",
      header: "الاجراءات",
      align: "center",
      render: (seller) => (
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Delete Action (Red Trash Modal) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSeller(seller);
            }}
            title="حذف البائع"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Reject / Block Action (Gold Ban Modal) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(seller, "blocked");
            }}
            title="حظر البائع"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#F59E0B] hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <Ban className="h-4 w-4" />
          </button>

          {/* Cancel / Inactive Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(seller, "inactive");
            }}
            title="تعطيل الحساب"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#EF4444] hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Approve / Activate Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(seller, "active");
            }}
            title="تفعيل البائع"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#10B981] hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Header */}
      <Breadcrumb pageTitle="إدارة بائعي المواشي" />

      {/* 2. Top 4 Stat Cards from Service Config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardsConfig.map((card) => {
          const IconComponent = iconMap[card.iconName] || Users;
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


      {/* 2. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Card Title */}
        <h2 className="text-lg font-bold text-[#1E1E2D] mb-6">قائمة البائعين</h2>

        {/* Dynamic Reusable Table Toolbar (Search, Sort & Filter Tabs) */}
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

        {/* 3. Reusable Dynamic Data Table with onRowClick */}

        <DataTable<LivestockSeller>
          columns={columns}
          data={sellers}
          loading={loading}
          onRowClick={(seller) => setSelectedSeller(seller)}
          keyExtractor={(seller) => seller.id}
        />



        {/* 4. Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Dynamic Reusable Confirm Modal (Delete, Block, Unblock, Auctions activation) */}
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

      {/* Dynamic Reusable Seller Details Modal */}
      <SellerDetailsModal
        isOpen={Boolean(selectedSeller)}
        onClose={() => setSelectedSeller(null)}
        seller={selectedSeller}
        onToggleAuctions={(id, val) => {
          setSellers((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isAuctionsEnabled: val } : s))
          );
          setSelectedSeller((prev) =>
            prev && prev.id === id ? { ...prev, isAuctionsEnabled: val } : prev
          );
          listingsService.toggleSellerAuctions(id, val);
        }}
        onToggleLiveStream={(id, val) => {
          setSellers((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isLiveStreamEnabled: val } : s))
          );
          setSelectedSeller((prev) =>
            prev && prev.id === id ? { ...prev, isLiveStreamEnabled: val } : prev
          );
          listingsService.toggleSellerLiveStream(id, val);
        }}
        onStatusChange={(id, status) => {
          const s = sellers.find((x) => x.id === id);
          if (s) handleStatusChange(s, status);
        }}
      />

    </div>
  );
}

