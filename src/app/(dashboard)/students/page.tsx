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
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev";
      const res = await fetch(`${backendUrl}/api/students`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const json = (await res.json()) as any;
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
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev";
      const res = await fetch(`${backendUrl}/api/students/${id}/pay`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to confirm payment");

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Student Directory</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name..."
            className="pl-10 h-10 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-teal-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Student Name</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Contact</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Required Tuition</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading students...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No students found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="transition-colors hover:bg-slate-50/50 border-b border-slate-100 last:border-0">
                  <TableCell className="font-medium text-slate-900 py-4 font-[family-name:--font-cairo] text-base">{student.name}</TableCell>
                  <TableCell className="py-4">
                    <a
                      href={`https://wa.me/${student.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {student.whatsapp}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">${student.requiredAmount.toLocaleString()}</TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={
                        student.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold"
                          : "bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold"
                      }
                    >
                      {student.status === "paid" ? "PAID" : "PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    {student.status === "pending" ? (
                      <Button
                        size="sm"
                        className="bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm"
                        onClick={() => handleConfirmPayment(student.id)}
                        disabled={actionLoading === student.id}
                      >
                        {actionLoading === student.id ? "Processing..." : "Confirm Payment"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="text-emerald-600 border-none bg-emerald-50 rounded-lg opacity-100 font-medium">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Settled
                      </Button>
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
