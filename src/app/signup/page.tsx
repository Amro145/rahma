'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/schemas';
import { sanitizePhone, sanitizeNumber } from '@/lib/sanitize';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.amroaltayeb14.workers.dev';

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      whatsapp: '',
      requiredAmount: 0,
      faculty: 'medicine',
      semester: '1',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const sanitized = {
        ...data,
        whatsapp: data.whatsapp ? sanitizePhone(data.whatsapp) : undefined,
        requiredAmount: sanitizeNumber(data.requiredAmount),
      };

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
      });

      const result = await res.json() as { error?: string; token?: string };

      if (!res.ok) {
        if (res.status === 400 && result.error) {
          toast.error('يرجى التحقق من البيانات المدخلة');
        } else if (res.status === 409) {
          toast.error('البريد الإلكتروني مسجل بالفعل');
        } else {
          toast.error('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
        }
        return;
      }

      if (!result.token) {
        toast.error('لم يتم استلام رمز المصادقة');
        return;
      }

      document.cookie = `jwt=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`;
      router.push('/dashboard');
    } catch {
      toast.error('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-[--font-cairo]" dir="rtl">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-[#B38E2D]/20 border border-slate-100">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A843] to-[#8B6914] text-white shadow-lg mb-2">
            <span className="text-3xl font-black">Z</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">
            ابدأ رحلتك معنا
          </h2>
          <p className="text-slate-500 font-bold">
            أنشئ حسابك الآن لتنظيم وإدارة أعمالك الخيرية
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</label>
            <input
              id="name"
              {...register('name')}
              className={`w-full rounded-2xl border-2 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="الاسم الرباعي..."
            />
            {errors.name && <p className="text-red-500 text-xs font-bold text-right">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`w-full rounded-2xl border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs font-bold text-right">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">كلمة المرور</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`w-full rounded-2xl border-2 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs font-bold text-right">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</label>
            <input
              id="whatsapp"
              {...register('whatsapp')}
              className={`w-full rounded-2xl border-2 ${errors.whatsapp ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="+249..."
            />
            {errors.whatsapp && <p className="text-red-500 text-xs font-bold text-right">{errors.whatsapp.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="requiredAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ المطلوب (ج.م)</label>
            <input
              id="requiredAmount"
              type="number"
              {...register('requiredAmount', { valueAsNumber: true })}
              className={`w-full rounded-2xl border-2 ${errors.requiredAmount ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="500"
            />
            {errors.requiredAmount && <p className="text-red-500 text-xs font-bold text-right">{errors.requiredAmount.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="faculty" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</label>
            <select
              id="faculty"
              {...register('faculty')}
              className={`w-full rounded-2xl border-2 ${errors.faculty ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
            >
              <option value="medicine">طب</option>
              <option value="dentistry">طب أسنان</option>
              <option value="engineering">هندسة</option>
              <option value="other">أخرى</option>
            </select>
            {errors.faculty && <p className="text-red-500 text-xs font-bold text-right">{errors.faculty.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="semester" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة الدراسية</label>
            <select
              id="semester"
              {...register('semester')}
              className={`w-full rounded-2xl border-2 ${errors.semester ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
            >
              <option value="1">الفرقة الأولى</option>
              <option value="2">الفرقة الثانية</option>
              <option value="3">الفرقة الثالثة</option>
              <option value="4">الفرقة الرابعة</option>
              <option value="5">الفرقة الخامسة</option>
              <option value="6">الفرقة السادسة</option>
            </select>
            {errors.semester && <p className="text-red-500 text-xs font-bold text-right">{errors.semester.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full h-14 bg-gradient-to-r from-[#B38E2D] to-[#8B6914] hover:from-[#D4A843] hover:to-[#B38E2D] text-white rounded-2xl shadow-xl shadow-[#B38E2D]/20 text-lg font-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 font-bold text-sm">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/signin"
              className="text-[#B38E2D] hover:text-[#8B6914] hover:underline transition-all"
            >
              سجل دخولك من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
