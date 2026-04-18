"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMonth {
  monthIndex: number;
  status: "paid" | "unpaid" | "upcoming";
  amount: number;
  label: string;
}

interface PaymentCalendarProps {
  academicYear: number;
  paymentPlan: PaymentMonth[];
  totalBalanceDue: number;
  monthlyAmount: number;
  onPayMonth: (monthIndex: number) => Promise<void>;
}

export function PaymentCalendar({
  academicYear,
  paymentPlan,
  totalBalanceDue,
  monthlyAmount,
  onPayMonth,
}: PaymentCalendarProps) {
  const [submitting, setSubmitting] = useState<number | null>(null);

  const handlePay = async (monthIndex: number) => {
    setSubmitting(monthIndex);
    try {
      await onPayMonth(monthIndex);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border-slate-200 overflow-hidden md:col-span-2">
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-6">
            <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-teal-600" />
              تقويم دفع الرسوم - {academicYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentPlan.map((month) => (
                <div
                  key={month.monthIndex}
                  className={cn(
                    "flex flex-col p-4 rounded-2xl border transition-all duration-300",
                    month.status === "paid"
                      ? "bg-emerald-50 border-emerald-100"
                      : month.status === "unpaid"
                      ? "bg-red-50 border-red-100"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-black text-slate-700">{month.label}</span>
                    {month.status === "paid" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : month.status === "unpaid" ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-800">
                        {month.amount.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400">ج.م</span>
                    </div>

                    {month.status === "unpaid" && (
                      <Button
                        size="sm"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs h-8"
                        onClick={() => handlePay(month.monthIndex)}
                        disabled={submitting === month.monthIndex}
                      >
                        {submitting === month.monthIndex ? "جاري..." : "دفع الآن"}
                      </Button>
                    )}
                    
                    {month.status === "paid" && (
                      <Badge variant="outline" className="w-fit bg-emerald-100 text-emerald-700 border-none font-black text-[10px] px-2 py-0.5">
                        تم الدفع
                      </Badge>
                    )}

                    {month.status === "upcoming" && (
                      <Badge variant="outline" className="w-fit bg-slate-200 text-slate-500 border-none font-black text-[10px] px-2 py-0.5">
                        قادم
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-600 shadow-xl shadow-teal-100 border-none text-white overflow-hidden self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black opacity-80 uppercase tracking-widest">إجمالي المستحق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{totalBalanceDue.toLocaleString()}</span>
                <span className="text-xl font-bold opacity-80">ج.م</span>
              </div>
              
              <div className="pt-4 border-t border-white/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70 font-bold">رسوم الشهر:</span>
                  <span className="font-black">{monthlyAmount.toLocaleString()} ج.م</span>
                </div>
                <p className="text-xs opacity-60 mt-4 leading-relaxed font-medium">
                  يتم تحديث الرصيد المستحق تلقائياً بناءً على تقويم الدفع والشهور المنقضية.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
