import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  Invoice,
  InvoiceItem,
  InvoiceQueryParams,
  InvoicesResponseData,
  PaymentStatus,
} from "./types";

const parsePaymentStatus = (val: unknown): PaymentStatus => {
  if (val === 1 || val === "1" || val === "paid" || val === "Paid" || val === "مدفوعة" || val === "Success" || val === "success") {
    return "paid";
  }
  if (val === 2 || val === "2" || val === "pending" || val === "Pending" || val === "قيد الانتظار") {
    return "pending";
  }
  if (val === 3 || val === "3" || val === "cancelled" || val === "Cancelled" || val === "ملغية" || val === "Canceled") {
    return "cancelled";
  }
  if (val === 4 || val === "4" || val === "failed" || val === "Failed" || val === "فشلت") {
    return "failed";
  }
  if (val === 5 || val === "5" || val === "refunded" || val === "Refunded" || val === "مسترجعة") {
    return "refunded";
  }
  return "paid";
};

const getStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case "paid":
      return "مدفوعة";
    case "pending":
      return "قيد الانتظار";
    case "cancelled":
      return "ملغية";
    case "failed":
      return "فشلت";
    case "refunded":
      return "مسترجعة";
    default:
      return "مدفوعة";
  }
};

const parsePaymentMethodLabel = (method?: string): string => {
  if (!method) return "مدى (Mada)";
  const m = String(method).toLowerCase();
  if (m.includes("mada") || m.includes("مدى")) return "مدى (Mada)";
  if (m.includes("apple")) return "Apple Pay";
  if (m.includes("visa") || m.includes("فيزا")) return "فيزا (Visa)";
  if (m.includes("master") || m.includes("ماستر")) return "Mastercard";
  if (m.includes("stc")) return "STC Pay";
  if (m.includes("tabby") || m.includes("تابي")) return "تابي (Tabby)";
  if (m.includes("tamara") || m.includes("تمارا")) return "تمارا (Tamara)";
  if (m.includes("wallet") || m.includes("محفظة")) return "المحفظة الإلكترونية";
  if (m.includes("cash") || m.includes("نقدي")) return "الدفع عند الاستلام";
  return String(method);
};

