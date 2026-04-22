'use client';

import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = document.cookie.includes('jwt');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result && 'error' in result) {
      setMessage(result.error as string);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-[--font-cairo]" dir="rtl">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-teal-100/50 border border-slate-100">
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

        {message && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">كلمة المرور</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 text-lg font-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 font-bold text-sm">
            ليس لديك حساب؟{' '}
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