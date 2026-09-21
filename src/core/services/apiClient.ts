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

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    try {
      const response = await fetch(fullUrl, {
        ...customConfig,
        headers: requestHeaders,
        signal: controller.signal,
        body: body ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized / Token Expiration
      if (response.status === 401 && typeof window !== "undefined") {
        // Clear token cookie & dispatch custom event or redirect
        document.cookie = `${apiConfig.cookieNames.auth}=; Max-Age=0; path=/;`;
        window.dispatchEvent(new CustomEvent("admin:unauthorized"));
      }

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse | null;
        throw new ApiError(
          errorData?.message || `HTTP Error ${response.status}: ${response.statusText}`,
          response.status,
          errorData?.errors
        );
      }

      return responseData as ApiResponse<T>;
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