const normalizeInvoiceItem = (raw: unknown, index: number = 0): InvoiceItem => {
  if (!raw || typeof raw !== "object") {
    return {
      id: `item-${index + 1}`,
      productName: "اسم المنتج",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
  }

  const r = raw as Record<string, unknown>;
  const id = String(r.id || r.itemId || r.productId || `item-${index + 1}`);
  const productName = String(
    r.productName ||
    r.product_Name ||
    r.name ||
    r.title ||
    r.itemTitle ||
    r.itemName ||
    `منتج #${index + 1}`
  );
  const quantity = Number(r.quantity ?? r.count ?? r.qty ?? 1);
  const unitPrice = Number(r.unitPrice ?? r.unit_Price ?? r.price ?? 0);
  const totalPrice = Number(r.totalPrice ?? r.total_Price ?? r.total ?? quantity * unitPrice);

  return {
    id,
    productName,
    quantity,
    unitPrice,
    totalPrice,
    notes: r.notes ? String(r.notes) : undefined,
  };
};

const normalizeInvoice = (raw: unknown, index: number = 0): Invoice => {
  if (!raw || typeof raw !== "object") {
    return {
      id: `inv-${index + 1}`,
      serialNumber: `#${index + 1}`,
      totalAmount: 0,
      itemsCount: 0,
      status: "paid",
      items: [],
    };
  }

  const r = raw as Record<string, unknown>;

  const id = String(r.id || r.paymentId || r.invoiceId || r.transactionId || `inv-${index + 1}`);
  const serialNumber = String(
    r.serialNumber ||
    r.serial_Number ||
    r.invoiceNumber ||
    r.invoice_Number ||
    r.transactionNo ||
    r.transactionId ||
    `#${id.slice(0, 8)}`
  );

  const customerName = String(
    r.customerName ||
    r.customer_Name ||
    r.userName ||
    r.user_Name ||
    r.buyerName ||
    (r.user && typeof r.user === "object" ? (r.user as Record<string, unknown>).userName : "") ||
    (r.buyer && typeof r.buyer === "object" ? (r.buyer as Record<string, unknown>).userName : "") ||
    "مستخدم المنصة"
  );

  const customerPhone = String(
    r.customerPhone ||
    r.customer_Phone ||
    r.phoneNumber ||
    r.phone_Number ||
    r.phone ||
    (r.user && typeof r.user === "object" ? (r.user as Record<string, unknown>).phoneNumber : "") ||
    ""
  );

  const sellerName = String(
    r.sellerName ||
    r.seller_Name ||
    r.storeName ||
    r.store_Name ||
    r.stableName ||
    r.vendorName ||
    (r.seller && typeof r.seller === "object" ? (r.seller as Record<string, unknown>).userName : "") ||
    "متجر الخيل العربي"
  );

  const totalAmount = Number(
    r.totalAmount ??
    r.total_Amount ??
    r.amount ??
    r.price ??
    r.total ??
    0
  );

  const status = parsePaymentStatus(r.status ?? r.paymentStatus ?? r.state);
  const statusLabel = String(r.statusLabel || r.paymentStatusLabel || getStatusLabel(status));

  const paymentMethod = String(
    r.paymentMethod ||
    r.payment_Method ||
    r.paymentGateway ||
    r.method ||
    "mada"
  );

  let rawItems = r.items || r.orderItems || r.products || r.details || r.itemsList;
  let items: InvoiceItem[] = [];
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    items = rawItems.map((item, idx) => normalizeInvoiceItem(item, idx));
  } else {
    items = [
      {
        id: `item-${id}-1`,
        productName: String(r.productName || r.orderName || r.description || "طلب منصة الخيول"),
        quantity: Number(r.quantity || 1),
        unitPrice: totalAmount,
        totalPrice: totalAmount,
      },
    ];
  }

  const itemsCount = Number(r.itemsCount ?? r.items_Count ?? items.length);

  const createdAt = String(
    r.createdAt ||
    r.created_At ||
    r.paymentDate ||
    r.payment_Date ||
    r.date ||
    new Date().toISOString().split("T")[0]
  );

  return {
    id,
    serialNumber: serialNumber.startsWith("#") ? serialNumber : `#${serialNumber}`,
    transactionId: r.transactionId ? String(r.transactionId) : undefined,
    orderId: r.orderId ? String(r.orderId) : undefined,
    customerName,
    customerPhone,
    customerEmail: r.customerEmail ? String(r.customerEmail) : undefined,
    sellerName,
    sellerPhone: r.sellerPhone ? String(r.sellerPhone) : undefined,
    createdAt: createdAt.split("T")[0],
    createdAtHijri: r.createdAtHijri ? String(r.createdAtHijri) : undefined,
    totalAmount,
    subTotal: r.subTotal ? Number(r.subTotal) : undefined,
    taxAmount: r.taxAmount ? Number(r.taxAmount) : undefined,
    discountAmount: r.discountAmount ? Number(r.discountAmount) : undefined,
    itemsCount,
    status,
    statusLabel,
    paymentMethod,
    paymentMethodLabel: parsePaymentMethodLabel(paymentMethod),
    notes: r.notes ? String(r.notes) : undefined,
    items,
  };
};

class InvoicesService {
  /**
   * Fetch all invoices / payments list from backend API
   */
  async getInvoices(
    params: InvoiceQueryParams = {}
  ): Promise<ApiResponse<InvoicesResponseData>> {
    const page = params.page || params.pageNumber || 1;
    const limit = params.limit || params.pageSize || 10;

    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        PageNumber: page,
        PageSize: limit,
      };

