import { ApiResponse } from "@/types/api";
import {
  UserAccountItem,
  AccountFilterParams,
  AccountsPaginationResponse,
} from "./types";

export const mockUserAccountsList: UserAccountItem[] = [
  {
    id: "acc-1",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-2",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-3",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-4",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-5",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-6",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-7",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-8",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-9",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-10",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
  {
    id: "acc-11",
    name: "محمود احمد",
    phone: "0595121088",
    email: "user@gmail.com",
    idFrontUrl: "/images/id-front.jpg",
    idBackUrl: "/images/id-back.jpg",
    selfieWithIdUrl: "/images/selfie-id.jpg",
    status: "pending",
    createdAt: "2025-05-25",
  },
];

class AccountsService {
  async getAccounts(
    params: AccountFilterParams = {}
  ): Promise<ApiResponse<AccountsPaginationResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let filtered = [...mockUserAccountsList];

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 11;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 4;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        items: items.length > 0 ? items : filtered,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  async approveAccount(id: string): Promise<ApiResponse<UserAccountItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockUserAccountsList.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, message: "Account not found", data: null as any };
    }
    mockUserAccountsList[index].status = "approved";
    return {
      success: true,
      data: mockUserAccountsList[index],
      message: "تم قبول وتفعيل حساب المستخدم بنجاح",
    };
  }

  async rejectAccount(id: string, reason?: string): Promise<ApiResponse<UserAccountItem>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = mockUserAccountsList.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, message: "Account not found", data: null as any };
    }
    mockUserAccountsList[index].status = "rejected";
    mockUserAccountsList[index].rejectionReason = reason;
    return {
      success: true,
      data: mockUserAccountsList[index],
      message: "تم رفض حساب المستخدم بنجاح",
    };
  }
}

export const accountsService = new AccountsService();
