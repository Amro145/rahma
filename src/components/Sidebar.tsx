"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, X } from "lucide-react";
import { OrganizationSwitcher } from "./organization-switcher";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "قائمة الطلاب", href: "/students", icon: Users },
    { name: "السجلات المالية", href: "/finance", icon: FileText },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`w-64 h-screen border-l border-slate-200 bg-white flex flex-col fixed right-0 top-0 z-50 font-[--font-cairo] transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-teal-700">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">ر</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">رحمة</h2>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <OrganizationSwitcher />
        <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose?.();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-teal-50 text-teal-700 hover:bg-teal-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-teal-700" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
