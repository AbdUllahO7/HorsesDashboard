"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/core/hooks/useAuth";
import { useTranslation } from "@/i18n";
import { Lock, Mail, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login("mock-jwt-token-admin-12345", {
        id: "admin-1",
        name: "تالية الهلاوي",
        email: email || "admin@horses-platform.com",
        role: "super_admin",
        status: "active",
        permissions: ["all"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F4F5F9]">
      <div className="w-full max-w-md rounded-2xl border border-[#EDEEF2] bg-white p-8 shadow-sm">
        {/* Brand Header with custom Logo */}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#4A4E5A] mb-2">
              {t("auth.email")}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@horses-platform.com"
                className="w-full rounded-xl border border-[#EDEEF2] bg-[#F3F4F8] px-4 py-3 pr-11 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B59E5F] focus:bg-white transition-all"
              />
              <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A4E5A] mb-2">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#EDEEF2] bg-[#F3F4F8] px-4 py-3 pr-11 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B59E5F] focus:bg-white transition-all"
              />
              <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B59E5F] px-4 py-3 text-sm font-semibold text-black hover:bg-[#A38B47] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {loading ? t("auth.submitting") : t("auth.submit")}
            <ArrowLeft className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
