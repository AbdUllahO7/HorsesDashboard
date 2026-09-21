/**
 * Standard API Response Structures
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BaseFilterParams extends PaginationParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
