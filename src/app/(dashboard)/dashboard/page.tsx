"use client";

import { useEffect, useState, useCallback } from "react";
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

  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noOrg, setNoOrg] = useState(false);

  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", whatsapp: "", requiredAmount: "" });
  const [financeForm, setFinanceForm] = useState({ type: "income" as "income" | "expense", amount: "", category: "", description: "" });
  const [orgName, setOrgName] = useState("");

  const fetchSummary = useCallback(async () => {
    if (!activeOrgId) {
       setNoOrg(true);
       setLoading(false);
       return;
    }
    try {
      const json = await apiFetch<SummaryData>("/api/finance/summary", {
        orgId: activeOrgId
      });
      setData(json);
      setNoOrg(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes("مؤسسة")) {
        setNoOrg(true);
      }
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    if (session) {
      fetchSummary();
    }
  }, [fetchSummary, session]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: newOrg, error } = await organization.create({
        name: orgName,
        slug: orgName.toLowerCase().replace(/\s+/g, '-'),
      });
      if (error) throw error;
      
      toast.success("تم إنشاء المؤسسة بنجاح");
      if (newOrg?.id) {
        await organization.setActive({ organizationId: newOrg.id });
        window.location.reload();
      }
    } catch {
      toast.error("فشل إنشاء المؤسسة");
    } finally {
      setSubmitting(false);
    }
  };

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
          للبدء في إدارة شؤون الطلاب والعمليات المالية، يرجى إنشاء مؤسستك الأولى أو اختيار واحدة من القائمة الجانبية.
        </p>
        
        <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
          <DialogTrigger render={
            <Button className="h-16 px-10 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-black shadow-xl shadow-teal-200 transition-all hover:-translate-y-1 active:scale-95">
              إنشاء مؤسستي الأولى الآن
              <ArrowLeft className="mr-3 w-5 h-5" />
            </Button>
          } />
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 text-right">مؤسسة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrg} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-xs uppercase text-right block">اسم المؤسسة</Label>
                <Input required className="rounded-2xl h-12 border-slate-200" placeholder="جمعية رحمة..." value={orgName} onChange={e => setOrgName(e.target.value)} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 rounded-2xl font-black text-white">
                {submitting ? "جاري الإنشاء..." : "إنشاء المؤسسة والبدء"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
              <span>{(data?.finance.netBalance || 0).toLocaleString()}</span>
              <span className="text-xl font-bold text-teal-300 mr-2 uppercase">ج.م</span>
            </div>
            <p className="text-sm text-teal-100 mt-4 font-bold">الرصيد المتاح حالياً في الخزينة</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800 border-r-4 border-teal-600 pr-3">إجراءات سريعة</h3>
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
