"use client";

import { authClient, useSession } from "@/lib/auth.client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (authError) {
        setError(authError.message || "فشل تسجيل الدخول. يرجى التأكد من البيانات.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-[--font-cairo]" dir="rtl">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-6 sm:p-10 shadow-2xl shadow-teal-100/50 border border-slate-100">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200 mb-2">
            <span className="text-3xl font-black">ر</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">
            مرحباً بك مجدداً
          </h2>
          <p className="text-slate-500 font-bold">
            قم بتسجيل الدخول لمتابعة أعمالك الخيرية
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
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
              "تسجيل الدخول"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-bold">أو</span>
          </div>
        </div>

        <button
          onClick={() => handleGoogleSignIn()}
          disabled={loadingGoogle}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-4 py-4 text-slate-700 font-black transition-all hover:bg-slate-50 hover:border-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingGoogle ? (
            <span className="h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-teal-600"></span>
          ) : (
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
              />
              <path
              fill="#34A853"
              d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078-2.866 0-5.29-1.916-6.155-4.498L1.82 17.749C3.78 21.658 7.605 24 12 24c3.11 0 5.924-1.011 8.04-2.721l-4-3.266z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.273c0-.827-.074-1.623-.21-2.386H12v4.514h6.446c-.278 1.498-1.124 2.767-2.406 3.614l3.815 3.118C22.085 19.043 23.49 15.934 23.49 12.273z"
              />
              <path
                fill="#FBBC05"
                d="M5.845 14.12c-.225-.667-.353-1.378-.353-2.12s.128-1.453.353-2.12L1.82 6.765A11.93 11.93 0 0 0 0 12c0 1.884.43 3.66 1.18 5.235l4.665-3.115z"
              />
            </svg>
          )}
          <span className="group-hover:text-teal-700 transition-colors">المتابعة باستخدام Google</span>
        </button>

        <div className="pt-4 text-center">
          <p className="text-slate-500 font-bold text-sm">
            ليس لديك حساب؟{" "}
            <Link
              href="/signup"
              className="text-teal-600 hover:text-teal-700 hover:underline transition-all"
            >
              أنشئ حساباً جديداً مجاناً
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
