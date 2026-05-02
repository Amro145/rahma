"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Sidebar } from "@/components/Sidebar";
import { User, LayoutDashboard, Users, FileText, Heart, UserCog } from "lucide-react";
import { Toaster } from "sonner";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";

type MeResponse = {
  user: {
    role: string;
  };
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [dateStr, setDateStr] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: meData } = useSWR<MeResponse>("/api/me", () => apiFetch<MeResponse>("/api/me"));
  const userRole = meData?.user?.role;
  const isManagement = userRole === "admin" || userRole === "management";

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

  const navItems = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "الطلاب", href: "/students", icon: Users },
    { name: "المالية", href: "/finance", icon: FileText },
    { name: "التبرعات", href: "/special-donations", icon: Heart },
    { name: "المستخدمين", href: "/users", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-[--font-cairo]" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:mr-64 mr-0 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Toaster position="top-center" richColors />
        
        <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
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
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-[#B38E2D]/10 flex items-center justify-center text-[#B38E2D]">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                </div>
                <span className="text-xs font-black text-slate-600 hidden sm:block">خروج</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-8 pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navbar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30 flex items-center justify-around px-2 pb-safe">
          {navItems
            .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-[#B38E2D]"
                    : "text-slate-500"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-[#B38E2D]" : "text-slate-400"}`} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
