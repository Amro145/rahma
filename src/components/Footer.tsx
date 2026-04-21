"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Share2, Info } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 font-[--font-cairo]" dir="rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-teal-700">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100">
                <span className="text-white font-black text-xl leading-none">ر</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">منصة رحمة</h2>
            </div>
            <p className="text-slate-500 font-bold leading-relaxed">
              منصة تقنية متكاملة تهدف لتنظيم العمل الخيري وتسهيل عمليات إدارة الطلاب والمعاملات المالية بكل شفافية وأمان.
            </p>
            <div className="flex gap-4">
              <Link href="" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <Share2 className="w-5 h-5" />
              </Link>
              <Link href="" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <Info className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-slate-900 font-black text-lg">روابط سريعة</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" className="text-slate-500 font-bold hover:text-teal-600 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  لوحة التحكم
                </Link>
              </li>
              <li>
                <Link href="/students" className="text-slate-500 font-bold hover:text-teal-600 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  إدارة الطلاب
                </Link>
              </li>
              <li>
                <Link href="/finance" className="text-slate-500 font-bold hover:text-teal-600 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  السجلات المالية
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-slate-500 font-bold hover:text-teal-600 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  مركز المساعدة
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-6">
            <h3 className="text-slate-900 font-black text-lg">الدعم والمساعدة</h3>
            <ul className="space-y-4">
              <li>
          {/* +249965158196 */}
          <Link href="wa.me/249965158196" className="text-slate-500 font-bold hover:text-teal-600 transition-colors">whatsapp</Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h3 className="text-slate-900 font-black text-lg">اتصل بنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-1" />
                <span className="text-slate-500 font-bold">الخرطوم، السودان - مركز التميز التقني</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-slate-500 font-bold" dir="ltr">+249965158196</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-slate-500 font-bold">support@rahma.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 font-bold text-sm">
            © {currentYear} منصة رحمة. جميع الحقوق محفوظة.
          </p>
        
        </div>
      </div>
    </footer>
  );
}
