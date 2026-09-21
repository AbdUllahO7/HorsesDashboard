import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import { AdminUser } from "@/types/common";
import { LoginCredentials, AuthResponseData } from "./types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> => {
    return apiClient.post<AuthResponseData>(apiConfig.endpoints.auth.login, credentials, {
      skipAuth: true,
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<AdminUser>> => {
    return apiClient.get<AdminUser>(apiConfig.endpoints.auth.me);
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return apiClient.post<void>(apiConfig.endpoints.auth.logout);
  },
};
