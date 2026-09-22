import { apiClient } from "@/core/services/apiClient";
import { apiConfig } from "@/config/api.config";
import { ApiResponse } from "@/types/api";
import {
  LoginCredentials,
  LoginResponseData,
  VerifyOtpDto,
  ResendOtpDto,
  ResetPasswordDto,
} from "./types";

export const authService = {
  /**
   * Admin Login using phone number and password
   * Endpoint: POST /api/Auth/Login
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> => {
    return apiClient.post<LoginResponseData>(
      apiConfig.endpoints.auth.login,
      {
        phone_Number: credentials.phone_Number,
        password: credentials.password,
      },
      { skipAuth: true }
    );
  },

  /**
   * Refresh Token
   * Endpoint: POST /api/Auth/RefreshToken?RefreshToken={token}
   */
  refreshToken: async (token: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    return apiClient.post<{ accessToken: string; refreshToken: string }>(
      apiConfig.endpoints.auth.refreshToken,
      null,
      {
        params: { RefreshToken: token },
        skipAuth: true,
      }
    );
  },

  /**
   * Admin Logout
   * Endpoint: POST /api/Auth/Logout?RefreshToken={token}
   */
  logout: async (refreshToken?: string): Promise<ApiResponse<void>> => {
    return apiClient.post<void>(
      apiConfig.endpoints.auth.logout,
      null,
      {
        params: refreshToken ? { RefreshToken: refreshToken } : undefined,
      }
    );
  },

  /**
   * Request OTP code for forgot password
   * Endpoint: POST /api/Auth/ForgotPassword?PhoneNumber={phone}
   */
  forgotPassword: async (phoneNumber: string): Promise<ApiResponse<string | boolean>> => {
    return apiClient.post<string | boolean>(
      apiConfig.endpoints.auth.forgotPassword,
      null,
      {
        params: { PhoneNumber: phoneNumber },
        skipAuth: true,
      }
    );
  },

  /**
   * Verify OTP Code
   * Endpoint: POST /api/Auth/VerifyOtp
   */
  verifyOtp: async (dto: VerifyOtpDto): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(
      apiConfig.endpoints.auth.verifyOtp,
      dto,
      { skipAuth: true }
    );
  },

  /**
   * Resend OTP Code
   * Endpoint: POST /api/Auth/ResendOtp
   */
  resendOtp: async (dto: ResendOtpDto): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(
      apiConfig.endpoints.auth.resendOtp,
      dto,
      { skipAuth: true }
    );
  },

  /**
   * Reset Password with OTP code
   * Endpoint: POST /api/Auth/ResetPassword
   */
  resetPassword: async (dto: ResetPasswordDto): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(
      apiConfig.endpoints.auth.resetPassword,
      dto,
      { skipAuth: true }
    );
  },

  /**
   * Get Verification Data
   * Endpoint: GET /api/Auth/GetMyVerificationData
   */
  getMyVerificationData: async (): Promise<ApiResponse<unknown>> => {
    return apiClient.get<unknown>(apiConfig.endpoints.auth.verificationData);
  },
};
