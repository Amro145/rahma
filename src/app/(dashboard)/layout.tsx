"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth.client";
import { Sidebar } from "@/components/Sidebar";
import { LogOut, User } from "lucide-react";

import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [dateStr, setDateStr] = useState("");

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
    "/finance": "السجلات والتقارير المالية"
  };
  const activeTitle = titleMapping[pathname] || "لوحة التحكم";

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-[--font-cairo]" dir="rtl">
      <Sidebar />
      <div className="mr-64 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Toaster position="top-center" richColors />
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800">{activeTitle}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-sm font-bold text-slate-500 hidden md:block">
              {dateStr}
            </div>
            
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <button 
              onClick={async () => {
                await authClient.signOut();
                router.push("/signin");
              }}
              className="group flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-slate-600 group-hover:text-slate-900">تسجيل الخروج</span>
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
