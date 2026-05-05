"use client";

import { useState } from "react";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { financeLogSchema, type FinanceLogInput } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sanitizeNumber } from "@/lib/sanitize";
import { toast } from "sonner";

type Log = { id: number; type: "income" | "expense"; amount: number; category: string; description: string; createdAt: string };

export default function FinancePage() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading: loading, mutate } = useSWR<{ logs: Log[] }>("/api/finance/logs", () => apiFetch<{ logs: Log[] }>("/api/finance/logs"));
  const logs = data?.logs || [];

  const createForm = useForm<FinanceLogInput>({
    resolver: zodResolver(financeLogSchema),
    mode: 'onChange',
    defaultValues: {
      type: "income",
      amount: 0,
      category: "",
      description: "",
    },
  });

  const editForm = useForm<FinanceLogInput>({
    resolver: zodResolver(financeLogSchema),
    mode: 'onChange',
    defaultValues: {
      type: "income",
      amount: 0,
      category: "",
      description: "",
    },
  });

  const handleCreateRecord = async (data: FinanceLogInput) => {
    setSubmitting(true);
    try {
      const sanitized = {
        ...data,
        amount: sanitizeNumber(data.amount),
      };

      const json = await apiFetch<{ log: Log }>("/api/finance/logs", {
        method: "POST",
        body: JSON.stringify(sanitized),
      });

      mutate({ logs: [json.log, ...logs] }, { revalidate: false });
      createForm.reset();
      setIsDialogOpen(false);
      toast.success("تم التسجيل");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = async (data: FinanceLogInput) => {
    if (!selectedLog) return;
    setSubmitting(true);
    try {
      const sanitized = {
        ...data,
        amount: sanitizeNumber(data.amount),
      };

      const json = await apiFetch<{ log: Log }>(`/api/finance/logs/${selectedLog.id}`, {
        method: "PATCH",
        body: JSON.stringify(sanitized),
      });

      mutate({ logs: logs.map(l => l.id === selectedLog.id ? json.log : l) }, { revalidate: false });
      setIsEditDialogOpen(false);
      toast.success("تم التحديث");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedLog) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/finance/logs/${selectedLog.id}`, { method: "DELETE" });
      mutate({ logs: logs.filter(l => l.id !== selectedLog.id) }, { revalidate: false });
      setIsDeleteDialogOpen(false);
      toast.success("تم الحذف");
    } catch {
      toast.error("فشل");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (log: Log) => {
    setSelectedLog(log);
    editForm.reset({
      type: log.type,
      amount: log.amount,
      category: log.category,
      description: log.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (log: Log) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const filteredLogs = logs.filter(log => filter === "all" || log.type === filter);

  const renderFormFields = (
    form: ReturnType<typeof useForm<FinanceLogInput>>,
    prefix: string
  ) => (
    <>
      <div className="flex gap-2">
        <label className={`flex-1 p-2 md:p-3 border-2 rounded-xl cursor-pointer text-center text-sm ${form.watch('type') === 'income' ? 'bg-[#B38E2D]/10 border-[#B38E2D]' : 'border-slate-100'}`}>
          <input
            type="radio"
            {...form.register('type')}
            value="income"
            className="sr-only"
            onChange={() => form.setValue('type', 'income')}
          />
          <span className="font-bold">إيراد</span>
        </label>
        <label className={`flex-1 p-2 md:p-3 border-2 rounded-xl cursor-pointer text-center text-sm ${form.watch('type') === 'expense' ? 'bg-red-50 border-red-500' : 'border-slate-100'}`}>
          <input
            type="radio"
            {...form.register('type')}
            value="expense"
            className="sr-only"
            onChange={() => form.setValue('type', 'expense')}
          />
          <span className="font-bold">مصروف</span>
        </label>
      </div>
      <div className="space-y-2">
        <Label className="text-right block text-slate-400 font-black text-xs uppercase">الفئة</Label>
        <Input
          {...form.register('category')}
          placeholder="مثال: تبرع"
          className={`rounded-xl h-11 ${form.formState.errors.category ? 'border-red-300 bg-red-50' : ''}`}
        />
        {form.formState.errors.category && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.category.message}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-right block text-slate-400 font-black text-xs uppercase">المبلغ</Label>
        <Input
          type="number"
          {...form.register('amount', { valueAsNumber: true })}
          className={`rounded-xl h-11 ${form.formState.errors.amount ? 'border-red-300 bg-red-50' : ''}`}
        />
        {form.formState.errors.amount && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.amount.message}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-right block text-slate-400 font-black text-xs uppercase">ملاحظات</Label>
        <Input
          {...form.register('description')}
          className={`rounded-xl h-11 ${form.formState.errors.description ? 'border-red-300 bg-red-50' : ''}`}
        />
        {form.formState.errors.description && <p className="text-red-500 text-xs font-bold text-right">{form.formState.errors.description.message}</p>}
      </div>
    </>
  );

  return (
    <div className="space-y-4 md:space-y-6 font-[--font-cairo]">
      <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4">
        <h2 className="text-lg md:text-2xl font-black border-r-4 border-[#B38E2D] pr-3">السجل المالي</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
           {["all", "income", "expense"].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f as "all" | "income" | "expense")}
               className={`flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-xl font-bold text-sm min-h-[2.5rem] ${filter === f ? "bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white" : "bg-slate-100"}`}
             >
               {f === "all" ? "الكل" : f === "income" ? "إيراد" : "مصروف"}
             </button>
           ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-[#B38E2D] to-[#8B6914] h-10 px-3 md:px-4"><Plus className="w-4 h-4 ml-1 md:ml-2" /><span className="hidden xs:inline">إضافة</span></Button>} />
            <DialogContent className="rounded-2xl md:rounded-[2rem] p-4 md:p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-xl md:text-2xl font-black text-right">إضافة سجل</DialogTitle></DialogHeader>
              <form onSubmit={createForm.handleSubmit(handleCreateRecord)} className="space-y-4">
                {renderFormFields(createForm, 'create')}
                <Button
                  type="submit"
                  disabled={submitting || !createForm.formState.isValid}
                  className="w-full h-11 bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white rounded-xl font-black"
                >
                  {submitting ? "..." : "حفظ"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

       <div className="hidden md:block rounded-2xl md:rounded-[2rem] border bg-white shadow-sm overflow-hidden w-full">
         <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-right font-black text-sm">النوع</TableHead>
              <TableHead className="text-right font-black text-sm hidden sm:table-cell">الفئة</TableHead>
              <TableHead className="text-right font-black text-sm hidden md:table-cell">التفاصيل</TableHead>
              <TableHead className="text-right font-black text-sm hidden lg:table-cell">التاريخ</TableHead>
              <TableHead className="text-left font-black text-sm">المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 md:h-32">جاري...</TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 md:h-32">لا توجد بيانات</TableCell>
              </TableRow>
            ) : (
              filteredLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${log.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {log.type === "income" ? "إيراد" : "مصروف"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-sm hidden sm:table-cell">{log.category}</TableCell>
                  <TableCell className="text-slate-500 text-sm hidden md:table-cell">{log.description || "—"}</TableCell>
                  <TableCell className="text-slate-500 text-sm hidden lg:table-cell">{new Date(log.createdAt).toLocaleDateString("ar-EG")}</TableCell>
                  <TableCell className={`text-left font-black text-sm ${log.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {log.type === "income" ? "+" : "-"}{log.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 min-h-[2rem] min-w-[2rem]">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(log)}>تعديل</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(log)} className="text-red-600">حذف</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
         </Table>
       </div>

       <div className="md:hidden flex flex-col gap-4 w-full">
         {loading ? (
           <div className="text-center py-8 text-slate-400">جاري...</div>
         ) : filteredLogs.length === 0 ? (
           <div className="text-center py-8 text-slate-400">لا توجد بيانات</div>
         ) : (
           filteredLogs.map(log => (
             <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className={`text-xs ${log.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                     {log.type === "income" ? "إيراد" : "مصروف"}
                   </Badge>
                   <span className="font-bold text-sm text-slate-800">{log.category}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className={`font-black text-sm ${log.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                     {log.type === "income" ? "+" : "-"}{log.amount.toLocaleString()}
                   </span>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0 min-h-[2rem] min-w-[2rem] -mt-1 -mr-2">
                         <MoreVertical className="w-4 h-4" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => openEditDialog(log)}>تعديل</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => openDeleteDialog(log)} className="text-red-600">حذف</DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </div>
               {log.description && <div className="text-slate-500 text-sm">{log.description}</div>}
               <div className="text-slate-400 text-xs">{new Date(log.createdAt).toLocaleDateString("ar-EG")}</div>
             </div>
           ))
         )}
       </div>

       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl md:rounded-[2rem] p-4 md:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl md:text-2xl font-black text-right">تعديل سجل</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditRecord)} className="space-y-4 mt-4">
            {renderFormFields(editForm, 'edit')}
            <Button
              type="submit"
              disabled={submitting || !editForm.formState.isValid}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black"
            >
              {submitting ? "..." : "حفظ التعديلات"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-black text-right">حذف السجل</DialogTitle>
          </DialogHeader>
          <p className="text-right text-sm md:text-base">هل أنت متأكد من حذف هذا السجل؟</p>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 sm:flex-none rounded-xl h-10">إلغاء</Button>
            <Button className="flex-1 sm:flex-none bg-red-600 text-white rounded-xl h-10" onClick={handleDeleteRecord} disabled={submitting}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
