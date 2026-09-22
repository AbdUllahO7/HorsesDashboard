"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/core/hooks/useAuth";
import { authService } from "@/features/auth/services";
import { useTranslation } from "@/i18n";
import { Lock, Phone, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { AdminUser } from "@/types/common";

export default function LoginPage() {
  const { login } = useAuth();
  const { t, isRTL } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const trimmedPhone = phoneNumber.trim();
      const res = await authService.login({
        phone_Number: trimmedPhone,
        password: password,
        rememberMe: rememberMe,
      });

      if (res && (res.data || res.success)) {
        const responseData = res.data || res;
        const accessToken = responseData.accessToken || responseData.token;

        if (!accessToken) {
          throw new Error(res.message || t("auth.loginError"));
        }

        const role = responseData.roleName || responseData.role || "Admin";

        // Construct AdminUser object
        const adminUserData: AdminUser = {
          id: responseData.userId || responseData.id || "admin-user",
          name: responseData.fullName || responseData.name || "مدير النظام",
          email: responseData.email || `${trimmedPhone}@horses.market`,
          role: "super_admin",
          status: "active",
          permissions: ["all"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        login(
          {
            accessToken: accessToken,
            refreshToken: responseData.refreshToken,
          },
          adminUserData
        );
      } else {
        setErrorMessage(res.message || t("auth.loginError"));
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const msg = (err as Error)?.message || t("auth.loginError");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F4F5F9]">
      <div className="w-full max-w-md rounded-2xl border border-[#EDEEF2] bg-white p-8 shadow-sm">
        {/* Brand Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center mb-3">
            <Image
              src="/images/logo.png"
              alt="منصة الخيول"
              width={80}
              height={80}
              className="h-auto w-auto max-h-20 max-w-20 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1E1E2D]">{t("auth.title")}</h1>
          <p className="text-xs text-[#8E8E93] mt-1.5">{t("auth.subtitle")}</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number Field */}
          <div>
            <label className="block text-xs font-semibold text-[#4A4E5A] mb-1.5">
              {t("auth.phone")}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("auth.phonePlaceholder")}
                className="w-full rounded-xl border border-[#EDEEF2] bg-[#F3F4F8] px-4 py-3 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B59E5F] focus:bg-white transition-all text-right"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#4A4E5A]">
                {t("auth.password")}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#B59E5F] hover:text-[#9A8446] transition-colors"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#EDEEF2] bg-[#F3F4F8] px-4 py-3 pl-11 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B59E5F] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-[#8E8E93] hover:text-[#1E1E2D] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#EDEEF2] text-[#B59E5F] focus:ring-[#B59E5F] accent-[#B59E5F]"
              />
              <span className="text-xs text-[#8E8E93]">{t("auth.rememberMe")}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B59E5F] px-4 py-3 text-sm font-semibold text-black hover:bg-[#A38B47] transition-all cursor-pointer disabled:opacity-50 shadow-xs mt-2"
          >
            {loading ? t("auth.submitting") : t("auth.submit")}
            <ArrowIcon className="h-4 w-4" />
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-8 pt-5 border-t border-[#EDEEF2] flex items-center justify-center gap-2 text-[11px] text-[#8E8E93]">
          <ShieldCheck className="h-4 w-4 text-[#B59E5F]" />
          <span>منصة آمنة ومحمية ببروتوكولات تشفير متقدمة</span>
        </div>
      </div>
    </div>
  );
}
