"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { Sidebar } from "@/components/Sidebar";
import { User, Menu } from "lucide-react";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [dateStr, setDateStr] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setDateStr(
      new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date())
    );
  }, []);

  const titleMapping: Record<string, string> = {
    "/dashboard": "نظرة عامة على الإحصائيات",
    "/students": "إدارة شؤون الطلاب",
    "/finance": "السجلات والتقارير المالية",
    "/users": "إدارة المستخدمين",
    "/special-donations": "التبرعات الخاصة",
  };
  const activeTitle = titleMapping[pathname] || "لوحة التحكم";

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-[--font-cairo]" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-teal-700">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white font-bold text-base leading-none">ر</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">رحمة</h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="lg:mr-64 mr-0 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Toaster position="top-center" richColors />
        
        <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-14 md:top-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-base md:text-xl font-black text-slate-800">{activeTitle}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="text-xs font-bold text-slate-500 hidden xs:block">
              {dateStr}
            </div>
            
            <div className="h-4 md:h-6 w-px bg-slate-200 hidden xs:block"></div>

            <form action={async () => {
              await logoutAction();
            }}>
              <button 
                type="submit"
                className="flex items-center gap-1 md:gap-3 px-1 md:px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <span className="text-xs font-black text-slate-600 hidden sm:block">خروج</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-8 mt-14 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
