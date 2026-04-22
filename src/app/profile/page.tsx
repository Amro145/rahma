"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Wallet, Calendar, GraduationCap, CheckCircle, Clock } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type ProfileData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  student: {
    id: number;
    name: string;
    whatsapp: string;
    faculty: string;
    semester: string;
    requiredAmount: number;
    status: "paid" | "pending";
    enrollmentDate: string;
  };
  paymentSummary: {
    paidMonthsThisYear: number;
    totalPaidAmount: number;
    balanceDue: number;
    monthlyAmount: number;
    currentMonth: number;
    currentYear: number;
  };
};

export default function ProfilePage() {
  const { data, isLoading, error } = useSWR<ProfileData>(
    "/api/me",
    () => apiFetch<ProfileData>("/api/me")
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-[--font-cairo]" dir="rtl">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-bold">جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-[--font-cairo]" dir="rtl">
        <div className="text-center p-8 bg-white rounded-[2rem] shadow-sm border border-red-100 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">تعذر تحميل البيانات</h2>
          <p className="text-slate-500 font-bold text-sm mb-6">يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
          <form action={logoutAction}>
            <button type="submit" className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-colors">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { student, paymentSummary } = data;

  const facultyMap: Record<string, string> = {
    medicine: "الطب البشري",
    dentistry: "طب الأسنان",
    engineering: "الهندسة",
    other: "أخرى",
  };

  
  return (
    <div className="min-h-screen bg-slate-50 font-[--font-cairo] pb-12" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">ر</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-800">الملف الشخصي</h1>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 text-slate-600 hover:text-red-600 transition-all font-bold text-sm">
              <span className="hidden sm:inline">تسجيل الخروج</span>
              <User className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-l from-teal-600 to-teal-800 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg shadow-teal-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-right flex-1">
              <h2 className="text-2xl sm:text-3xl font-black mb-2">مرحباً، {student?.name || data.user.name}</h2>
              <p className="text-teal-100 font-bold flex items-center justify-center md:justify-start gap-2">
                <GraduationCap className="w-5 h-5" />
                {student ? `طالب بـ ${facultyMap[student.faculty] || student.faculty} - الفرقة ${student.semester}` : 'مستخدم'}
              </p>
            </div>
          </div>
        </div>

        {student && paymentSummary && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Payment Status Card */}
            <Card className="rounded-[2rem] border-slate-200 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden lg:col-span-1">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center justify-between">
                  حالة السداد
                  <div className={`p-2 rounded-xl ${paymentSummary.balanceDue === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {paymentSummary.balanceDue === 0 ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-col gap-1">
                  <span className={`text-3xl font-black ${paymentSummary.balanceDue === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {paymentSummary.balanceDue === 0 ? 'مكتمل' : 'مستحق'}
                  </span>
                  <span className="text-slate-500 font-bold text-sm">
                    {paymentSummary.balanceDue === 0 
                      ? 'لا توجد أي مبالغ مستحقة حالياً' 
                      : `مستحق السداد: ${paymentSummary.balanceDue.toLocaleString()} ج.م`}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Amount Card */}
            <Card className="rounded-[2rem] border-slate-200 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden lg:col-span-1">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center justify-between">
                  القسط الشهري
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900">
                  {student.requiredAmount.toLocaleString()}
                  <span className="text-base font-bold text-slate-400">ج.م</span>
                </div>
                <div className="mt-2 text-sm font-bold text-slate-500">
                  للعام الأكاديمي {paymentSummary.currentYear}
                </div>
              </CardContent>
            </Card>

            {/* Total Paid Card */}
            <Card className="rounded-[2rem] border-slate-200 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden lg:col-span-1">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center justify-between">
                  إجمالي المدفوع
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-baseline gap-1 text-3xl font-black text-slate-900">
                  {paymentSummary.totalPaidAmount.toLocaleString()}
                  <span className="text-base font-bold text-slate-400">ج.م</span>
                </div>
                <div className="mt-2 text-sm font-bold text-slate-500">
                  تم سداد {paymentSummary.paidMonthsThisYear} أشهر هذا العام
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* Detailed Info */}
        {student && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 border-r-4 border-teal-600 pr-3">تفاصيل الحساب</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">البريد الإلكتروني</span>
                <p className="text-slate-900 font-bold">{data.user.email}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">رقم الواتساب</span>
                <p className="text-slate-900 font-bold" dir="ltr">{student.whatsapp || 'غير متوفر'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">تاريخ التسجيل</span>
                <p className="text-slate-900 font-bold">
                  {new Date(student.enrollmentDate).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
