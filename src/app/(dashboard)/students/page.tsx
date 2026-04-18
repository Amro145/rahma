"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Student = {
  id: number;
  name: string;
  whatsapp: string;
  requiredAmount: number;
  status: "pending" | "paid";
  createdAt: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const json = await apiFetch<{ students: Student[] }>("/api/students");
      setStudents(json.students);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (id: number) => {
    setActionLoading(id);
    try {
      await apiFetch(`/api/students/${id}/pay`, {
        method: "PATCH",
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "paid" } : s))
      );
    } catch (err) {
      console.error("Error confirming payment:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[--font-cairo]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 border-r-4 border-teal-600 pr-3">دليل الطلاب</h2>
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="البحث عن طريق اسم الطالب..."
            className="pr-10 h-11 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-teal-600 text-sm font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
              <TableHead className="font-black text-slate-600 h-14 uppercase text-xs tracking-wider text-right pr-6">اسم الطالب</TableHead>
              <TableHead className="font-black text-slate-600 h-14 uppercase text-xs tracking-wider text-right">رقم التواصل</TableHead>
              <TableHead className="font-black text-slate-600 h-14 uppercase text-xs tracking-wider text-right">المبلغ المطلوب</TableHead>
              <TableHead className="font-black text-slate-600 h-14 uppercase text-xs tracking-wider text-right">حالة الدفع</TableHead>
              <TableHead className="text-left font-black text-slate-600 h-14 uppercase text-xs tracking-wider pl-6">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold">جاري جلب بيانات الطلاب...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-bold">
                  لا يوجد طلاب مطابقون لعملية البحث.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="transition-colors hover:bg-slate-50/50 border-b border-slate-100 last:border-0 group">
                  <TableCell className="font-black text-slate-900 py-5 pr-6 text-base">{student.name}</TableCell>
                  <TableCell className="py-5">
                    <a
                      href={`https://wa.me/${student.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-800 font-bold transition-all hover:scale-105"
                    >
                      <span>{student.whatsapp}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </TableCell>
                  <TableCell className="font-black text-slate-700 py-5">
                    <span>{student.requiredAmount.toLocaleString()}</span>
                    <span className="text-xs mr-1 text-slate-400">ج.م</span>
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge
                      variant="outline"
                      className={
                        student.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full px-4 py-1.5 text-xs font-black"
                          : "bg-amber-50 text-amber-700 border-amber-200 rounded-full px-4 py-1.5 text-xs font-black"
                      }
                    >
                      {student.status === "paid" ? "تم السداد" : "قيد الانتظار"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left py-5 pl-6">
                    {student.status === "pending" ? (
                      <Button
                        size="sm"
                        className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-md font-black px-5"
                        onClick={() => handleConfirmPayment(student.id)}
                        disabled={actionLoading === student.id}
                      >
                        {actionLoading === student.id ? "جاري..." : "تأكيد السداد"}
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-black text-sm">
                        <CheckCircle className="w-5 h-5" />
                        مدفوع
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
