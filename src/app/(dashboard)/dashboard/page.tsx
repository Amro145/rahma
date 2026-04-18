"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, Banknote } from "lucide-react";
import { apiFetch } from "@/lib/api";

type SummaryData = {
  summary: {
    students: {
      totalRequired: number;
      totalCollected: number;
      pending: number;
    };
    finances: {
      totalIncome: number;
      totalExpenses: number;
      netBalance: number;
    };
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const json = await apiFetch<SummaryData>("/api/finance/summary");
        setData(json);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalIncome =
    (data?.summary.students.totalCollected || 0) +
    (data?.summary.finances.totalIncome || 0);
  const totalExpenses = data?.summary.finances.totalExpenses || 0;
  const currentBalance = data?.summary.finances.netBalance || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Income */}
        <Card className="rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-2 space-y-0">
            <CardTitle className="text-sm font-black tracking-widest text-slate-400 uppercase">إجمالي الإيرادات</CardTitle>
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <Banknote className="w-6 h-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="text-4xl font-black text-slate-900 flex items-center gap-1">
              <span className="text-emerald-500 font-bold tracking-tighter text-2xl truncate">+</span>
              <span>{totalIncome.toLocaleString()}</span>
              <span className="text-lg font-bold text-slate-300 mr-2">ج.م</span>
            </div>
            <p className="text-sm text-slate-400 mt-4 font-bold">تشمل رسوم الطلاب والتبرعات</p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-2 space-y-0">
            <CardTitle className="text-sm font-black tracking-widest text-slate-400 uppercase">إجمالي المصروفات</CardTitle>
            <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-colors">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="text-4xl font-black text-slate-900 flex items-center gap-1">
              <span className="text-red-500 font-bold tracking-tighter text-2xl">-</span>
              <span>{totalExpenses.toLocaleString()}</span>
              <span className="text-lg font-bold text-slate-300 mr-2">ج.م</span>
            </div>
            <p className="text-sm text-slate-400 mt-4 font-bold">كافة المصاريف التشغيلية المسجلة</p>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className="rounded-[2rem] border-teal-600 shadow-2xl hover:shadow-teal-200/50 transition-all duration-300 bg-teal-700 text-white overflow-hidden relative group">
          <div className="absolute -left-4 -top-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="w-40 h-40" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-black tracking-widest text-teal-100 uppercase">صافي الرصيد</CardTitle>
            <div className="p-3 bg-teal-600/50 rounded-2xl backdrop-blur-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2 relative z-10">
            <div className="text-5xl font-black text-white tracking-tighter gap-1 flex items-baseline">
              <span>{currentBalance.toLocaleString()}</span>
              <span className="text-xl font-bold text-teal-300 mr-2 uppercase">ج.م</span>
            </div>
            <p className="text-sm text-teal-100 mt-4 font-bold">الرصيد المتاح حالياً في الخزينة</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
