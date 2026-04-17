"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth.client";
import { Sidebar } from "@/components/Sidebar";
import { LogOut, User } from "lucide-react";

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
    // Client-side mapping of the arabic date to avoid SSR hydration mismatches
    setDateStr(new Intl.DateTimeFormat('ar-EG-u-nu-latn', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }).format(new Date()));
  }, []);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading Platform...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  // Pathname formatting mapping
  const titleMapping: Record<string, string> = {
    "/dashboard": "Dashboard Overview",
    "/students": "Students Management",
    "/finance": "Financial Logs"
  };
  const activeTitle = titleMapping[pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      <Sidebar />
      <div className="ml-64 flex flex-col flex-1 min-h-screen">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-slate-800">{activeTitle}</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-slate-500 font-[family-name:--font-cairo]" dir="rtl">
              {dateStr}
            </div>
            
            <div className="h-8 w-px bg-slate-200"></div>

            <button 
              onClick={async () => {
                await authClient.signOut();
                router.push("/signin");
              }}
              className="group flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-200 transition-colors">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Sign Out</span>
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors ml-1" />
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
