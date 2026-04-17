"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse"></div>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Income */}
        <Card className="border-t-4 border-t-green-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-full">
              <ArrowUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Include student payments</p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-t-4 border-t-red-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-full">
              <ArrowDown className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All recorded expenses</p>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className="border-t-4 border-t-blue-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${currentBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Available funds</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
