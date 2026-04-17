"use client";

import { useSession, signOut } from "@/lib/auth.client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [isPending, session, router]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 sm:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 gap-6">
          <div className="flex items-center gap-6">
            {user.image ? (
              <img 
                src={user.image} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                أهلاً بك، {user.name} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-5 py-2.5 font-medium transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            تسجيل الخروج
          </button>
        </header>

        {/* Dashboard Placeholder */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">نظرة عامة على لوحة التحكم</h2>
            <div className="h-64 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
              <p className="text-gray-500 dark:text-gray-400">محتوى النظام سيظهر هنا</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">تفاصيل الجلسة</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">تاريخ التسجيل</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(user.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">معرف المستخدم</span>
                <code className="text-xs text-indigo-600 dark:text-indigo-400 break-all">
                  {user.id}
                </code>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
