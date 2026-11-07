"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Volume2, VolumeX, ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { accountsService } from "@/features/accounts/services";
import { reportsService } from "@/features/reports/services";
import { playNotificationChime } from "@/core/utils/soundAlert";
import { cn } from "@/core/utils/cn";

export function LiveUrgentAlerts() {
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState<number>(0);
  const [urgentReportsCount, setUrgentReportsCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastCountsRef = useRef<{ verifications: number; reports: number }>({ verifications: 0, reports: 0 });

  // Initialize sound preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("camel_admin_alert_sound");
      if (stored !== null) setSoundEnabled(stored === "true");
    } catch {
      // ignore
    }
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("camel_admin_alert_sound", String(next));
    } catch {
      // ignore
    }
    if (next) {
      playNotificationChime();
    }
  };

  const fetchUrgentCounts = useCallback(async () => {
    try {
      setLoading(true);
      const [accountsRes, reportsRes] = await Promise.allSettled([
        accountsService.getAccounts({ page: 1, limit: 10, status: "pending" }),
        reportsService.getReports({ page: 1, limit: 10 }),
      ]);

      let newVerifCount = 0;
      let newReportsCount = 0;

      if (accountsRes.status === "fulfilled" && accountsRes.value.success && accountsRes.value.data) {
        newVerifCount = accountsRes.value.data.pagination?.total ?? accountsRes.value.data.items?.length ?? 0;
      }

      if (reportsRes.status === "fulfilled" && reportsRes.value.success && reportsRes.value.data) {
        newReportsCount = reportsRes.value.data.pagination?.total ?? reportsRes.value.data.items?.length ?? 0;
      }

      // If new alerts arrived and sound enabled, trigger audio chime
      if (
        soundEnabled &&
        (newVerifCount > lastCountsRef.current.verifications ||
          newReportsCount > lastCountsRef.current.reports) &&
        (lastCountsRef.current.verifications > 0 || lastCountsRef.current.reports > 0)
      ) {
        playNotificationChime();
      }

      lastCountsRef.current = { verifications: newVerifCount, reports: newReportsCount };
      setPendingVerificationsCount(newVerifCount);
      setUrgentReportsCount(newReportsCount);
    } catch (err) {
      console.debug("Failed to check live urgent alerts:", err);
    } finally {
      setLoading(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    fetchUrgentCounts();
    // Poll gently every 40 seconds for live updates
    const timer = setInterval(fetchUrgentCounts, 40000);
    return () => clearInterval(timer);
  }, [fetchUrgentCounts]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const totalUrgent = pendingVerificationsCount + urgentReportsCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bar */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border shadow-2xs",
            totalUrgent > 0
              ? "bg-[#FAF4EB] border-[#E0CEBE] text-[#8B5E3C] hover:bg-[#F5ECE0]"
              : "bg-white border-[#ECE4D9] text-[#8F7E72] hover:bg-[#FAF6EF]"
          )}
          title="طلبات التوثيق والبلاغات العاجلة"
        >
          {/* Animated dot indicator */}
          <span className="relative flex h-2 w-2">
            {totalUrgent > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C88F45] opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                totalUrgent > 0 ? "bg-[#8B5E3C]" : "bg-emerald-500"
              )}
            />
          </span>

          <span className="hidden md:inline text-[11px] font-bold">
            {totalUrgent > 0 ? `تنبيهات عاجلة (${totalUrgent})` : "النظام مستقر"}
          </span>

          {/* Verification Pill */}
          {pendingVerificationsCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#8B5E3C]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#8B5E3C]">
              <ShieldCheck className="h-3 w-3" />
              <span>{pendingVerificationsCount} توثيق</span>
            </span>
          )}

          {/* Reports Pill */}
          {urgentReportsCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
              <ShieldAlert className="h-3 w-3" />
              <span>{urgentReportsCount} بلاغ</span>
            </span>
          )}

          <ChevronDown
            className={cn("h-3 w-3 transition-transform text-[#8F7E72]", isOpen && "rotate-180")}
          />
        </button>

        {/* Audio notification toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className={cn(
            "p-1.5 rounded-lg border text-xs transition-colors cursor-pointer",
            soundEnabled
              ? "border-[#E0CEBE] bg-[#FAF4EB] text-[#8B5E3C] hover:bg-[#F0E3D3]"
              : "border-[#ECE4D9] bg-white text-[#8F7E72] hover:bg-[#FAF6EF]"
          )}
          title={soundEnabled ? "كتم صوت التنبيهات" : "تفعيل صوت التنبيهات"}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 opacity-60" />}
        </button>
      </div>

      {/* Flyout / Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-11 start-0 z-50 w-76 sm:w-84 rounded-2xl border border-[#ECE4D9] bg-white p-3 shadow-xl animate-fade-in text-right">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#ECE4D9] px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2F241C]">مراقبة البلاغات والتوثيق</span>
              <span className="text-[10px] rounded-full bg-[#FAF4EB] text-[#8B5E3C] px-2 py-0.5 font-bold">
                مباشر
              </span>
            </div>
            <button
              onClick={() => fetchUrgentCounts()}
              disabled={loading}
              className="text-[10px] font-semibold text-[#8B5E3C] hover:underline cursor-pointer disabled:opacity-50"
            >
              {loading ? "تحديث..." : "تحديث فوري"}
            </button>
          </div>

          <div className="space-y-2 py-2">
            {/* Account Verifications Item */}
            <Link
              href="/accounts"
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex items-center justify-between p-2.5 rounded-xl border transition-all",
                pendingVerificationsCount > 0
                  ? "border-[#E0CEBE] bg-[#FAF4EB]/60 hover:bg-[#FAF4EB]"
                  : "border-transparent bg-[#FCFAF7] hover:bg-[#F8F4EF]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    pendingVerificationsCount > 0
                      ? "bg-[#8B5E3C] text-white shadow-2xs"
                      : "bg-[#ECE4D9] text-[#8F7E72]"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2F241C] group-hover:text-[#8B5E3C] transition-colors">
                    توثيق حسابات البائعين
                  </p>
                  <p className="text-[10px] text-[#8F7E72]">
                    {pendingVerificationsCount > 0
                      ? `${pendingVerificationsCount} طلبات بانتظار المراجعة والاعتماد`
                      : "جميع الطلبات مكتملة"}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-extrabold",
                  pendingVerificationsCount > 0
                    ? "bg-[#8B5E3C] text-white"
                    : "bg-emerald-50 text-emerald-600"
                )}
              >
                {pendingVerificationsCount > 0 ? pendingVerificationsCount : "✓"}
              </span>
            </Link>

            {/* Reports & Tickets Item */}
            <Link
              href="/tickets"
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex items-center justify-between p-2.5 rounded-xl border transition-all",
                urgentReportsCount > 0
                  ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                  : "border-transparent bg-[#FCFAF7] hover:bg-[#F8F4EF]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    urgentReportsCount > 0
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "bg-[#ECE4D9] text-[#8F7E72]"
                  )}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2F241C] group-hover:text-rose-700 transition-colors">
                    البلاغات ومخالفات البث
                  </p>
                  <p className="text-[10px] text-[#8F7E72]">
                    {urgentReportsCount > 0
                      ? `${urgentReportsCount} شكاوى وبلاغات تتطلب اتخاذ إجراء`
                      : "لا توجد بلاغات معلقة"}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-extrabold",
                  urgentReportsCount > 0
                    ? "bg-rose-600 text-white"
                    : "bg-emerald-50 text-emerald-600"
                )}
              >
                {urgentReportsCount > 0 ? urgentReportsCount : "✓"}
              </span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#ECE4D9] flex items-center justify-between text-[10px] text-[#8F7E72]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8B5E3C]" />
              <span>فحص آلي كل 40 ثانية</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>مراقبة مستمرة</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
