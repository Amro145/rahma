"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, Banknote, UserPlus, FilePlus, Building2, ArrowLeft } from "lucide-react";
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
import { organization, useSession } from "@/lib/auth.client";

type SummaryData = {
  totalStudents: number;
  finance: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
  };
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const activeOrgId = session?.session?.activeOrganizationId;

  const [noOrg, setNoOrg] = useState(false);

  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", whatsapp: "", requiredAmount: "" });
  const [financeForm, setFinanceForm] = useState({ type: "income" as "income" | "expense", amount: "", category: "", description: "" });

  const { data, isLoading, mutate: fetchSummary } = useSWR<SummaryData>(
    activeOrgId ? `/api/finance/summary?orgId=${activeOrgId}` : null,
    async () => {
      try {
        const json = await apiFetch<SummaryData>("/api/finance/summary", { orgId: activeOrgId as string });
        setNoOrg(false);
        return json;
      } catch (err: unknown) {
        if (err instanceof Error && err.message?.includes("مؤسسة")) {
          setNoOrg(true);
        }
        throw err;
      }
    }
  );

  useEffect(() => {
    if (session && !activeOrgId) {
       setNoOrg(true);
    } else if (activeOrgId) {
       setNoOrg(false);
    }
  }, [session, activeOrgId]);

  const loading = isLoading && !noOrg;

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/students", {
        method: "POST",
        orgId: activeOrgId,
        body: JSON.stringify({
          name: studentForm.name,
          whatsapp: studentForm.whatsapp,
          requiredAmount: Number(studentForm.requiredAmount),
        }),
      });
      setIsStudentDialogOpen(false);
      setStudentForm({ name: "", whatsapp: "", requiredAmount: "" });
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
    if (!activeOrgId) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/finance/logs", {
        method: "POST",
        orgId: activeOrgId,
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

  if (loading) {
    return (
      <div className="space-y-8 h-full flex flex-col">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
          ))}
        </div>
        <div className="mt-8 h-64 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
      </div>
    );
  }

  if (noOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-teal-50/50 p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center mb-6">
          <Building2 className="w-12 h-12 text-teal-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">أهلاً بك في منصة رحمة</h2>
        <p className="text-slate-500 font-bold max-w-md mx-auto mb-10 leading-relaxed">
          يرجى اختيار المؤسسة المطلوبة من القائمة الجانبية للبدء في إدارة شؤون الطلاب والعمليات المالية.
        </p>
        
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl text-slate-600 font-black text-sm">
          <ArrowLeft className="w-4 h-4 ml-2 animate-bounce-horizontal" />
          استخدم القائمة الجانبية لاختيار المؤسسة
        </div>
      </div>
    );
  }

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
              <span className="text-emerald-500 font-bold tracking-tighter text-2xl">+</span>
              <span>{(data?.finance.totalIncome || 0).toLocaleString()}</span>
              <span className="text-lg font-bold text-slate-300 mr-2 uppercase">ج.م</span>
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
              <span>{(data?.finance.totalExpenses || 0).toLocaleString()}</span>
              <span className="text-lg font-bold text-slate-300 mr-2 uppercase">ج.م</span>
              <span className="text-sm md:text-lg font-bold text-slate-400">ج.م</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <span className="h-full bg-emerald-500 block w-full"></span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Net Balance (Important for Mobile) */}
        <Card className="rounded-[2rem] border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-slate-900 shadow-slate-400/20 relative md:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between p-6 md:p-8 pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs md:text-sm font-black tracking-widest text-teal-100 uppercase">صافي الرصيد</CardTitle>
            <div className="p-3 bg-teal-600/50 rounded-2xl backdrop-blur-md">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-2 relative z-10">
            <div className="text-3xl md:text-5xl font-black text-white tracking-tighter gap-1 flex items-baseline">
              <span>{(data?.finance.netBalance || 0).toLocaleString()}</span>
              <span className="text-lg md:text-xl font-bold text-teal-300 mr-2 uppercase">ج.م</span>
            </div>
            <p className="text-xs md:text-sm text-teal-100 mt-4 font-bold">الرصيد المتاح حالياً</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          
          <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
            <DialogTrigger render={
                <Button className="h-20 w-full bg-white border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center transition-all duration-300 group">
                    <UserPlus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform text-teal-600" />
                    <span className="font-black text-sm">إضافة طالب جديد</span>
                </Button>
            } />
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 text-right">طالب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">اسم الطالب</Label>
                  <Input required className="rounded-2xl h-12 border-slate-200" placeholder="الاسم الكامل..." value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">رقم الواتساب</Label>
                  <Input required className="rounded-2xl h-12 border-slate-200" placeholder="2012..." value={studentForm.whatsapp} onChange={e => setStudentForm({...studentForm, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">المبلغ المطلوب</Label>
                  <Input required type="number" className="rounded-2xl h-12 border-slate-200" placeholder="500..." value={studentForm.requiredAmount} onChange={e => setStudentForm({...studentForm, requiredAmount: e.target.value})} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 rounded-2xl font-black text-white">
                  {submitting ? "جاري الحفظ..." : "حفظ بيانات الطالب"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isFinanceDialogOpen} onOpenChange={setIsFinanceDialogOpen}>
            <DialogTrigger render={
                <Button className="h-20 w-full bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center transition-all duration-300 group">
                    <FilePlus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform text-emerald-600" />
                    <span className="font-black text-sm">تسجيل حركة مالية</span>
                </Button>
            } />
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 text-right">تسجيل حركة مالية</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFinance} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-2xl cursor-pointer ${financeForm.type === 'income' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-100'}`}>
                    <input type="radio" className="sr-only" checked={financeForm.type === 'income'} onChange={() => setFinanceForm({...financeForm, type: 'income'})} />
                    <span className="font-black text-sm">إيراد</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center p-3 border-2 rounded-2xl cursor-pointer ${financeForm.type === 'expense' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-100'}`}>
                    <input type="radio" className="sr-only" checked={financeForm.type === 'expense'} onChange={() => setFinanceForm({...financeForm, type: 'expense'})} />
                    <span className="font-black text-sm">مصروف</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">التصنيف</Label>
                  <Input required className="rounded-2xl h-12 border-slate-200" placeholder="تبرع، إيجار..." value={financeForm.category} onChange={e => setFinanceForm({...financeForm, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-xs uppercase text-right block">المبلغ</Label>
                  <Input required type="number" className="rounded-2xl h-12 border-slate-200" placeholder="0.00" value={financeForm.amount} onChange={e => setFinanceForm({...financeForm, amount: e.target.value})} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 rounded-2xl font-black text-white">
                  {submitting ? "جاري الحفظ..." : "حفظ السجل المالي"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
}
