export interface AccountingStats {
  totalSales: number;
  totalSubscriptions: number;
  totalServices: number;
}

export interface AccountingStatCardItem {
  id: string;
  label: string;
  countKey: keyof AccountingStats;
  iconName: "DollarSign" | "FileText" | "LayoutGrid";
}

export interface ProfitableServiceItem {
  id: string;
  serviceName: string;
  revenue: string;
}

export interface ActiveUserItem {
  id: string;
  userName: string;
  activityCount?: number;
}
