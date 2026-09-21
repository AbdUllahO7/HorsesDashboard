import { ApiResponse } from "@/types/api";
import { Invoice, InvoiceItem, InvoiceQueryParams } from "./types";

export interface InvoicesResponseData {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const mockDefaultItems: InvoiceItem[] = [
  { id: "item-1", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
  { id: "item-2", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
  { id: "item-3", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
  { id: "item-4", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
  { id: "item-5", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
  { id: "item-6", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
  { id: "item-7", productName: "اسم المنتج", quantity: 5, unitPrice: 500, totalPrice: 5000 },
];

export const mockInvoicesList: Invoice[] = [
  {
    id: "inv-1",
    serialNumber: "#85974568",
    customerName: "محمد احمد",
    customerPhone: "+966501234567",
    sellerName: "متجر الخيل العربي",
    createdAt: "2024-05-10",
    createdAtHijri: "1445/11/02",
    totalAmount: 50000,
    itemsCount: 7,
    status: "paid",
    items: mockDefaultItems,
  },
  {
    id: "inv-2",
    serialNumber: "#85974568",
    customerName: "جمال علي",
    customerPhone: "+966509876543",
    sellerName: "مؤسسة الفروسية",
    createdAt: "2024-05-11",
    createdAtHijri: "1445/11/03",
    totalAmount: 50000,
    itemsCount: 7,
    status: "paid",
    items: mockDefaultItems,
  },
  {
    id: "inv-3",
    serialNumber: "#85974568",
    customerName: "محمود خير الله",
    customerPhone: "+966551122334",
    sellerName: "متجر المستلزمات الأصيلة",
    createdAt: "2024-05-12",
    createdAtHijri: "1445/11/04",
    totalAmount: 50000,
    itemsCount: 7,
    status: "paid",
    items: mockDefaultItems,
  },
  {
    id: "inv-4",
    serialNumber: "#85974568",
    customerName: "عبدالله السعيد",
    customerPhone: "+966543322110",
    sellerName: "خيول الجزيرة",
    createdAt: "2024-05-13",
    createdAtHijri: "1445/11/05",
    totalAmount: 50000,
    itemsCount: 7,
    status: "paid",
    items: mockDefaultItems,
  },
  {
    id: "inv-5",
    serialNumber: "#85974568",
    customerName: "خالد المنصور",
    customerPhone: "+966567788990",
    sellerName: "مربط الأصالة",
    createdAt: "2024-05-14",
    createdAtHijri: "1445/11/06",
    totalAmount: 50000,
    itemsCount: 7,
    status: "paid",
    items: mockDefaultItems,
  },
];

class InvoicesService {
  private invoices: Invoice[] = [...mockInvoicesList];

  async getInvoices(
    params: InvoiceQueryParams = {}
  ): Promise<ApiResponse<InvoicesResponseData>> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    let filtered = [...this.invoices];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.serialNumber.toLowerCase().includes(q) ||
          inv.customerName?.toLowerCase().includes(q) ||
          inv.sellerName?.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 4;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages,
      },
      message: "Loaded invoices successfully",
    };
  }

  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const invoice = this.invoices.find((inv) => inv.id === id) || this.invoices[0];
    return {
      success: true,
      data: invoice,
      message: "Loaded invoice details",
    };
  }

  async downloadInvoice(id: string): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const invoice = this.invoices.find((inv) => inv.id === id) || this.invoices[0];
    const fileName = `invoice-${invoice ? invoice.serialNumber.replace("#", "") : id}.pdf`;
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

