"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Banknote } from "lucide-react";
import { apiFetch } from "@/lib/api";

type SummaryData = {
  totalStudents: number;
  finance: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
};

export default function DashboardPage() {
  const { data, isLoading, mutate: fetchSummary } = useSWR<SummaryData>(
    "/api/finance/summary",
    () => apiFetch<SummaryData>("/api/finance/summary")
  );



  if (isLoading) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 md:h-40 rounded-2xl md:rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
          ))}
        </div>
        <div className="mt-6 md:mt-8 h-48 md:h-64 rounded-2xl md:rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="rounded-2xl md:rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-8 pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-black tracking-widest text-slate-400 uppercase">إجمالي الإيرادات</CardTitle>
            <div className="p-2 md:p-3 bg-emerald-50 rounded-xl md:rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <Banknote className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-2">
            <div className="text-2xl md:text-4xl font-black text-slate-900 flex items-center gap-1">
              <span className="text-emerald-500 font-bold tracking-tighter text-lg md:text-2xl">+</span>
              <span>{(data?.finance.totalIncome || 0).toLocaleString()}</span>
              <span className="text-xs md:text-lg font-bold text-slate-300 mr-1 md:mr-2 uppercase">ج.م</span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-4 font-bold">تشمل رسوم الطلاب والتبرعات</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-8 pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-black tracking-widest text-slate-400 uppercase">إجمالي المصروفات</CardTitle>
            <div className="p-2 md:p-3 bg-red-50 rounded-xl md:rounded-2xl group-hover:bg-red-100 transition-colors">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-2">
            <div className="text-2xl md:text-4xl font-black text-slate-900 flex items-center gap-1">
              <span className="text-red-500 font-bold tracking-tighter text-lg md:text-2xl">-</span>
              <span>{(data?.finance.totalExpenses || 0).toLocaleString()}</span>
              <span className="text-xs md:text-lg font-bold text-slate-300 mr-1 md:mr-2 uppercase">ج.م</span>
            </div>
            <div className="mt-2 md:mt-4 flex items-center gap-2">
              <span className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <span className="h-full bg-emerald-500 block w-full"></span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:rounded-[2rem] border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-slate-900 shadow-slate-400/20 relative col-span-full md:col-span-1">
          <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-[#B38E2D]/20 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 blur-2xl md:blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-8 pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs md:text-sm font-black tracking-widest text-[#B38E2D]/80 uppercase">صافي الرصيد</CardTitle>
            <div className="p-2 md:p-3 bg-[#B38E2D]/50 rounded-xl md:rounded-2xl backdrop-blur-md">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-2 relative z-10">
            <div className="text-2xl md:text-5xl font-black text-white tracking-tighter gap-1 flex items-baseline">
              <span>{(data?.finance.netBalance || 0).toLocaleString()}</span>
              <span className="text-sm md:text-xl font-bold text-[#D4A843] mr-1 md:mr-2 uppercase">ج.م</span>
            </div>
            <p className="text-xs md:text-sm text-[#B38E2D]/80 mt-2 md:mt-4 font-bold">الرصيد المتاح حالياً</p>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
