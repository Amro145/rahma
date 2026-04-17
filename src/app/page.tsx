"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth.client";
import { Heart, Users, LayoutDashboard, ArrowLeft, ShieldCheck, PieChart, Star } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-[--font-cairo]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-200">
              <span className="text-white font-black text-xl leading-none">ر</span>
            </div>
            <span className="text-2xl font-black tracking-tight">رحمة</span>
          </div>
          
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <LayoutDashboard className="w-5 h-5" />
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link href="/signin" className="text-slate-600 font-bold hover:text-teal-600 transition-colors">
                  تسجيل الدخول
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 rounded-full bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  ابدأ الآن
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-teal-50 rounded-full blur-3xl opacity-50 z-0"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-beige-50 rounded-full blur-3xl opacity-30 z-0 text-[#F5F5DC]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-bold text-sm animate-bounce-subtle">
            <Star className="w-4 h-4 fill-teal-700" />
            <span>نظام "رحمة" لإدارة العمل الخيري</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.2] max-w-4xl mx-auto">
            إعادة تعريف <span className="text-teal-600">إدارة التبرعات</span> والطلاب بشفافية واحترافية
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            منصة متكاملة لتتبع الطلاب، إدارة السجلات المالية، وضمان وصول كل قرش لمكانه الصحيح بأعلى معايير الدقة.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={session ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-teal-600 text-white text-lg font-black shadow-xl shadow-teal-200 hover:bg-teal-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              ابدأ الاستخدام الأن
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 text-lg font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              شاهد العرض التجريبي
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">لماذا تختار منصة رحمة؟</h2>
            <p className="text-slate-500 font-medium">نجمع بين التكنولوجيا المتطورة والقيم الإنسانية السامية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">إدارة شاملة للطلاب</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                تتبع حالة كل طالب، وسجلات الحضور، والمدفوعات الدراسية بدقة لضمان استمرارية العملية التعليمية.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">سجلات مالية لحظية</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                نظام محاسبي مبسط يتيح لك تسجيل الإيرادات والمصروفات، مع تقارير فورية لصافي الرصيد والنمو.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">أمان وموثوقية عالية</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                حماية كاملة لبياناتك وبيانات الطلاب والمتبرعين عبر تشفير متقدم ورقابة صارمة على الصلاحيات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-teal-800 p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-teal-200 via-transparent to-transparent"></div>
          <div className="relative z-10 space-y-8">
            <Heart className="w-16 h-16 mx-auto text-teal-300 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              هل أنت مستعد لتنظيم عملك الخيري بشكل احترافي؟
            </h2>
            <p className="text-xl text-teal-100 font-medium max-w-2xl mx-auto">
              انضم إلينا اليوم وابدأ في إدارة مؤسستك بنموذج عصري يضمن الشفافية والنمو المستدام.
            </p>
            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-white text-teal-800 text-xl font-black shadow-lg hover:bg-slate-50 hover:scale-105 transition-all"
              >
                إنشاء حساب مجاني
                <ArrowLeft className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 font-medium text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600/10 flex items-center justify-center">
              <span className="text-teal-600 font-bold text-sm">ر</span>
            </div>
            <span className="text-slate-900 font-black">رحمة</span>
          </div>
          <p>© 2024 جميع الحقوق محفوظة لمنصة رحمة الإلكترونية</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-teal-600 transition-colors">عن المنصة</Link>
            <Link href="#" className="hover:text-teal-600 transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-teal-600 transition-colors">تواصل معنا</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
