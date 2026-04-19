"use client";

import { useState } from "react";
import useSWR from "swr";
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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  ExternalLink,
  CreditCard
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "@/lib/auth.client";
import Link from "next/link";

type Student = {
  id: number;
  name: string;
  whatsapp: string;
  requiredAmount: number;
  status: "pending" | "paid";
  createdAt: string;
};

export default function StudentsPage() {
  const { data: session } = useSession();
  const activeOrgId = session?.session?.activeOrganizationId;

  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    requiredAmount: "",
  });

  const { data, isLoading: loading, mutate } = useSWR<{ students: Student[] }>(
    activeOrgId ? `/api/students?orgId=${activeOrgId}` : null,
    () => apiFetch<{ students: Student[] }>("/api/students", { orgId: activeOrgId as string })
  );
  
  const students = data?.students || [];

  const handleConfirmPayment = async (id: number) => {
    if (!activeOrgId) return;
    const student = students.find((s) => s.id === id);
    if (!student) return;
    setActionLoading(id);
    try {
      const now = new Date();
      await apiFetch(`/api/students/${id}/pay`, {
        method: "PATCH",
        orgId: activeOrgId,
        body: JSON.stringify({
          monthIndex: now.getMonth() + 1,
          academicYear: now.getFullYear(),
          amount: student.requiredAmount,
        }),
      });

      mutate(
        { students: students.map((s) => (s.id === id ? { ...s, status: "paid" as const } : s)) },
        { revalidate: false }
      );
      toast.success("تم تأكيد السداد بنجاح");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تأكيد السداد";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ student: Student }>("/api/students", {
        method: "POST",
        orgId: activeOrgId,
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp,
          requiredAmount: Number(formData.requiredAmount),
        }),
      });

      mutate({ students: [json.student, ...students] }, { revalidate: false });
      
      setFormData({ name: "", whatsapp: "", requiredAmount: "" });
      setIsDialogOpen(false);
      toast.success("تمت إضافة الطالب بنجاح");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل إضافة الطالب";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !activeOrgId) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ student: Student }>(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        orgId: activeOrgId,
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp,
          requiredAmount: Number(formData.requiredAmount),
        }),
      });

      mutate({ students: students.map(s => s.id === selectedStudent.id ? json.student : s) }, { revalidate: false });
      setIsEditDialogOpen(false);
      toast.success("تم تحديث بيانات الطالب");
    } catch {
      toast.error("فشل تحديث البيانات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent || !activeOrgId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/students/${selectedStudent.id}`, {
        method: "DELETE",
        orgId: activeOrgId,
      });
      mutate({ students: students.filter(s => s.id !== selectedStudent.id) }, { revalidate: false });
      setIsDeleteDialogOpen(false);
      toast.success("تم حذف الطالب بنجاح");
    } catch {
      toast.error("فشل حذف الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      whatsapp: student.whatsapp,
      requiredAmount: student.requiredAmount.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[--font-cairo]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 border-r-4 border-teal-600 pr-3">دليل الطلاب</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="البحث عن جاسم الطالب..."
              className="pr-10 h-11 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-teal-600 text-sm font-bold w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200/50 rounded-2xl px-6 h-11 font-black transition-all hover:-translate-y-0.5 shrink-0" />}>
                <Plus className="w-5 h-5 ml-2 -mr-1" />
                إضافة طالب
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 text-right">طالب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</Label>
                  <Input
                    id="name"
                    required
                    className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                    placeholder="الاسم الرباعي..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</Label>
                  <Input
                    id="whatsapp"
                    required
                    className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                    placeholder="مثال: 201234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reqAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ المطلوب (ج.م)</Label>
                  <Input
                    id="reqAmount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 text-xl font-black"
                    placeholder="مثال: 500"
                    value={formData.requiredAmount}
                    onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 text-lg font-black transition-all active:scale-95">
                    {submitting ? "جاري الإضافة..." : "حفظ بيانات الطالب"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                        className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl shadow-md font-black px-5 ml-2"
                        onClick={() => handleConfirmPayment(student.id)}
                        disabled={actionLoading === student.id}
                      >
                        {actionLoading === student.id ? "جاري..." : "تأكيد السداد"}
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-black text-sm ml-2">
                        <CheckCircle className="w-5 h-5" />
                        مدفوع
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 font-[--font-cairo]">
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/students/${student.id}`} className="flex items-center justify-between text-teal-600 font-bold">
                            <span>سجل المدفوعات</span>
                            <CreditCard className="w-4 h-4 ml-2" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(student)} className="flex items-center justify-between text-slate-600 font-bold cursor-pointer">
                          <span>تعديل التلميذ</span>
                          <Edit2 className="w-4 h-4 ml-2" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(student)} className="flex items-center justify-between text-red-600 font-bold focus:text-red-700 focus:bg-red-50 cursor-pointer">
                          <span>حذف التلميذ</span>
                          <Trash2 className="w-4 h-4 ml-2" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 text-right">تعديل بيانات الطالب</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</Label>
              <Input
                id="edit-name"
                required
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</Label>
              <Input
                id="edit-whatsapp"
                required
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reqAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ المطلوب (ج.م)</Label>
              <Input
                id="edit-reqAmount"
                type="number"
                min="1"
                required
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 text-xl font-black"
                value={formData.requiredAmount}
                onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
              />
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 text-lg font-black transition-all">
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 text-right">حذف الطالب</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-right">
            <p className="text-slate-600 font-bold text-lg">هل أنت متأكد من رغبتك في حذف الطالب <span className="text-red-600">{selectedStudent?.name}</span>؟</p>
            <p className="text-slate-400 text-sm mt-2 font-medium italic">هذا الإجراء لا يمكن التراجع عنه وسيتم حذف كافة السجلات المرتبطة به.</p>
          </div>
          <DialogFooter className="mt-8 flex gap-4 sm:justify-start">
            <Button
              variant="ghost"
              className="flex-1 h-12 rounded-2xl font-black hover:bg-slate-100"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-lg shadow-red-200/50"
              onClick={handleDeleteStudent}
              disabled={submitting}
            >
              {submitting ? "جاري الحذف..." : "نعم، حذف الطالب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