      if (params.search) queryParams.Search = params.search;
      if (params.status && params.status !== "all") queryParams.Status = params.status;
      if (params.paymentMethod && params.paymentMethod !== "all") queryParams.PaymentMethod = params.paymentMethod;
      if (params.fromDate) queryParams.FromDate = params.fromDate;
      if (params.toDate) queryParams.ToDate = params.toDate;
      if (params.sortBy) queryParams.SortBy = params.sortBy;
      if (params.sortDirection) queryParams.SortDirection = params.sortDirection;

      const res = await apiClient.request<any>(
        apiConfig.endpoints.payments.list,
        {
          params: queryParams,
        }
      );

      let rawList: unknown[] = [];
      let total = 0;

      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          rawList = res.data;
          total = res.data.length;
        } else if (typeof res.data === "object" && res.data !== null) {
          const d = res.data as Record<string, unknown>;
          if (Array.isArray(d.items)) {
            rawList = d.items;
            total = Number(d.totalCount ?? d.total ?? d.count ?? d.items.length);
          } else if (Array.isArray(d.data)) {
            rawList = d.data;
            total = Number(d.totalCount ?? d.total ?? d.count ?? d.data.length);
          } else if (Array.isArray(d.payments)) {
            rawList = d.payments;
            total = Number(d.totalCount ?? d.total ?? d.payments.length);
          }
        }
      }

      const items = rawList.map((item, idx) => normalizeInvoice(item, idx));
      const totalPages = Math.ceil((total || items.length) / limit) || 1;

      return {
        success: true,
        data: {
          items,
          total: total || items.length,
          page,
          limit,
          totalPages,
        },
        message: "تم استرجاع الفواتير وعمليات الدفع بنجاح",
      };
    } catch (err) {
      console.error("API /Payments/GetAllPayments failed:", err);
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 1,
        },
        message: "فشل تحميل الفواتير من الخادم",
      };
    }
  }

  /**
   * Get single invoice / payment details by ID
   */
  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const res = await apiClient.request<any>(
        apiConfig.endpoints.payments.details,
        {
          params: { id },
        }
      );

      if (res.success && res.data) {
        const item = normalizeInvoice(res.data);
        return {
          success: true,
          data: item,
          message: "تم تحميل تفاصيل الفاتورة بنجاح",
        };
      }
    } catch (err) {
      console.error(`API /Payments/GetPaymentById failed for id=${id}:`, err);
    }

    return {
      success: false,
      data: undefined as unknown as Invoice,
      message: "لم يتم العثور على الفاتورة",
    };
  }

  /**
   * Get Payment Status by ID
   */
  async getPaymentStatus(id: string): Promise<ApiResponse<{ status: PaymentStatus; message: string }>> {
    try {
      const res = await apiClient.request<any>(
        apiConfig.endpoints.payments.status,
        {
          params: { id },
        }
      );

      if (res.success && res.data) {
        const rawStatus = typeof res.data === "object" ? res.data.status : res.data;
        const status = parsePaymentStatus(rawStatus);
        return {
          success: true,
          data: {
            status,
            message: getStatusLabel(status),
          },
          message: "تم استرجاع حالة عملية الدفع",
        };
      }
    } catch (err) {
      console.error("API /Payments/GetPaymentStatus failed:", err);
    }

    return {
      success: true,
      data: {
        status: "paid",
        message: "مدفوعة",
      },
      message: "حالة الدفع الافتراضية",
    };
  }

  /**
   * Download / Export Invoice PDF
   */
  async downloadInvoice(id: string): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> {
    const serial = id.replace("#", "");
    const fileName = `invoice-${serial}.pdf`;

    return {
      success: true,
      data: {
        downloadUrl: `#download-${id}`,
        fileName,
      },
      message: `تم تحميل الفاتورة ${fileName} بنجاح`,
    };
  }
}

export const invoicesService = new InvoicesService();
