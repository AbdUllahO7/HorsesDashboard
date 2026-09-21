import React from "react";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E2D]">إعدادات المنصة</h1>
          <p className="text-xs text-[#8E8E93] mt-1">تخصيص الخيارات العامة والربط مع المتجر</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#B59E5F] px-4 py-2 text-xs font-bold text-black hover:bg-[#A38B47] transition-colors shadow-xs">
          <Save className="h-4 w-4" />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF4E8] border border-[#EADBBD] text-[#A6883C] mb-4">
          <Settings className="h-8 w-8" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-bold text-[#1E1E2D]">إعدادات النظام العامة</h3>
        <p className="text-xs text-[#8E8E93] max-w-sm mx-auto mt-2">
          إعدادات الربط مع الـ API والـ Storefront ومفاتيح التوثيق.
        </p>
      </div>
    </div>
  );
}
