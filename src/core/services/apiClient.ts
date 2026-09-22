import { apiConfig } from "@/config/api.config";
import { ApiResponse, ApiErrorResponse } from "@/types/api";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Standardized Fetch API Client with token management & error handling
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = apiConfig.baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${apiConfig.cookieNames.auth}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private buildUrl(endpoint: string, params?: RequestOptions["params"]): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, body, headers, token, skipAuth = false, ...customConfig } = options;

    const fullUrl = this.buildUrl(endpoint, params);
    const authToken = token || (!skipAuth ? this.getToken() : null);

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const requestHeaders: Record<string, string> = {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      "Accept-Language": "ar",
      lang: "ar",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers as Record<string, string>),
    };

    if (isFormData) {
      delete requestHeaders["Content-Type"];
      delete requestHeaders["content-type"];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...customConfig,
        headers: requestHeaders,
        signal: controller.signal,
        body: isFormData
          ? (body as FormData)
          : body !== null && body !== undefined
          ? JSON.stringify(body)
          : customConfig.method === "POST" || customConfig.method === "PUT" || customConfig.method === "PATCH"
          ? JSON.stringify({})
          : undefined,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401 && typeof window !== "undefined") {
        document.cookie = `${apiConfig.cookieNames.auth}=; Max-Age=0; path=/;`;
        window.dispatchEvent(new CustomEvent("admin:unauthorized"));
      }

      const responseData = await response.json().catch(() => null);

      // Check for 405 session termination inside response body as per backend contract
      if (responseData && (responseData.statusCode === 405 || responseData.status === 405)) {
        if (typeof window !== "undefined") {
          document.cookie = `${apiConfig.cookieNames.auth}=; Max-Age=0; path=/;`;
          window.dispatchEvent(new CustomEvent("admin:unauthorized"));
        }
        throw new ApiError(
          responseData.message || "انتهت الجلسة، يرجى إعادة تسجيل الدخول",
          405
        );
      }

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse | null;
        throw new ApiError(
          errorData?.message || `HTTP Error ${response.status}: ${response.statusText}`,
          response.status,
          errorData?.errors
        );
      }

      // Normalize successful response structure
      let isSuccess = true;
      let dataPayload: any = responseData;
      let message = "";

      if (responseData && typeof responseData === "object") {
        if ("statusCode" in responseData) {
          isSuccess = Number(responseData.statusCode) >= 200 && Number(responseData.statusCode) < 300;
        } else if ("isSuccess" in responseData) {
          isSuccess = Boolean(responseData.isSuccess);
        } else if ("success" in responseData) {
          isSuccess = Boolean(responseData.success);
        }

        if ("data" in responseData) {
          dataPayload = responseData.data;
        } else if ("result" in responseData) {
          dataPayload = responseData.result;
        }

        if ("message" in responseData) {
          message = String(responseData.message || "");
        }
      }

      return {
        success: isSuccess,
        message,
        data: (dataPayload !== undefined ? dataPayload : responseData) as T,
        ...(responseData && typeof responseData === "object" ? responseData : {}),
      } as ApiResponse<T>;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as { name?: string }).name === "AbortError") {
        throw new ApiError("انتهت مهلة الطلب (Request Timeout)", 408);
      }
      throw new ApiError(
        (error as Error)?.message || "حدث خطأ غير متوقع أثناء الاتصال بالخادم",
        500
      );
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
