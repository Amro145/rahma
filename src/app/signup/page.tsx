'use client';

import { signupAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const result = await signupAction(formData);
    
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
            ابدأ رحلتك معنا
          </h2>
          <p className="text-slate-500 font-bold">
            أنشئ حسابك الآن لتنظيم وإدارة أعمالك الخيرية
          </p>
        </div>

        {message && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="الاسم الرباعي..."
            />
          </div>

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
              minLength={6}
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</label>
            <input
              id="whatsapp"
              name="whatsapp"
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="201234567890"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="requiredAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ المطلوب (ج.م)</label>
            <input
              id="requiredAmount"
              name="requiredAmount"
              type="number"
              required
              min="1"
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="faculty" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</label>
            <select
              id="faculty"
              name="faculty"
              required
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            >
              <option value="">اختر الكلية...</option>
              <option value="medicine">طب</option>
              <option value="dentistry">طب أسنان</option>
              <option value="engineering">هندسة</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="semester" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة الدراسية</label>
            <select
              id="semester"
              name="semester"
              required
              className="w-full rounded-2xl border-2 border-slate-100 bg-white h-12 px-4 font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            >
              <option value="">اختر الفرقة...</option>
              <option value="1">الفرقة الأولى</option>
              <option value="2">الفرقة الثانية</option>
              <option value="3">الفرقة الثالثة</option>
              <option value="4">الفرقة الرابعة</option>
              <option value="5">الفرقة الخامسة</option>
              <option value="6">الفرقة السادسة</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 text-lg font-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 font-bold text-sm">
            لديك حساب بالفعل؟{' '}
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