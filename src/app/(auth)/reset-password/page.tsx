"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/features/auth/services";
import { useTranslation } from "@/i18n";
import {
  Lock,
  Phone,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useTranslation();

  const initialPhone = searchParams.get("phone") || "";

  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending || !phoneNumber.trim()) return;
    setErrorMessage(null);
    setResending(true);

    try {
      const res = await authService.resendOtp({
        phoneNumber: phoneNumber.trim(),
      });

      if (res.success || res.message) {
        setSuccessMessage(t("auth.codeSent"));
        setResendTimer(60);
      } else {
        setErrorMessage(res.message || "تعذر إعادة إرسال الرمز");
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "تعذر إعادة إرسال الرمز";
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  // Handle Reset Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage(t("auth.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("يجب ألا تقل كلمة المرور عن 6 خانات");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword({
        phoneNumber: phoneNumber.trim(),
        otpCode: otpCode.trim(),
        newPassword: newPassword,
      });

      if (res.success || res.message || res.data) {
        setSuccessMessage(t("auth.resetSuccess"));
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setErrorMessage(res.message || "تعذر تعيين كلمة المرور، يرجى التأكد من الرمز");
      }
    } catch (err: unknown) {
      console.error("Reset password failed:", err);
      const msg = (err as Error)?.message || "فشلت العملية، يرجى التأكد من الرمز والبيانات المدخلة";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const BackArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#EDEEF2] bg-white p-8 shadow-sm">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex h-20 w-20 items-center justify-center mb-2">
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
        <h1 className="text-2xl font-bold text-[#1E1E2D]">{t("auth.otpTitle")}</h1>
        <p className="text-xs text-[#8E8E93] mt-1.5 leading-relaxed">{t("auth.otpSubtitle")}</p>
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

        {/* OTP Code Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#4A4E5A]">
              {t("auth.otpCode")}
            </label>
            <button
              type="button"
              disabled={resendTimer > 0 || resending}
              onClick={handleResendOtp}
              className="text-xs font-medium text-[#B59E5F] hover:text-[#9A8446] disabled:text-[#8E8E93] transition-colors inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <RotateCcw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
              {resendTimer > 0 ? `${t("auth.resendCode")} (${resendTimer}s)` : t("auth.resendCode")}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              required
              dir="ltr"
              maxLength={10}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder={t("auth.otpPlaceholder")}
              className="w-full tracking-widest text-center font-bold rounded-xl border border-[#EDEEF2] bg-[#F3F4F8] px-4 py-3 text-sm text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B59E5F] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* New Password Field */}
        <div>
          <label className="block text-xs font-semibold text-[#4A4E5A] mb-1.5">
            {t("auth.newPassword")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-semibold text-[#4A4E5A] mb-1.5">
            {t("auth.confirmPassword")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#EDEEF2] bg-[#F3F4F8] px-4 py-3 pl-11 text-xs text-[#1E1E2D] placeholder-[#8E8E93] outline-none focus:border-[#B59E5F] focus:bg-white transition-all"
            />
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B59E5F] px-4 py-3 text-sm font-semibold text-black hover:bg-[#A38B47] transition-all cursor-pointer disabled:opacity-50 shadow-xs mt-3"
        >
          {loading ? t("auth.resetting") : t("auth.resetSubmit")}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F4F5F9]">
      <Suspense fallback={<div className="text-center text-xs text-[#8E8E93]">جاري التحميل...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
