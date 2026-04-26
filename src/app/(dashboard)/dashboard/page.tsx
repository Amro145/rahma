"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Banknote, UserPlus, FilePlus, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type SummaryData = {
  totalStudents: number;
  finance: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
};

export default function DashboardPage() {
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false);
  const [isSpecialDonationDialogOpen, setIsSpecialDonationDialogOpen] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", whatsapp: "", requiredAmount: "", faculty: "medicine", semester: "1" });
  const [financeForm, setFinanceForm] = useState({ type: "income" as "income" | "expense", amount: "", category: "", description: "" });
  const [specialDonationForm, setSpecialDonationForm] = useState({ donorName: "", amount: "" });

  const { data, isLoading, mutate: fetchSummary } = useSWR<SummaryData>(
    "/api/finance/summary",
    () => apiFetch<SummaryData>("/api/finance/summary")
  );

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name: studentForm.name,
          whatsapp: studentForm.whatsapp,
          requiredAmount: Number(studentForm.requiredAmount),
          faculty: studentForm.faculty,
          semester: studentForm.semester,
        }),
      });
      setIsStudentDialogOpen(false);
      setStudentForm({ name: "", whatsapp: "", requiredAmount: "", faculty: "medicine", semester: "1" });
      toast.success("تمت إضافة الطالب بنجاح");
      fetchSummary();
    } catch {
      toast.error("فشل إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/api/finance/logs", {
        method: "POST",
        body: JSON.stringify({
          type: financeForm.type,
          amount: Number(financeForm.amount),
          category: financeForm.category,
          description: financeForm.description || "",
        }),
      });
      setIsFinanceDialogOpen(false);
      setFinanceForm({ type: "income", amount: "", category: "", description: "" });
      toast.success("تم تسجيل العملية بنجاح");
      fetchSummary();
    } catch {
      toast.error("فشل تسجيل العملية");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSpecialDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/api/special-donations", {
        method: "POST",
        body: JSON.stringify({
          donorName: specialDonationForm.donorName,
          amount: Number(specialDonationForm.amount),
        }),
      });
      setIsSpecialDonationDialogOpen(false);
      setSpecialDonationForm({ donorName: "", amount: "" });
      toast.success("تمت إضافة التبرع بنجاح");
      fetchSummary();
    } catch {
      toast.error("فشل إضافة التبرع");
    } finally {
      setSubmitting(false);
    }
  };

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

        <Card className="rounded-2xl md:rounded-[2rem] border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-slate-900 shadow-slate-400/20 relative md:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-teal-500/20 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 blur-2xl md:blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-8 pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs md:text-sm font-black tracking-widest text-teal-100 uppercase">صافي الرصيد</CardTitle>
            <div className="p-2 md:p-3 bg-teal-600/50 rounded-xl md:rounded-2xl backdrop-blur-md">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8 pt-2 relative z-10">
            <div className="text-2xl md:text-5xl font-black text-white tracking-tighter gap-1 flex items-baseline">
              <span>{(data?.finance.netBalance || 0).toLocaleString()}</span>
              <span className="text-sm md:text-xl font-bold text-teal-300 mr-1 md:mr-2 uppercase">ج.م</span>
            </div>
            <p className="text-xs md:text-sm text-teal-100 mt-2 md:mt-4 font-bold">الرصيد المتاح حالياً</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          
          <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
            <DialogTrigger render={
                <Button className="h-16 md:h-20 w-full bg-white border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-2xl md:rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center transition-all duration-300 group">
                    <UserPlus className="w-5 h-5 md:w-6 md:h-6 mb-1 group-hover:scale-110 transition-transform text-teal-600" />
                    <span className="font-black text-xs md:text-sm">إضافة طالب جديد</span>
                </Button>
            } />
            <DialogContent className="sm:max-w-md rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 font-[--font-cairo] max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">طالب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">اسم الطالب</Label>
                  <Input required className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="الاسم الكامل..." value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">رقم الواتساب</Label>
                  <Input required className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="2012..." value={studentForm.whatsapp} onChange={e => setStudentForm({...studentForm, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">المبلغ المطلوب</Label>
                  <Input required type="number" className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="500..." value={studentForm.requiredAmount} onChange={e => setStudentForm({...studentForm, requiredAmount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">الكلية</Label>
                  <select
                    required
                    className="w-full rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 px-3 md:px-4 font-bold focus:outline-none focus:border-teal-500 text-sm md:text-base"
                    value={studentForm.faculty}
                    onChange={(e) => setStudentForm({ ...studentForm, faculty: e.target.value })}
                  >
                    <option value="medicine">طب</option>
                    <option value="dentistry">طب أسنان</option>
                    <option value="engineering">هندسة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">الفرقة الدراسية</Label>
                  <select
                    required
                    className="w-full rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 px-3 md:px-4 font-bold focus:outline-none focus:border-teal-500 text-sm md:text-base"
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                  >
                    <option value="1">الفرقة الأولى</option>
                    <option value="2">الفرقة الثانية</option>
                    <option value="3">الفرقة الثالثة</option>
                    <option value="4">الفرقة الرابعة</option>
                    <option value="5">الفرقة الخامسة</option>
                    <option value="6">الفرقة السادسة</option>
                  </select>
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-11 md:h-14 bg-teal-600 rounded-xl md:rounded-2xl font-black text-sm md:text-base text-white">
                  {submitting ? "جاري الحفظ..." : "حفظ بيانات الطالب"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isFinanceDialogOpen} onOpenChange={setIsFinanceDialogOpen}>
            <DialogTrigger render={
                <Button className="h-16 md:h-20 w-full bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl md:rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center transition-all duration-300 group">
                    <FilePlus className="w-5 h-5 md:w-6 md:h-6 mb-1 group-hover:scale-110 transition-transform text-emerald-600" />
                    <span className="font-black text-xs md:text-sm">تسجيل حركة مالية</span>
                </Button>
            } />
            <DialogContent className="sm:max-w-md rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 font-[--font-cairo] max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">تسجيل حركة مالية</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFinance} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
                <div className="flex gap-2 md:gap-4">
                  <label className={`flex-1 flex items-center justify-center p-2 md:p-3 border-2 rounded-xl md:rounded-2xl cursor-pointer text-xs md:text-sm ${financeForm.type === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-100'}`}>
                    <input type="radio" className="sr-only" checked={financeForm.type === 'income'} onChange={() => setFinanceForm({...financeForm, type: 'income'})} />
                    <span className="font-black">إيراد</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-2 md:p-3 border-2 rounded-xl md:rounded-2xl cursor-pointer text-xs md:text-sm ${financeForm.type === 'expense' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-100'}`}>
                    <input type="radio" className="sr-only" checked={financeForm.type === 'expense'} onChange={() => setFinanceForm({...financeForm, type: 'expense'})} />
                    <span className="font-black">مصروف</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">التصنيف</Label>
                  <Input required className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="تبرع، إيجار..." value={financeForm.category} onChange={e => setFinanceForm({...financeForm, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">المبلغ</Label>
                  <Input required type="number" className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="0.00" value={financeForm.amount} onChange={e => setFinanceForm({...financeForm, amount: e.target.value})} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-11 md:h-14 bg-teal-600 rounded-xl md:rounded-2xl font-black text-sm md:text-base text-white">
                  {submitting ? "جاري الحفظ..." : "حفظ السجل المالي"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isSpecialDonationDialogOpen} onOpenChange={setIsSpecialDonationDialogOpen}>
            <DialogTrigger render={
                <Button className="h-16 md:h-20 w-full bg-white border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-2xl md:rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center transition-all duration-300 group">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 mb-1 group-hover:scale-110 transition-transform text-rose-500" />
                    <span className="font-black text-xs md:text-sm">إضافة متبرع خاص</span>
                </Button>
            } />
            <DialogContent className="sm:max-w-md rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 font-[--font-cairo] max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">إضافة متبرع خاص</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSpecialDonation} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">اسم المتبرع</Label>
                  <Input required className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="الاسم الكامل..." value={specialDonationForm.donorName} onChange={e => setSpecialDonationForm({...specialDonationForm, donorName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">المبلغ</Label>
                  <Input required type="number" className="rounded-xl md:rounded-2xl h-11 md:h-12 border-slate-200" placeholder="0.00" value={specialDonationForm.amount} onChange={e => setSpecialDonationForm({...specialDonationForm, amount: e.target.value})} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-11 md:h-14 bg-rose-500 hover:bg-rose-600 rounded-xl md:rounded-2xl font-black text-sm md:text-base text-white">
                  {submitting ? "جاري الحفظ..." : "حفظ التبرع"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
}
