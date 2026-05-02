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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sanitizePhone, sanitizeNumber } from "@/lib/sanitize";
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

  const { data: meData } = useSWR<{ user: { role: string } }>(
    "/api/me",
    () => apiFetch<{ user: { role: string } }>("/api/me")
  );

  const { data, isLoading: loading, mutate } = useSWR<{ students: Student[] }>(
    "/api/students",
    () => apiFetch<{ students: Student[] }>("/api/students")
  );

  const students = data?.students || [];

  const createForm = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      whatsapp: "",
      requiredAmount: 0,
      faculty: "medicine" as const,
      semester: "1" as const,
    },
  });

  const editForm = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    mode: 'onChange',
    defaultValues: {
      name: "",
      whatsapp: "",
      requiredAmount: 0,
      faculty: "medicine" as const,
      semester: "1" as const,
    },
  });

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

  const onCreateSubmit = async (data: StudentInput) => {
    setSubmitting(true);
    try {
      const sanitized = {
        ...data,
        whatsapp: data.whatsapp ? sanitizePhone(data.whatsapp) : undefined,
        requiredAmount: sanitizeNumber(data.requiredAmount),
      };

      const json = await apiFetch<{ student: Student }>("/api/students", {
        method: "POST",
        body: JSON.stringify(sanitized),
      });

      mutate({ students: [json.student, ...students] }, { revalidate: false });
      createForm.reset();
      setIsDialogOpen(false);
      toast.success("تم إضافة الطالب بنجاح");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل إضافة الطالب";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: StudentInput) => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      const sanitized = {
        ...data,
        whatsapp: data.whatsapp ? sanitizePhone(data.whatsapp) : undefined,
        requiredAmount: sanitizeNumber(data.requiredAmount),
      };

      const json = await apiFetch<{ student: Student }>(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        body: JSON.stringify(sanitized),
      });

      mutate({ students: students.map(s => s.id === selectedStudent.id ? json.student : s) }, { revalidate: false });
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
    editForm.reset({
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

  const renderFormFields = (
    form: ReturnType<typeof useForm<StudentInput>>,
    prefix: string
  ) => (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-name`} className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم الطالب</Label>
        <Input
          id={`${prefix}-name`}
          {...form.register('name')}
          className={`rounded-xl md:rounded-2xl ${form.formState.errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`}
          placeholder="الاسم..."
        />
        {form.formState.errors.name && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-whatsapp`} className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">رقم الواتساب</Label>
        <Input
          id={`${prefix}-whatsapp`}
          {...form.register('whatsapp')}
          className={`rounded-xl md:rounded-2xl ${form.formState.errors.whatsapp ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`}
          placeholder="+249..."
        />
        {form.formState.errors.whatsapp && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.whatsapp.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-reqAmount`} className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ (ج.م)</Label>
        <Input
          id={`${prefix}-reqAmount`}
          type="number"
          {...form.register('requiredAmount', { valueAsNumber: true })}
          className={`rounded-xl md:rounded-2xl ${form.formState.errors.requiredAmount ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 focus-visible:ring-[#B38E2D] font-bold`}
        />
        {form.formState.errors.requiredAmount && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.requiredAmount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-faculty`} className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الكلية</Label>
        <select
          id={`${prefix}-faculty`}
          {...form.register('faculty')}
          className={`w-full rounded-xl md:rounded-2xl ${form.formState.errors.faculty ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 px-3 md:px-4 font-bold text-sm md:text-base`}
        >
          <option value="medicine">طب</option>
          <option value="dentistry">طب أسنان</option>
          <option value="engineering">هندسة</option>
          <option value="other">أخرى</option>
        </select>
        {form.formState.errors.faculty && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.faculty.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-semester`} className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفرقة</Label>
        <select
          id={`${prefix}-semester`}
          {...form.register('semester')}
          className={`w-full rounded-xl md:rounded-2xl ${form.formState.errors.semester ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} h-11 md:h-12 px-3 md:px-4 font-bold text-sm md:text-base`}
        >
          <option value="1">الأولى</option>
          <option value="2">الثانية</option>
          <option value="3">الثالثة</option>
          <option value="4">الرابعة</option>
          <option value="5">الخامسة</option>
          <option value="6">السادسة</option>
        </select>
        {form.formState.errors.semester && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.semester.message}</p>}
      </div>
    </>
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
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
                {renderFormFields(createForm, 'create')}
                <Button
                  type="submit"
                  disabled={submitting || !createForm.formState.isValid}
                  className="w-full h-11 md:h-14 bg-gradient-to-r from-[#B38E2D] to-[#8B6914] hover:from-[#D4A843] hover:to-[#B38E2D] text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base"
                >
                  {submitting ? "جاري..." : "حفظ"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

       <div className="rounded-2xl md:rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-x-auto -mx-3 md:mx-0">
         <div className="min-w-[640px] md:min-w-0">
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
                       <Button size="sm" className="bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-xs h-8 min-h-[2rem] min-w-[2rem]" onClick={() => handleConfirmPayment(student.id)} disabled={actionLoading === student.id}>
                         {actionLoading === student.id ? "..." : "دفع"}
                       </Button>
                     ) : (
                       <span className="text-emerald-600 font-bold text-xs">مدفوع</span>
                     )}
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="ml-1 h-8 w-8 min-h-[2rem] min-w-[2rem]"><MoreVertical className="w-3 h-3 md:w-4 md:h-4" /></Button>
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
       </div>

       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 font-[--font-cairo] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">تعديل بيانات الطالب</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
            {renderFormFields(editForm, 'edit')}
            <Button
              type="submit"
              disabled={submitting || !editForm.formState.isValid}
              className="w-full h-11 md:h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base"
            >
              {submitting ? "جاري..." : "حفظ التعديلات"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {(meData?.user?.role === "management" || meData?.user?.role === "admin") && (
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
      )}
    </div>
  );
}
