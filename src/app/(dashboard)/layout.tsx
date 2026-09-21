"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n";
import { Sidebar, Header } from "@/components/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F5F9] text-[#1E1E2D]">
      {/* 1. Modular Sidebar Component */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Component */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Subheader / Breadcrumb bar */}
        <div className="bg-white border-b border-[#EDEEF2] px-6 py-2.5">
          <span className="text-xs font-semibold text-[#8E8E93]">{t("dashboard.title")}</span>
        </div>

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#F4F5F9]">
          <div className="animate-page">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
