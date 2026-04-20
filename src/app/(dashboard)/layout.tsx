"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth.client";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

import { Toaster } from "sonner";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [dateStr, setDateStr] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    // Client-side mapping of the arabic date
    setDateStr(new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date()));
  }, []);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50 font-[--font-cairo]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-bold">جاري تحميل المنصة...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }


  const titleMapping: Record<string, string> = {
    "/dashboard": "نظرة عامة على الإحصائيات",
    "/students": "إدارة شؤون الطلاب",
    "/finance": "السجلات والتقارير المالية",
    "/help": "دليل الاستخدام",
  };
  const activeTitle = titleMapping[pathname] || "لوحة التحكم";


  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-[--font-cairo]" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-teal-700">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">ر</span>
          </div>
          <Link href="/">
            <h2 className="text-xl font-bold tracking-tight">رحمة</h2>
          </Link>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="lg:mr-64 mr-0 flex flex-col flex-1 min-h-screen transition-all duration-300 pt-16 lg:pt-0">
        <Toaster position="top-center" richColors />

        {/* Desktop Header / Page Title - Adapted for Mobile */}
        <header className="h-16 flex items-center justify-between px-6 md:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-16 lg:top-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black text-slate-800">{activeTitle}</h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-xs md:text-sm font-bold text-slate-500 hidden sm:block">
              {dateStr}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <button
              onClick={async () => {
                await authClient.signOut();
                router.push("/signin");
              }}
              className="group flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <span className="text-xs md:text-sm font-black text-slate-600 group-hover:text-slate-900">تسجيل الخروج</span>
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
