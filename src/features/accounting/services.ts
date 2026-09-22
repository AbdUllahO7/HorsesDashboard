import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
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
    label: "إجمالي الخدمات والعمليات",
    countKey: "totalServices",
    iconName: "LayoutGrid",
  },
];

class AccountingService {
  /**
   * Get Accounting KPI Stats from backend
   * Endpoint: GET /Admin/GetAccountingDashboard
   */
  async getStats(): Promise<ApiResponse<AccountingStats>> {
    try {
      const response = await apiClient.get<Record<string, unknown>>(
        apiConfig.endpoints.accounting.dashboard
      );

      const resData = (response.data || response) as Record<string, unknown>;
      const data = ((resData.data || resData.value || resData) as Record<string, unknown>) || {};

      const totalSales = Number(data.totalRevenue ?? data.totalSales ?? data.total_Sales ?? 0);
      const totalSubscriptions = Number(data.subscriptionRevenue ?? data.totalSubscriptions ?? data.total_Subscriptions ?? 0);
      const totalServices = Number(data.auctionRevenue ?? data.auctionsCount ?? data.totalServices ?? data.total_Services ?? 0);

      return {
        success: true,
        data: {
          totalSales,
          totalSubscriptions,
          totalServices,
        },
        message: "تم جلب البيانات المحاسبية من الخادم",
      };
    } catch (error) {
      console.error("Failed to load accounting stats from backend:", error);
      return {
        success: false,
        data: {
          totalSales: 0,
          totalSubscriptions: 0,
          totalServices: 0,
        },
        message: "فشل تحميل الإحصائيات المحاسبية من الخادم",
      };
    }
  }

  /**
   * Get Stat Cards Config
   */
  async getStatCardsConfig(): Promise<ApiResponse<AccountingStatCardItem[]>> {
    return {
      success: true,
      data: accountingStatCardsConfig,
      message: "Loaded stat cards config",
    };
  }

  /**
   * Get Top Profitable Services from backend
   * Endpoint: GET /Admin/GetAccountingDashboard
   */
  async getProfitableServices(): Promise<ApiResponse<ProfitableServiceItem[]>> {
    try {
      const response = await apiClient.get<Record<string, unknown>>(
        apiConfig.endpoints.accounting.dashboard
      );

      const resData = (response.data || response) as Record<string, unknown>;
      const data = ((resData.data || resData.value || resData) as Record<string, unknown>) || {};
      const rawList = (data.profitableServices || data.topProfitableServices || data.services || data.topServices) as Record<string, unknown>[] | undefined;

      if (Array.isArray(rawList) && rawList.length > 0) {
        const items: ProfitableServiceItem[] = rawList.map((s, i) => {
          const rev = s.revenue ?? s.amount ?? s.total ?? s.price ?? 0;
          return {
            id: String(s.id ?? s.serviceId ?? `srv-${i + 1}`),
            serviceName: String(s.name ?? s.serviceName ?? s.title ?? `خدمة #${i + 1}`),
            revenue: typeof rev === "number" ? `${rev.toLocaleString()} ` : String(rev),
          };
        });

        return {
          success: true,
          data: items,
          message: "تم جلب الخدمات الأكثر ربحاً من الخادم",
        };
      }

      // Map backend revenue breakdown streams
      const items: ProfitableServiceItem[] = [];

      if (data.subscriptionRevenue !== undefined) {
        items.push({
          id: "srv-subscription",
          serviceName: "إيرادات الاشتراكات والباقات",
          revenue: `${Number(data.subscriptionRevenue).toLocaleString()} `,
        });
      }

      if (data.auctionRevenue !== undefined) {
        items.push({
          id: "srv-auction",
          serviceName: "إيرادات وعمولات المزادات",
          revenue: `${Number(data.auctionRevenue).toLocaleString()} `,
        });
      }

      if (data.liveStreamRevenue !== undefined) {
        items.push({
          id: "srv-livestream",
          serviceName: "إيرادات البث المباشر",
          revenue: `${Number(data.liveStreamRevenue).toLocaleString()} `,
        });
      }

      if (data.advertisementRevenue !== undefined) {
        items.push({
          id: "srv-ads",
          serviceName: "إيرادات الإعلانات",
          revenue: `${Number(data.advertisementRevenue).toLocaleString()} `,
        });
      }

      return {
        success: true,
        data: items,
        message: "تم جلب الخدمات الأكثر ربحاً من الخادم",
      };
    } catch (error) {
      console.error("Failed to load profitable services:", error);
      return {
        success: false,
        data: [],
        message: "فشل تحميل قائمة الخدمات من الخادم",
      };
    }
  }

  /**
   * Get Most Active Users / Top Auctions from backend
   * Endpoint: GET /Admin/GetAccountingDashboard
   */
  async getActiveUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<{ items: ActiveUserItem[]; totalPages: number }>> {
    try {
      const response = await apiClient.get<Record<string, unknown>>(
        apiConfig.endpoints.accounting.dashboard
      );

      const resData = (response.data || response) as Record<string, unknown>;
      const data = ((resData.data || resData.value || resData) as Record<string, unknown>) || {};
      const rawList = (data.activeUsers || data.topActiveUsers || data.topUsers || data.users) as Record<string, unknown>[] | undefined;

      if (Array.isArray(rawList) && rawList.length > 0) {
        const items: ActiveUserItem[] = rawList.map((u, i) => ({
          id: String(u.id ?? u.userId ?? `usr-${i + 1}`),
          userName: String(u.name ?? u.fullName ?? u.userName ?? u.stableName ?? "مستخدم"),
          activityCount: Number(u.activityCount ?? u.ordersCount ?? u.auctionsCount ?? u.count ?? 0),
        }));

        const totalPages = Math.ceil(items.length / limit) || 1;
        const start = (page - 1) * limit;
        const paginatedUsers = items.slice(start, start + limit);

        return {
          success: true,
          data: {
            items: paginatedUsers,
            totalPages,
          },
          message: "تم جلب بيانات المستخدمين الأكثر نشاطاً من الخادم",
        };
      }

      // Map from topAuctions in the backend response
      const topAuctions = (data.topAuctions || data.top_Auctions || data.auctions) as Record<string, unknown>[] | undefined;
      if (Array.isArray(topAuctions) && topAuctions.length > 0) {
        const items: ActiveUserItem[] = topAuctions.map((auc, i) => {
          const owner = String(auc.ownerName || auc.owner || "بائع");
          const product = auc.productName ? ` (${String(auc.productName)})` : "";
          return {
            id: String(auc.auctionId ?? `auc-${i + 1}`),
            userName: `${owner}${product}`,
            activityCount: Number(auc.bidsCount ?? 0),
          };
        });

        const totalPages = Math.ceil(items.length / limit) || 1;
        const start = (page - 1) * limit;
        const paginatedUsers = items.slice(start, start + limit);

        return {
          success: true,
          data: {
            items: paginatedUsers,
            totalPages,
          },
          message: "تم جلب المستخدمين الأكثر نشاطاً من المزادات",
        };
      }

      return {
        success: true,
        data: {
          items: [],
          totalPages: 1,
        },
        message: "لا يوجد مستخدمين",
      };
    } catch (error) {
      console.error("Failed to load active users:", error);
      return {
        success: false,
        data: {
          items: [],
          totalPages: 1,
        },
        message: "فشل جلب قائمة المستخدمين من الخادم",
      };
    }
  }
}

export const accountingService = new AccountingService();
