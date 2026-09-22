"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AdminUser } from "@/types/common";
import { apiConfig } from "@/config/api.config";
import { authService } from "@/features/auth/services";
import { useRouter } from "next/navigation";

export interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken?: string }, user: AdminUser) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${apiConfig.cookieNames.auth}=`))
        ?.split("=")[1];

      if (!token) {
        setUser(null);
        return;
      }

      const storedUser = localStorage.getItem("horses_admin_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("horses_admin_user");
      localStorage.removeItem("horses_admin_refresh_token");
      router.push("/login");
    };

    window.addEventListener("admin:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", handleUnauthorized);
  }, [checkAuth, router]);

  const login = (tokens: { accessToken: string; refreshToken?: string }, userData: AdminUser) => {
    document.cookie = `${apiConfig.cookieNames.auth}=${tokens.accessToken}; path=/; max-age=604800; SameSite=Lax;`;
    if (tokens.refreshToken) {
      document.cookie = `${apiConfig.cookieNames.refresh}=${tokens.refreshToken}; path=/; max-age=2592000; SameSite=Lax;`;
      localStorage.setItem("horses_admin_refresh_token", tokens.refreshToken);
    }
    localStorage.setItem("horses_admin_user", JSON.stringify(userData));
    setUser(userData);
    router.push("/");
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("horses_admin_refresh_token") || undefined;
      await authService.logout(refreshToken).catch(() => {});
    } finally {
      document.cookie = `${apiConfig.cookieNames.auth}=; path=/; max-age=0;`;
      document.cookie = `${apiConfig.cookieNames.refresh}=; path=/; max-age=0;`;
      localStorage.removeItem("horses_admin_user");
      localStorage.removeItem("horses_admin_refresh_token");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
