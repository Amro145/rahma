"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { LayoutDashboard, Users, FileText, Heart, X, UserCog, LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { logoutAction } from "@/app/actions/auth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type MeResponse = {
  user: {
    role: string;
  };
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  const { data: meData } = useSWR<MeResponse>("/api/me", () => apiFetch<MeResponse>("/api/me"));
  const userRole = meData?.user?.role;
  
  const isManagement = userRole === "admin" || userRole === "management";

  const navItems = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "قائمة الطلاب", href: "/students", icon: Users },
    { name: "السجلات المالية", href: "/finance", icon: FileText },
    { name: "التبرعات الخاصة", href: "/special-donations", icon: Heart },
    { name: "إدارة المستخدمين", href: "/users", icon: UserCog, requiresRole: "management" },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 h-screen border-l border-slate-200 bg-white flex-col fixed right-0 top-0 z-50 font-[--font-cairo] transition-transform duration-300 transform hidden lg:flex lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 lg:w-8 h-7 lg:h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#8B6914] flex items-center justify-center">
              <span className="text-white font-bold text-base leading-none">Z</span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold tracking-tight">ZSSA</h2>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 lg:h-6 w-5 lg:w-6" />
          </button>
        </div>
        <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
           {navItems
             .filter(item => !item.requiresRole || isManagement)
             .map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => {
                   if (window.innerWidth < 1024) onClose?.();
                 }}
                 className={`flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl font-bold transition-all duration-200 min-h-[3rem] ${
                   isActive
                     ? "bg-[#B38E2D]/10 text-[#B38E2D] hover:bg-[#B38E2D]/15 shadow-sm"
                     : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                 }`}
               >
                 <item.icon className={`h-5 w-5 ${isActive ? "text-[#B38E2D]" : "text-slate-400"}`} />
                 <span>{item.name}</span>
               </Link>
             );
           })}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <form action={async () => {
            await logoutAction();
          }}>
            <button 
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all duration-200 text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}