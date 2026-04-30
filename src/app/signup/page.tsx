'use client';

import { signupAction } from '@/app/actions/auth';
import Link from 'next/link';
import { useState } from 'react';
import { signupSchema, type SignupInput } from '@/lib/schemas';
import { sanitizeFormData, sanitizePhone } from '@/lib/sanitize';

const initialData: SignupInput = {
  email: '',
  password: '',
  name: '',
  whatsapp: '',
  requiredAmount: 0,
  faculty: 'medicine',
  semester: '1',
};

export default function SignUp() {
  const [formData, setFormData] = useState<SignupInput>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validateField = (field: keyof SignupInput, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partialSchema = signupSchema.pick({ [field]: true } as any);
    const result = partialSchema.safeParse({ [field]: value });
    if (!result.success) {
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      const error = errors[0]?.message;
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return true;
  };

  const validateForm = (): boolean => {
    const sanitized = sanitizeFormData(formData);
    const result = signupSchema.safeParse(sanitized);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      errors.forEach((err) => {
        const field = err.path[0] as keyof SignupInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (field: keyof SignupInput, value: unknown) => {
    let processedValue = value;
    if (field === 'whatsapp' && typeof value === 'string') {
      processedValue = sanitizePhone(value);
    }
    if (field === 'requiredAmount') {
      processedValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    validateField(field, processedValue);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    const formDataObj = new FormData();
    const sanitized = sanitizeFormData(formData);
    Object.entries(sanitized).forEach(([key, value]) => {
      formDataObj.append(key, String(value));
    });

    const result = await signupAction(formDataObj);

    if (result && 'error' in result) {
      setMessage(result.error as string);
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
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="الاسم الرباعي..."
            />
            {errors.name && <p className="text-red-500 text-xs font-bold text-right">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs font-bold text-right">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">كلمة المرور</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs font-bold text-right">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</label>
            <input
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.whatsapp ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="+249..."
            />
            {errors.whatsapp && <p className="text-red-500 text-xs font-bold text-right">{errors.whatsapp}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="requiredAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ المطلوب (ج.م)</label>
            <input
              id="requiredAmount"
              name="requiredAmount"
              type="number"
              value={formData.requiredAmount || ''}
              onChange={(e) => handleChange('requiredAmount', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.requiredAmount ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
              placeholder="500"
            />
            {errors.requiredAmount && <p className="text-red-500 text-xs font-bold text-right">{errors.requiredAmount}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="faculty" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</label>
            <select
              id="faculty"
              name="faculty"
              value={formData.faculty}
              onChange={(e) => handleChange('faculty', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.faculty ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
            >
              <option value="medicine">طب</option>
              <option value="dentistry">طب أسنان</option>
              <option value="engineering">هندسة</option>
              <option value="other">أخرى</option>
            </select>
            {errors.faculty && <p className="text-red-500 text-xs font-bold text-right">{errors.faculty}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="semester" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة الدراسية</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              className={`w-full rounded-2xl border-2 ${errors.semester ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-white'} h-12 px-4 font-bold focus:outline-none focus:border-[#B38E2D] focus:ring-2 focus:ring-[#B38E2D]/20 transition-all`}
            >
              <option value="1">الفرقة الأولى</option>
              <option value="2">الفرقة الثانية</option>
              <option value="3">الفرقة الثالثة</option>
              <option value="4">الفرقة الرابعة</option>
              <option value="5">الفرقة الخامسة</option>
              <option value="6">الفرقة السادسة</option>
            </select>
            {errors.semester && <p className="text-red-500 text-xs font-bold text-right">{errors.semester}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).some((k) => errors[k as keyof SignupInput])}
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