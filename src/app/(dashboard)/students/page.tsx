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

      // Update locally
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Students List</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Required Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${student.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {student.whatsapp}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                  <TableCell className="font-medium">${student.requiredAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        student.status === "paid"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {student.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {student.status === "pending" ? (
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleConfirmPayment(student.id)}
                        disabled={actionLoading === student.id}
                      >
                        {actionLoading === student.id ? "Confirming..." : "Confirm Payment"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="text-green-600 border-green-200 bg-green-50/50">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Paid
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
