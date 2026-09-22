export type PaymentStatus = "paid" | "pending" | "cancelled" | "failed" | "refunded";

export type PaymentMethod =
  | "mada"
  | "visa"
  | "mastercard"
  | "apple_pay"
  | "stc_pay"
  | "tabby"
  | "tamara"
  | "wallet"
  | "cash"
  | string;

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  serialNumber: string; // e.g. "#85974568"
  transactionId?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  sellerName?: string;
  sellerPhone?: string;
  createdAt?: string;
  createdAtHijri?: string;
  totalAmount: number;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  itemsCount: number;
  status: PaymentStatus;
  statusLabel?: string;
  paymentMethod?: PaymentMethod;
  paymentMethodLabel?: string;
  notes?: string;
  items: InvoiceItem[];
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface InvoicesResponseData {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
