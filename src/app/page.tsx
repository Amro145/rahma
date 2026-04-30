"use client";

import Link from "next/link";
import { Heart, Users, LayoutDashboard, ArrowLeft, ShieldCheck, PieChart, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = document.cookie.includes('jwt');
    setIsAuthenticated(token);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-[--font-cairo]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#8B6914] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg leading-none">Z</span>
            </div>
            <span className="text-2xl font-black tracking-tight">ZSSA</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white font-bold hover:from-[#D4A843] hover:to-[#B38E2D] transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <LayoutDashboard className="w-5 h-5" />
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link href="/signin" className="text-slate-600 font-bold hover:text-[#B38E2D] transition-colors">
                  تسجيل الدخول
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white font-bold hover:from-[#D4A843] hover:to-[#B38E2D] transition-all shadow-md hover:shadow-lg active:scale-95"
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
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-[#D4A843]/10 rounded-full blur-3xl opacity-30 z-0"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#800000]/5 rounded-full blur-3xl opacity-20 z-0"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B38E2D]/10 border border-[#B38E2D]/20 text-[#B38E2D] font-bold text-sm">
            <Star className="w-4 h-4 fill-[#B38E2D]" />
            <span>صندوق ZSSA التكافلي الإجتماعي</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.2] max-w-4xl mx-auto">
            صندوق <span className="text-[#B38E2D]">ZSSA</span> التكافلي الإجتماعي
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            هو مبادرة تكافلية تطوعية تهدف إلى تعزيز روح التعاون والتكافل بين أعضاء الرابطة، من خلال تقديم الدعم والمساندة في الحالات الاجتماعية والإنسانية الطارئة، بما يسهم في تخفيف الأعباء عن الطلاب ودعم استقرارهم الاجتماعي.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white text-lg font-black shadow-xl hover:from-[#D4A843] hover:to-[#B38E2D] hover:-translate-y-1 transition-all active:scale-95"
            >
              ابدأ الاستخدام الآن
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
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">لماذا تختار صندوق ZSSA التكافلي؟</h2>
            <p className="text-slate-500 font-medium">نجمع بين التكنولوجيا المتطورة والقيم الإنسانية السامية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#B38E2D]/10 text-[#B38E2D] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">إدارة شاملة للطلاب</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                تتبع حالة كل طالب، وسجلات الحضور، والمدفوعات الدراسية بدقة لضمان استمرارية العملية التعليمية.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#800000]/10 text-[#800000] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">سجلات مالية لحظية</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                نظام محاسبي مبسط يتيح لك تسجيل الإيرادات والمصروفات، مع تقارير فورية لصافي الرصيد والنمو.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a3e]/10 text-[#1a1a3e] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-[#1a1a3e] to-[#2d2d5e] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-[#B38E2D] via-transparent to-transparent"></div>
          <div className="relative z-10 space-y-8">
            <Heart className="w-16 h-16 mx-auto text-[#B38E2D] animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              هل أنت مستعد لتنظيم عملك الخيري بشكل احترافي؟
            </h2>
            <p className="text-xl text-white/70 font-medium max-w-2xl mx-auto">
              انضم إلينا اليوم وابدأ في إدارة مؤسستك بنموذج عصري يضمن الشفافية والنمو المستدام.
            </p>
            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-white text-[#1a1a3e] text-xl font-black shadow-lg hover:bg-slate-50 hover:scale-105 transition-all"
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#8B6914] flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-slate-900 font-black">ZSSA</span>
          </div>
          <p>© 2024 جميع الحقوق محفوظة لصندوق ZSSA التكافلي</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#B38E2D] transition-colors">عن المنصة</Link>
            <Link href="#" className="hover:text-[#B38E2D] transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-[#B38E2D] transition-colors">تواصل معنا</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
