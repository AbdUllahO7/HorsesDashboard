import { AdminUser } from "@/types/common";

export interface LoginCredentials {
  phone_Number: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponseData {
  id?: string;
  userId?: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  phone_Number?: string;
  email?: string;
  roleName?: string;
  role?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  isVerified?: boolean;
}

export interface AuthResponseData {
  token: string;
  refreshToken?: string;
  user: AdminUser;
  expiresAt?: string;
}

export interface ForgotPasswordDto {
  phoneNumber: string;
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
}

export interface ResendOtpDto {
  phoneNumber: string;
}

export interface ResetPasswordDto {
  phoneNumber: string;
  otpCode: string;
  newPassword: string;
}
