"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services";
import { useTranslation } from "@/i18n";
import { Phone, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const trimmedPhone = phoneNumber.trim();
      const res = await authService.forgotPassword(trimmedPhone);

      if (res.success || res.data || res.message) {
        setSuccessMessage(t("auth.codeSent"));
        // Redirect to reset password page with prefilled phone number
        setTimeout(() => {
          router.push(`/reset-password?phone=${encodeURIComponent(trimmedPhone)}`);
        }, 1200);
      } else {
        setErrorMessage(res.message || "حدث خطأ أثناء إرسال رمز التحقق");
      }
    } catch (err: unknown) {
      console.error("Forgot password request failed:", err);
      const msg = (err as Error)?.message || "تعذر إرسال رمز التحقق، يرجى المحاولة لاحقاً";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackArrowIcon = isRTL ? ArrowRight : ArrowLeft;

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
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#B59E5F]/15 text-[#B59E5F] mb-3">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E1E2D]">{t("auth.forgotTitle")}</h1>
          <p className="text-xs text-[#8E8E93] mt-1.5 leading-relaxed">{t("auth.forgotSubtitle")}</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B59E5F] px-4 py-3 text-sm font-semibold text-black hover:bg-[#A38B47] transition-all cursor-pointer disabled:opacity-50 shadow-xs mt-2"
          >
            {loading ? t("auth.sendingOtp") : t("auth.sendOtp")}
            <ArrowIcon className="h-4 w-4" />
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 pt-5 border-t border-[#EDEEF2] text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B59E5F] hover:text-[#9A8446] transition-colors"
          >
            <BackArrowIcon className="h-3.5 w-3.5" />
            <span>{t("auth.backToLogin")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
