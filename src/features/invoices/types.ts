export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  serialNumber: string; // e.g. "#85974568"
  customerName?: string;
  customerPhone?: string;
  sellerName?: string;
  createdAt?: string;
  createdAtHijri?: string;
  totalAmount: number;
  itemsCount: number;
  status: "paid" | "pending" | "cancelled";
  items: InvoiceItem[];
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
