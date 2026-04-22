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
import Link from "next/link";

type Student = {
  id: number;
  name: string;
  whatsapp: string;
  requiredAmount: number;
  status: "pending" | "paid";
  faculty: string;
  semester: string;
  createdAt: string;
};

export default function StudentsPage() {
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
    faculty: "medicine",
    semester: "1",
  });

  const { data, isLoading: loading, mutate } = useSWR<{ students: Student[] }>(
    "/api/students",
    () => apiFetch<{ students: Student[] }>("/api/students")
  );
  
  const students = data?.students || [];

  const handleConfirmPayment = async (id: number) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    setActionLoading(id);
    try {
      const now = new Date();
      await apiFetch(`/api/students/${id}/pay`, {
        method: "PATCH",
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
    setSubmitting(true);
    try {
      const json = await apiFetch<{ student: Student }>("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp,
          requiredAmount: Number(formData.requiredAmount),
          faculty: formData.faculty,
          semester: formData.semester,
        }),
      });

      mutate({ students: [json.student, ...students] }, { revalidate: false });
      
      setFormData({ name: "", whatsapp: "", requiredAmount: "", faculty: "medicine", semester: "1" });
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
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ student: Student }>(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp,
          requiredAmount: Number(formData.requiredAmount),
          faculty: formData.faculty,
          semester: formData.semester,
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
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/students/${selectedStudent.id}`, {
        method: "DELETE",
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
      faculty: student.faculty,
      semester: student.semester,
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
              placeholder="البحث عن طالب..."
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
                  <Input id="name" required className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold" placeholder="الاسم..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</Label>
                  <Input id="whatsapp" required className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold" placeholder="2012..." value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reqAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ (ج.م)</Label>
                  <Input id="reqAmount" type="number" required className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold" value={formData.requiredAmount} onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</Label>
                  <select id="faculty" required className="w-full rounded-2xl border-slate-200 bg-white h-12 px-4 font-bold" value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}>
                    <option value="medicine">طب</option>
                    <option value="dentistry">طب أسنان</option>
                    <option value="engineering">هندسة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة</Label>
                  <select id="semester" required className="w-full rounded-2xl border-slate-200 bg-white h-12 px-4 font-bold" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}>
                    <option value="1">الأولى</option>
                    <option value="2">الثانية</option>
                    <option value="3">الثالثة</option>
                    <option value="4">الرابعة</option>
                    <option value="5">الخامسة</option>
                    <option value="6">السادسة</option>
                  </select>
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black">
                  {submitting ? "جاري..." : "حفظ"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-right font-black">الاسم</TableHead>
              <TableHead className="text-right font-black">الكلية</TableHead>
              <TableHead className="text-right font-black">الفرقة</TableHead>
              <TableHead className="text-right font-black">المبلغ</TableHead>
              <TableHead className="text-right font-black">الحالة</TableHead>
              <TableHead className="text-left font-black">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">جاري...</TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">لا يوجد طلاب</TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-black">{student.name}</TableCell>
                  <TableCell className="font-bold">{student.faculty}</TableCell>
                  <TableCell className="font-bold">{student.semester}</TableCell>
                  <TableCell className="font-black">{student.requiredAmount.toLocaleString()} ج.م</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={student.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                      {student.status === "paid" ? "مدفوع" : "معلق"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    {student.status === "pending" ? (
                      <Button size="sm" className="bg-teal-600" onClick={() => handleConfirmPayment(student.id)} disabled={actionLoading === student.id}>
                        {actionLoading === student.id ? "..." : "دفع"}
                      </Button>
                    ) : (
                      <span className="text-emerald-600 font-bold">مدفوع</span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link href={`/students/${student.id}`}>سجل الدفع</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(student)}>تعديل</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(student)} className="text-red-600">حذف</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right">تعديل الطالب</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div><Label>الاسم</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>الواتساب</Label><Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} /></div>
            <div><Label>المبلغ</Label><Input type="number" value={formData.requiredAmount} onChange={e => setFormData({...formData, requiredAmount: e.target.value})} /></div>
            <div><Label>الكلية</Label><select className="w-full border rounded p-2" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})}><option value="medicine">طب</option><option value="dentistry">طب أسنان</option><option value="engineering">هندسة</option><option value="other">أخرى</option></select></div>
            <div><Label>الفرقة</Label><select className="w-full border rounded p-2" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select></div>
            <Button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white">{submitting ? "..." : "حفظ"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-right">حذف الطالب</DialogTitle>
          </DialogHeader>
          <p className="text-right">هل أنت متأكد من حذف {selectedStudent?.name}؟</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</Button>
            <Button className="bg-red-600 text-white" onClick={handleDeleteStudent} disabled={submitting}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}