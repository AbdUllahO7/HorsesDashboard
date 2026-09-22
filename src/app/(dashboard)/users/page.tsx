"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Check,
  Ban,
  X,
  Trash2,
} from "lucide-react";
import { usersService } from "@/features/users/services";
import {
  CustomerUser,
  CustomerStats,
  CustomerStatus,
  CustomerFilterTabItem,
  CustomerStatCardItem,
} from "@/features/users/types";
import {
  customerFilterTabs,
  customerStatCardsConfig,
} from "@/features/users/services";
import { useTranslation } from "@/i18n";
import {
  StatCard,
  StatusBadge,
  Pagination,
  ConfirmModal,
  CustomerDetailsModal,
  ConfirmModalVariant,
  DataTable,
  Column,
  TableToolbar,
  Breadcrumb,
} from "@/components";

type StatusTab = "all" | CustomerStatus;

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

export default function CustomersPage() {
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [filterTabs, setFilterTabs] = useState<CustomerFilterTabItem[]>(customerFilterTabs);
  const [statCardsConfig, setStatCardsConfig] = useState<CustomerStatCardItem[]>(customerStatCardsConfig);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(4);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);
  const [detailedCustomer, setDetailedCustomer] = useState<CustomerUser | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
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
          usersService.getCustomersStats(),
          usersService.getFilterTabs(),
          usersService.getStatCardsConfig(),
        ]);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (tabsRes.success && tabsRes.data) setFilterTabs(tabsRes.data);
        if (cardsRes.success && cardsRes.data) setStatCardsConfig(cardsRes.data);
      } catch (err) {
        console.error("Failed to load customer metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  // Load Customers Table Data from service
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersService.getCustomers({
        page: currentPage,
        limit: 10,
        statusTab: activeTab,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setCustomers(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 4);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, currentPage]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Fetch full customer details when modal opens
  const openCustomerModal = useCallback(async (customer: CustomerUser) => {
    setSelectedCustomer(customer);
    setDetailedCustomer(customer); // show basic data immediately
    setDetailsLoading(true);
    try {
      const res = await usersService.getCustomerDetails(String(customer.id));
      if (res.success && res.data) {
        const raw = ((res.data as Record<string, unknown>).data ?? res.data) as Record<string, unknown>;
        setDetailedCustomer({
          ...customer,
          name:              String(raw.fullName ?? raw.name ?? raw.userName ?? customer.name),
          email:             String(raw.email ?? raw.profile_Email ?? customer.email),
          phone:             String(raw.phoneNumber ?? raw.phone_Number ?? customer.phone),
          address:           raw.address ? String(raw.address) : customer.address,
          bidsCount:         Number(raw.auctionsParticipated ?? raw.bidsCount ?? raw.totalBids ?? raw.auctionsCount ?? 0),
          ordersCount:       Number(raw.wonAuctionsCount ?? raw.ordersCount ?? raw.totalOrders ?? 0),
          totalSpent:        Number(raw.walletBalance ?? raw.totalSpent ?? raw.totalPurchases ?? 0),
          interactionsCount: Number(raw.liveCommentsCount ?? raw.interactionsCount ?? raw.interactions ?? customer.interactionsCount ?? 0),
          status:            raw.status !== undefined ? usersService.mapBackendToStatus(raw.status) : customer.status,
          joinedDate:        raw.createdAt ? String(raw.createdAt) : customer.joinedDate,
        });
      }
    } catch (err) {
      console.error("Failed to load customer details:", err);
    } finally {
      setDetailsLoading(false);
    }
  }, []);


  // Handlers for Status and Actions
  const handleStatusChange = (customer: CustomerUser, newStatus: CustomerStatus) => {
    if (newStatus === "blocked") {
      setConfirmDialog({
        isOpen: true,
        variant: "warning",
        title: "تأكيد حظر المستخدم",
        description: `هل أنت متأكد أنك تريد حظر المستخدم ${customer.name}؟ بمجرد الحظر، لن يتمكن المستخدم من الوصول إلى الحساب أو إجراء أي عمليات داخل النظام`,
        confirmText: "تأكيد الحظر",
        onConfirm: async () => {
          setActionLoading(true);
          try {
            await usersService.updateCustomerStatus(customer.id, "blocked");
            setCustomers((prev) =>
              prev.map((c) => (c.id === customer.id ? { ...c, status: "blocked" } : c))
            );
            if (selectedCustomer?.id === customer.id) {
              setSelectedCustomer((prev) => (prev ? { ...prev, status: "blocked" } : null));
            }
          } finally {
            setActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else if (newStatus === "active" && customer.status === "blocked") {
      setConfirmDialog({
        isOpen: true,
        variant: "unban",
        title: "تأكيد رفع حظر المستخدم",
        description: `هل تريد بالتأكيد رفع الحظر عن المستخدم ${customer.name}؟ سيتمكن المستخدم من الوصول إلى حسابه مجددًا فور رفع الحظر.`,
        confirmText: "تأكيد رفع الحظر",
        onConfirm: async () => {
          setActionLoading(true);
          try {
            await usersService.updateCustomerStatus(customer.id, "active");
            setCustomers((prev) =>
              prev.map((c) => (c.id === customer.id ? { ...c, status: "active" } : c))
            );
            if (selectedCustomer?.id === customer.id) {
              setSelectedCustomer((prev) => (prev ? { ...prev, status: "active" } : null));
            }
          } finally {
            setActionLoading(false);
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          }
        },
      });
    } else {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: newStatus } : c))
      );
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      usersService.updateCustomerStatus(customer.id, newStatus);
    }
  };

  const handleDeleteCustomer = (customer: CustomerUser) => {
    setConfirmDialog({
      isOpen: true,
      variant: "danger",
      title: "تأكيد حذف مستخدم",
      description: `هل انت متاكد انك تريد حذف مستخدم ${customer.name} هذا الاجراء سيؤدي لحذف المستخدم بشكل نهائي`,
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await usersService.deleteCustomer(customer.id);
          setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
          if (selectedCustomer?.id === customer.id) {
            setSelectedCustomer(null);
          }
        } finally {
          setActionLoading(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Dynamic Columns Configuration for DataTable
  const columns: Column<CustomerUser>[] = [
    {
      key: "phone",
      header: t("customers.phone", "رقم الهاتف"),
      sortable: true,
      align: "right",
      render: (customer) => (
        <span className="font-medium text-[#1E1E2D]" dir="ltr">{customer.phone}</span>
      ),
    },
    {
      key: "email",
      header: t("customers.email", "بريد الكتروني"),
      sortable: true,
      align: "right",
      render: (customer) => (
        <span className="text-[#4A4E5A]">{customer.email}</span>
      ),
    },
    {
      key: "name",
      header: t("customers.customerName", "اسم العميل"),
      sortable: true,
      align: "right",
      render: (customer) => (
        <button
          type="button"
          onClick={() => openCustomerModal(customer)}
          className="text-right font-bold text-[#1E1E2D] hover:text-[#B8860B] transition-colors cursor-pointer"
          title="عرض تفاصيل العميل"
        >
          {customer.name}
        </button>
      ),
    },
    {
      key: "status",
      header: t("common.status", "الحالة"),
      sortable: true,
      align: "center",
      render: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      key: "interactionsCount",
      header: t("customers.interactionsCount", "التفاعلات"),
      sortable: true,
      align: "center",
      render: (customer) => (
        <span className="font-bold text-[#1E1E2D]">{customer.interactionsCount}</span>
      ),
    },
    {
      key: "joinedDate",
      header: t("customers.joinedDate", "تاريخ الانضمام"),
      sortable: true,
      align: "center",
      render: (customer) => (
        <span className="text-[#4A4E5A]">{customer.joinedDate}</span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions", "الاجراءات"),
      align: "center",
      render: (customer) => (
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Delete Action (Red Trash Modal) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCustomer(customer);
            }}
            title="حذف العميل"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#B8860B] hover:bg-[#FAF4E6] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Reject / Block Action (Gold Ban Modal) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(customer, "blocked");
            }}
            title="حظر العميل"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#F59E0B] hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <Ban className="h-4 w-4" />
          </button>

          {/* Cancel / Inactive Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(customer, "inactive");
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
              handleStatusChange(customer, "active");
            }}
            title="تفعيل العميل"
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
      <Breadcrumb pageTitle={t("customers.title", "إدارة العملاء")} />

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

      {/* 3. Main Content Card */}
      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-6 shadow-2xs">
        {/* Card Title */}
        <h2 className="text-lg font-bold text-[#1E1E2D] mb-6">
          {t("customers.listTitle", "قائمة العملاء")}
        </h2>

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

        {/* Reusable Dynamic Data Table with onRowClick */}
        <DataTable<CustomerUser>
          columns={columns}
          data={customers}
          loading={loading}
          onRowClick={(customer) => openCustomerModal(customer)}
          keyExtractor={(customer) => customer.id}
        />

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          className="mt-6 border-t border-[#EDEEF2] pt-4"
        />
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={Boolean(selectedCustomer)}
        customer={detailedCustomer}
        loading={detailsLoading}
        onClose={() => {
          setSelectedCustomer(null);
          setDetailedCustomer(null);
        }}
        onStatusChange={(cust, status) => {
          handleStatusChange(cust, status);
        }}
        onDelete={(cust) => {
          handleDeleteCustomer(cust);
        }}
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
