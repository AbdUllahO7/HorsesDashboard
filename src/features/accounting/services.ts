import { ApiResponse } from "@/types/api";
import {
  AccountingStats,
  AccountingStatCardItem,
  ProfitableServiceItem,
  ActiveUserItem,
} from "./types";

export const accountingStatCardsConfig: AccountingStatCardItem[] = [
  {
    id: "sales",
    label: "إجمالي المبيعات",
    countKey: "totalSales",
    iconName: "DollarSign",
  },
  {
    id: "subscriptions",
    label: "إجمالي الإشتراكات",
    countKey: "totalSubscriptions",
    iconName: "FileText",
  },
  {
    id: "services",
    label: "إجمالي الخدمات",
    countKey: "totalServices",
    iconName: "LayoutGrid",
  },
];

export const mockAccountingStats: AccountingStats = {
  totalSales: 55,
  totalSubscriptions: 55,
  totalServices: 55,
};

export const mockProfitableServices: ProfitableServiceItem[] = [
  {
    id: "srv-1",
    serviceName: "اسم الخدمة",
    revenue: "3000$",
  },
  {
    id: "srv-2",
    serviceName: "اسم الخدمة",
    revenue: "3000$",
  },
  {
    id: "srv-3",
    serviceName: "اسم الخدمة",
    revenue: "3000$",
  },
];

export const mockActiveUsers: ActiveUserItem[] = [
  {
    id: "usr-1",
    userName: "محمد احمد",
    activityCount: 45,
  },
  {
    id: "usr-2",
    userName: "جمال علي",
    activityCount: 38,
  },
  {
    id: "usr-3",
    userName: "محمود خير الله",
    activityCount: 32,
  },
];

class AccountingService {
  async getStats(): Promise<ApiResponse<AccountingStats>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: mockAccountingStats,
      message: "Loaded accounting stats",
    };
  }

  async getStatCardsConfig(): Promise<ApiResponse<AccountingStatCardItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return {
      success: true,
      data: accountingStatCardsConfig,
      message: "Loaded stat cards config",
    };
  }

  async getProfitableServices(): Promise<ApiResponse<ProfitableServiceItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return {
      success: true,
      data: mockProfitableServices,
      message: "Loaded profitable services",
    };
  }

  async getActiveUsers(): Promise<ApiResponse<ActiveUserItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return {
      success: true,
      data: mockActiveUsers,
      message: "Loaded active users",
    };
  }
}

export const accountingService = new AccountingService();
