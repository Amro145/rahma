"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, Banknote } from "lucide-react";

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
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://backend.amroaltayeb14.workers.dev";

        const res = await fetch(`${backendUrl}/api/finance/summary`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const json = (await res.json()) as any;
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
            <div key={i} className="h-40 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
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
        <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Total Income</CardTitle>
            <div className="p-2.5 bg-teal-50 rounded-xl">
              <Banknote className="w-5 h-5 text-teal-700" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="text-3xl font-black text-slate-900">
              <span className="text-emerald-500 mr-1">+</span>${totalIncome.toLocaleString()}
            </div>
            <p className="text-sm text-slate-400 mt-2 font-medium">Includes student tuition payments</p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Total Expenses</CardTitle>
            <div className="p-2.5 bg-teal-50 rounded-xl">
              <Users className="w-5 h-5 text-teal-700" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="text-3xl font-black text-slate-900">
               <span className="text-red-600 mr-1">-</span>${totalExpenses.toLocaleString()}
            </div>
            <p className="text-sm text-slate-400 mt-2 font-medium">All registered financial outgoings</p>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className="rounded-2xl border-teal-600 shadow-sm hover:shadow-md transition-shadow bg-teal-700 text-white overflow-hidden relative">
          <div className="absolute -right-4 -top-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-semibold tracking-wide text-teal-100 uppercase">Net Balance</CardTitle>
            <div className="p-2.5 bg-teal-600 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2 relative z-10">
            <div className="text-4xl font-black text-white tracking-tight">
              ${currentBalance.toLocaleString()}
            </div>
            <p className="text-sm text-teal-200 mt-2 font-medium">Available capital across all domains</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
