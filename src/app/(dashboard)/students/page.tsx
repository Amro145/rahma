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
import { studentSchema, type StudentInput } from "@/lib/schemas";
import { sanitizeFormData, sanitizePhone } from "@/lib/sanitize";
import { toast } from "sonner";
import Link from "next/link";

type Student = {
  id: number;
  name: string;
  whatsapp: string;
  requiredAmount: number;
  status: "pending" | "paid";
  faculty: "medicine" | "dentistry" | "engineering" | "other";
  semester: "1" | "2" | "3" | "4" | "5" | "6";
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
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StudentInput, string>>>({});
  const [formData, setFormData] = useState<StudentInput>({
    name: "",
    whatsapp: "",
    requiredAmount: 0,
    faculty: "medicine" as const,
    semester: "1" as const,
  });

  const validateForm = (): boolean => {
    const sanitized = sanitizeFormData(formData);
    const result = studentSchema.safeParse(sanitizeFormData(formData));
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof StudentInput, string>> = {};
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      errors.forEach((err) => {
        const field = err.path[0] as keyof StudentInput;
        fieldErrors[field] = err.message;
      });
      setFormErrors(fieldErrors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleFieldChange = (field: keyof StudentInput, value: unknown) => {
    let processedValue = value;
    if (field === 'whatsapp' && typeof value === 'string') {
      processedValue = sanitizePhone(value);
    }
    if (field === 'requiredAmount') {
      processedValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partialSchema = studentSchema.pick({ [field]: true } as any);
    const result = partialSchema.safeParse({ [field]: processedValue });
    if (!result.success) {
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      const error = errors[0]?.message;
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ student: Student }>("/api/students", {
        method: "POST",
        body: JSON.stringify(sanitizeFormData(formData)),
      });

      mutate({ students: [json.student, ...students] }, { revalidate: false });

      setFormData({ name: "", whatsapp: "", requiredAmount: 0, faculty: "medicine", semester: "1" });
      setFormErrors({});
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
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ student: Student }>(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        body: JSON.stringify(sanitizeFormData(formData)),
      });

      mutate({ students: students.map(s => s.id === selectedStudent.id ? json.student : s) }, { revalidate: false });
      setFormErrors({});
      setIsEditDialogOpen(false);
      toast.success("تم تحديث بيانات الطالب");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تحديث البيانات";
      toast.error(message);
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
      requiredAmount: student.requiredAmount,
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
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[--font-cairo]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <h2 className="text-lg md:text-2xl font-black tracking-tight text-slate-900 border-r-4 border-[#B38E2D] pr-3">دليل الطلاب</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48 md:w-64 lg:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="البحث..."
              className="pr-10 h-10 md:h-11 bg-white border-slate-200 rounded-xl md:rounded-2xl shadow-sm focus-visible:ring-[#B38E2D] text-sm font-bold w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="w-full sm:w-auto bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white hover:from-[#D4A843] hover:to-[#B38E2D] shadow-lg shadow-[#B38E2D]/20 rounded-xl md:rounded-2xl px-4 md:px-6 h-10 md:h-11 font-black text-sm transition-all hover:-translate-y-0.5 shrink-0" />}>
                <Plus className="w-4 h-4 ml-1 md:ml-2 -mr-1" />
                <span>إضافة</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 font-[--font-cairo] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">طالب جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
                 <div className="space-y-2">
                   <Label htmlFor="name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</Label>
                   <Input id="name" required className={`rounded-xl md:rounded-2xl ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`} placeholder="الاسم..." value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
                   {formErrors.name && <p className="text-red-500 text-xs font-bold text-right">{formErrors.name}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</Label>
                   <Input id="whatsapp" required className={`rounded-xl md:rounded-2xl ${formErrors.whatsapp ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`} placeholder="+249..." value={formData.whatsapp} onChange={(e) => handleFieldChange('whatsapp', e.target.value)} />
                   {formErrors.whatsapp && <p className="text-red-500 text-xs font-bold text-right">{formErrors.whatsapp}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="reqAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ (ج.م)</Label>
                   <Input id="reqAmount" type="number" required className={`rounded-xl md:rounded-2xl ${formErrors.requiredAmount ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`} value={formData.requiredAmount || ''} onChange={(e) => handleFieldChange('requiredAmount', e.target.value)} />
                   {formErrors.requiredAmount && <p className="text-red-500 text-xs font-bold text-right">{formErrors.requiredAmount}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="faculty" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</Label>
                   <select id="faculty" required className={`w-full rounded-xl md:rounded-2xl ${formErrors.faculty ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 px-3 md:px-4 font-bold text-sm md:text-base`} value={formData.faculty} onChange={(e) => handleFieldChange('faculty', e.target.value)}>
                     <option value="medicine">طب</option>
                     <option value="dentistry">طب أسنان</option>
                     <option value="engineering">هندسة</option>
                     <option value="other">أخرى</option>
                   </select>
                   {formErrors.faculty && <p className="text-red-500 text-xs font-bold text-right">{formErrors.faculty}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="semester" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة</Label>
                   <select id="semester" required className={`w-full rounded-xl md:rounded-2xl ${formErrors.semester ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 px-3 md:px-4 font-bold text-sm md:text-base`} value={formData.semester} onChange={(e) => handleFieldChange('semester', e.target.value)}>
                     <option value="1">الأولى</option>
                     <option value="2">الثانية</option>
                     <option value="3">الثالثة</option>
                     <option value="4">الرابعة</option>
                     <option value="5">الخامسة</option>
                     <option value="6">السادسة</option>
                   </select>
                   {formErrors.semester && <p className="text-red-500 text-xs font-bold text-right">{formErrors.semester}</p>}
                 </div>
                 <Button type="submit" disabled={submitting || Object.keys(formErrors).some(k => formErrors[k as keyof StudentInput])} className="w-full h-11 md:h-14 bg-gradient-to-r from-[#B38E2D] to-[#8B6914] hover:from-[#D4A843] hover:to-[#B38E2D] text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base">
                   {submitting ? "جاري..." : "حفظ"}
                 </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl md:rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-right font-black text-sm">الاسم</TableHead>
              <TableHead className="text-right font-black text-sm hidden sm:table-cell">الكلية</TableHead>
              <TableHead className="text-right font-black text-sm hidden sm:table-cell">الفرقة</TableHead>
              <TableHead className="text-right font-black text-sm hidden md:table-cell">المبلغ</TableHead>
              <TableHead className="text-right font-black text-sm">الحالة</TableHead>
              <TableHead className="text-left font-black text-sm">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 md:h-40 text-center">جاري...</TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 md:h-40 text-center">لا يوجد طلاب</TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-black text-sm">{student.name}</TableCell>
                  <TableCell className="font-bold text-sm hidden sm:table-cell">{student.faculty}</TableCell>
                  <TableCell className="font-bold text-sm hidden sm:table-cell">{student.semester}</TableCell>
                  <TableCell className="font-black text-sm hidden md:table-cell">{student.requiredAmount.toLocaleString()} ج.م</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs md:text-sm ${student.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {student.status === "paid" ? "مدفوع" : "معلق"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    {student.status === "pending" ? (
                      <Button size="sm" className="bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-xs h-8" onClick={() => handleConfirmPayment(student.id)} disabled={actionLoading === student.id}>
                        {actionLoading === student.id ? "..." : "دفع"}
                      </Button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-xs">مدفوع</span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1 h-8 w-8"><MoreVertical className="w-3 h-3 md:w-4 md:h-4" /></Button>
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
        <DialogContent className="sm:max-w-md rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 font-[--font-cairo] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">تعديل بيانات الطالب</DialogTitle>
          </DialogHeader>
           <form onSubmit={handleEditStudent} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
             <div className="space-y-2">
               <Label htmlFor="edit-name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</Label>
               <Input id="edit-name" required className={`rounded-xl md:rounded-2xl ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`} placeholder="الاسم..." value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
               {formErrors.name && <p className="text-red-500 text-xs font-bold text-right">{formErrors.name}</p>}
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-whatsapp" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</Label>
               <Input id="edit-whatsapp" required className={`rounded-xl md:rounded-2xl ${formErrors.whatsapp ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`} placeholder="+249..." value={formData.whatsapp} onChange={(e) => handleFieldChange('whatsapp', e.target.value)} />
               {formErrors.whatsapp && <p className="text-red-500 text-xs font-bold text-right">{formErrors.whatsapp}</p>}
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-reqAmount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ (ج.م)</Label>
               <Input id="edit-reqAmount" type="number" required className={`rounded-xl md:rounded-2xl ${formErrors.requiredAmount ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`} value={formData.requiredAmount || ''} onChange={(e) => handleFieldChange('requiredAmount', e.target.value)} />
               {formErrors.requiredAmount && <p className="text-red-500 text-xs font-bold text-right">{formErrors.requiredAmount}</p>}
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-faculty" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</Label>
               <select id="edit-faculty" required className={`w-full rounded-xl md:rounded-2xl ${formErrors.faculty ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 px-3 md:px-4 font-bold text-sm md:text-base`} value={formData.faculty} onChange={(e) => handleFieldChange('faculty', e.target.value)}>
                 <option value="medicine">طب</option>
                 <option value="dentistry">طب أسنان</option>
                 <option value="engineering">هندسة</option>
                 <option value="other">أخرى</option>
               </select>
               {formErrors.faculty && <p className="text-red-500 text-xs font-bold text-right">{formErrors.faculty}</p>}
             </div>
             <div className="space-y-2">
               <Label htmlFor="edit-semester" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة</Label>
               <select id="edit-semester" required className={`w-full rounded-xl md:rounded-2xl ${formErrors.semester ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 px-3 md:px-4 font-bold text-sm md:text-base`} value={formData.semester} onChange={(e) => handleFieldChange('semester', e.target.value)}>
                 <option value="1">الأولى</option>
                 <option value="2">الثانية</option>
                 <option value="3">الثالثة</option>
                 <option value="4">الرابعة</option>
                 <option value="5">الخامسة</option>
                 <option value="6">السادسة</option>
               </select>
               {formErrors.semester && <p className="text-red-500 text-xs font-bold text-right">{formErrors.semester}</p>}
             </div>
             <Button type="submit" disabled={submitting || Object.keys(formErrors).some(k => formErrors[k as keyof StudentInput])} className="w-full h-11 md:h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base">
               {submitting ? "جاري..." : "حفظ التعديلات"}
             </Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-black text-right">حذف الطالب</DialogTitle>
          </DialogHeader>
          <p className="text-right text-sm md:text-base">هل أنت متأكد من حذف <span className="font-bold">{selectedStudent?.name}</span>؟</p>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 sm:flex-none rounded-xl h-10">إلغاء</Button>
            <Button className="flex-1 sm:flex-none bg-red-600 text-white rounded-xl h-10" onClick={handleDeleteStudent} disabled={submitting}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}