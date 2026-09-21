export interface DashboardOverviewStats {
  livestockSellersCount: number;
  suppliesSellersCount: number;
  customersCount: number;
  activeAuctionsCount: number;
  totalRevenue?: number;
  activeListingsCount?: number;
}

export interface AnalyticsStatCardItem {
  id: string;
  label: string;
  countKey: keyof DashboardOverviewStats;
  iconName: "Users" | "UsersRound" | "UserCheck" | "Gavel";
}

export interface PlatformGrowthDataPoint {
  month: string;
  value: number;
}

export interface AuctionCompletionTrendPoint {
  year: string;
  value: number; // in thousands or raw value
}

export interface TopAuctionItem {
  id: string;
  name: string;
  sellerName: string;
  viewsCount: number;
  bidsCount?: number;
  imageUrl?: string;
  category?: string;
}

export interface TopLiveStreamItem {
  id: string;
  name: string;
  sellerName: string;
  viewsCount: number;
  isLive: boolean;
  streamUrl?: string;
}
