"use client";

import { useEffect, useState, use, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { PaymentCalendar } from "@/components/payment-calendar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Printer, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/lib/auth.client";

interface PaymentMonth {
  monthIndex: number;
  status: "paid" | "unpaid" | "upcoming";
  amount: number;
  label: string;
}

interface PaymentStatus {
  studentId: number;
  academicYear: number;
  paymentPlan: PaymentMonth[];
  totalBalanceDue: number;
  monthlyAmount: number;
}

interface Student {
  id: number;
  name: string;
  whatsapp: string;
}

export default function StudentPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const { data: session } = useSession();
  const activeOrgId = session?.session?.activeOrganizationId;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentStatus | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      // Fetch payment status
      const [statusRes, studentRes] = await Promise.all([
        apiFetch<PaymentStatus>(`/api/students/${studentId}/payment-status`, {
          orgId: activeOrgId
        }),
        apiFetch<{ students: Student[] }>(`/api/students`, {
          orgId: activeOrgId
        })
      ]);
      
      const foundStudent = studentRes.students.find(s => s.id === Number(studentId));
      setStudent(foundStudent || null);
      setData(statusRes);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [studentId, activeOrgId]);

  useEffect(() => {
    if (activeOrgId) {
      fetchData();
    }
  }, [fetchData, activeOrgId]);


  const handlePayMonth = async (monthIndex: number) => {
    if (!data || !activeOrgId) return;
    try {
      await apiFetch(`/api/students/${studentId}/pay`, {
        method: "PATCH",
        orgId: activeOrgId,
        body: JSON.stringify({
          monthIndex,
          academicYear: data.academicYear,
          amount: data.monthlyAmount
        })
      });
      toast.success("تم تسجيل الدفع بنجاح");
      // Refresh data
      await fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("حدث خطأ أثناء معالجة الدفع");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data || !student) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
        <p className="text-red-500 font-bold mb-4">{error || "تعذر العثور على الطالب"}</p>
        <Link href="/students">
          <Button variant="outline">العودة لدليل الطلاب</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[--font-cairo]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
            <Link href="/students" className="hover:text-teal-600 transition-colors">دليل الطلاب</Link>
            <ChevronRight className="w-4 h-4" />
            <span>سجل الدفع</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{student.name}</h2>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold gap-2">
            <Download className="w-4 h-4" />
            تحميل PDF
          </Button>
        </div>
      </div>

      <PaymentCalendar
        academicYear={data.academicYear}
        paymentPlan={data.paymentPlan}
        totalBalanceDue={data.totalBalanceDue}
        monthlyAmount={data.monthlyAmount}
        onPayMonth={handlePayMonth}
      />
    </div>
  );
}
