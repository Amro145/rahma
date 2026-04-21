"use client";

import { useSession, signOut, UserWithRole } from "@/lib/auth.client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, LogOut, ShieldCheck, Mail, Calendar, Phone, Wallet, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StudentData {
  id: number;
  name: string;
  whatsapp: string;
  requiredAmount: number;
  status: "paid" | "pending";
  enrollmentDate: string;
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/signin");
    }

    if (session && (session.user as UserWithRole).role === "student") {
      fetchStudentData();
    }
  }, [session, isPending, router]);

  const fetchStudentData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev"}/api/students/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json() as { student: StudentData };
        setStudentData(data.student);
      }
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isPending) {
    return (
      <div
        className="flex items-center justify-center min-h-screen font-[--font-cairo]"
        dir="rtl"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!session) return null;

  const role = (session.user as UserWithRole).role;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/signin");
  };

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 md:p-8 font-[--font-cairo]"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900">
              الملف الشخصي
            </h1>
            <p className="text-slate-500 font-bold">
              أهلاً بك، {session.user.name}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="rounded-2xl border-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-black"
          >
            <LogOut className="ml-2 h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-teal-100/50 overflow-hidden">
          <CardHeader className="bg-teal-600 text-white p-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">
                  {session.user.name}
                </CardTitle>
                <CardDescription className="text-teal-100 font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  رتبة الحساب: {role === "admin" ? "مدير نظام" : "طالب"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                  <Mail className="h-5 w-5 text-teal-600" />
                  <span className="font-bold text-slate-700">
                    {session.user.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  تاريخ الانضمام
                </label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <span className="font-bold text-slate-700">
                    {new Date(session.user.createdAt).toLocaleDateString(
                      "ar-EG",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </span>
                </div>
              </div>

              {role === "student" && studentData && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      رقم الواتساب
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <Phone className="h-5 w-5 text-teal-600" />
                      <span className="font-bold text-slate-700">
                        {studentData.whatsapp}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest">
                      المبلغ المطلوب
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <Wallet className="h-5 w-5 text-teal-600" />
                      <span className="font-bold text-slate-700">
                        {studentData.requiredAmount.toLocaleString()} جنيه
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {role === "student" && studentData && (
              <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${
                studentData.status === "paid" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                : "bg-amber-50 border-amber-100 text-amber-800"
              }`}>
                {studentData.status === "paid" ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-600" />
                )}
                <div className="space-y-1">
                  <h3 className="font-black text-lg">
                    حالة الاشتراك: {studentData.status === "paid" ? "مكتمل" : "قيد الانتظار"}
                  </h3>
                  <p className="font-bold text-sm opacity-80">
                    {studentData.status === "paid" 
                      ? "شكراً لك، تم استلام مبلغ اشتراكك بنجاح." 
                      : "يرجى العلم أن طلبك قيد المراجعة، سيتم تحديث الحالة فور التأكد."}
                  </p>
                </div>
              </div>
            )}

            {role !== "admin" && !studentData && !isLoadingData && (
              <div className="p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 mt-4">
                <h3 className="text-amber-800 font-black mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  حالة الحساب
                </h3>
                <p className="text-amber-600 font-bold leading-relaxed">
                  أنت مسجل حالياً كطالب. لا تملك صلاحية الوصول إلى لوحة تحكم
                  الإدارة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مسؤول
                  النظام.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
            <p className="text-slate-400 font-bold text-sm">
              © منصة رحمة خيرية
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
