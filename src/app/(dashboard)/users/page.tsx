import React from "react";
import { UserCheck, Filter, UserPlus } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1E1E2D]">إدارة المستخدمين والعملاء</h1>
          <p className="text-xs text-[#8E8E93] mt-1">إدارة حسابات العملاء، المشرفين والصلاحيات</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-[#EDEEF2] bg-white px-4 py-2 text-xs font-semibold text-[#1E1E2D] hover:border-[#B59E5F] transition-colors shadow-2xs">
            <Filter className="h-4 w-4 text-[#8E8E93]" />
            <span>تصفية</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#B59E5F] px-4 py-2 text-xs font-bold text-black hover:bg-[#A38B47] transition-colors shadow-xs">
            <UserPlus className="h-4 w-4" />
            <span>إضافة مستخدم</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EDEEF2] bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF4E8] border border-[#EADBBD] text-[#A6883C] mb-4">
          <UserCheck className="h-8 w-8" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-bold text-[#1E1E2D]">وحدة إدارة العملاء والمستخدمين</h3>
        <p className="text-xs text-[#8E8E93] max-w-sm mx-auto mt-2">
          تم تجهيز الـ Types والـ Services الخاصة بالمستخدمين داخل `src/features/users`.
        </p>
      </div>
    </div>
  );
}
