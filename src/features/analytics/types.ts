export interface DashboardOverviewStats {
  livestockSellersCount: number;
  suppliesSellersCount: number;
  customersCount: number;
  activeAuctionsCount: number;
  totalRevenue?: number;
  activeListingsCount?: number;
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
