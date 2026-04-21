"use client";

import { authClient, useSession, UserWithRole } from "@/lib/auth.client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User, Phone, Banknote } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      const role = (session.user as UserWithRole).role;
      if (role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/profile");
      }
    }
  }, [session, isPending, router]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const requiredAmount = parseFloat(formData.get("requiredAmount") as string);

    try {
      // Step 1: Sign up with Better Auth
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });

      if (authError) {
        setError(authError.message || "فشل إنشاء الحساب");
        setLoading(false);
        return;
      }

      // Step 2: Create student record in backend
      // credentials: 'include' forwards the session cookie set in Step 1
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://backend.amroaltayeb14.workers.dev'}/api/students/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          whatsapp,
          requiredAmount,
        }),
      });

      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error || "فشل تسجيل بيانات الطالب");
        setLoading(false);
        return;
      }

      router.push("/profile");
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-[--font-cairo] py-12" dir="rtl">
      <div className="w-full max-w-lg space-y-8 rounded-[2.5rem] bg-white p-6 sm:p-10 shadow-2xl shadow-teal-100/50 border border-slate-100">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200 mb-2">
            <span className="text-3xl font-black">ر</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">
            إنشاء حساب طالب جديد
          </h2>
          <h3 className="text-slate-500 font-bold">
            رحمة - منصة تيسير الرسوم الدراسية
          </h3>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-black mr-1">الاسم الثلاثي</Label>
              <div className="relative">
                <User className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  className="pr-10 h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 transition-all focus:border-teal-400 focus:bg-white"
                  placeholder="محمد أحمد علي"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-black mr-1">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="pr-10 h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 transition-all focus:border-teal-400 focus:bg-white"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-slate-700 font-black mr-1">رقم الواتساب</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  className="pr-10 h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 transition-all focus:border-teal-400 focus:bg-white"
                  placeholder="+249..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredAmount" className="text-slate-700 font-black mr-1">المبلغ المطلوب</Label>
              <div className="relative">
                <Banknote className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="requiredAmount"
                  name="requiredAmount"
                  type="number"
                  step="0.01"
                  className="pr-10 h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 transition-all focus:border-teal-400 focus:bg-white"
                  placeholder="500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password" className="text-slate-700 font-black mr-1">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="pr-10 h-12 rounded-2xl border-2 border-slate-50 bg-slate-50/50 transition-all focus:border-teal-400 focus:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-teal-600 text-lg font-black hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "إنشاء الحساب والاشتراك"
            )}
          </Button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 font-bold text-sm">
            لديك حساب بالفعل؟{" "}
            <Link
              href="/signin"
              className="text-teal-600 hover:text-teal-700 hover:underline transition-all"
            >
              سجل دخولك من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
