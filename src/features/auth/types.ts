import { AdminUser } from "@/types/common";

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface AuthResponseData {
  token: string;
  refreshToken?: string;
  user: AdminUser;
  expiresAt: string;
}
