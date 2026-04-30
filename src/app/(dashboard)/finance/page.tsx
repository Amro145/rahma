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
import { sanitizeFormData } from "@/lib/sanitize";
import { toast } from "sonner";

type Log = { id: number; type: "income" | "expense"; amount: number; category: string; description: string; createdAt: string };

export default function FinancePage() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FinanceLogInput, string>>>({});
  const [formData, setFormData] = useState<FinanceLogInput>({ type: "income", amount: 0, category: "", description: "" });

  const validateForm = (): boolean => {
    const result = financeLogSchema.safeParse(sanitizeFormData(formData));
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FinanceLogInput, string>> = {};
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      errors.forEach((err) => {
        const field = err.path[0] as keyof FinanceLogInput;
        fieldErrors[field] = err.message;
      });
      setFormErrors(fieldErrors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleFieldChange = (field: keyof FinanceLogInput, value: unknown) => {
    let processedValue = value;
    if (field === 'amount') {
      processedValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partialSchema = financeLogSchema.pick({ [field]: true } as any);
    const result = partialSchema.safeParse({ [field]: processedValue });
    if (!result.success) {
      const errors = (result.error as unknown as { errors: Array<{ path: (string | number)[]; message: string }> }).errors;
      const error = errors[0]?.message;
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const { data, isLoading: loading, mutate } = useSWR<{ logs: Log[] }>("/api/finance/logs", () => apiFetch<{ logs: Log[] }>("/api/finance/logs"));
  const logs = data?.logs || [];

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>("/api/finance/logs", { method: "POST", body: JSON.stringify(sanitizeFormData(formData)) });
      mutate({ logs: [json.log, ...logs] }, { revalidate: false });
      setFormData({ type: "income", amount: 0, category: "", description: "" });
      setFormErrors({});
      setIsDialogOpen(false);
      toast.success("تم التسجيل");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل";
      toast.error(message);
    } finally { setSubmitting(false); }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>(`/api/finance/logs/${selectedLog.id}`, { method: "PATCH", body: JSON.stringify(sanitizeFormData(formData)) });
      mutate({ logs: logs.map(l => l.id === selectedLog.id ? json.log : l) }, { revalidate: false });
      setFormErrors({});
      setIsEditDialogOpen(false);
      toast.success("تم التحديث");
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل";
      toast.error(message);
    } finally { setSubmitting(false); }
  };

  const handleDeleteRecord = async () => {
    if (!selectedLog) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/finance/logs/${selectedLog.id}`, { method: "DELETE" });
      mutate({ logs: logs.filter(l => l.id !== selectedLog.id) }, { revalidate: false });
      setIsDeleteDialogOpen(false);
      toast.success("تم الحذف");
    } catch { toast.error("فشل"); } finally { setSubmitting(false); }
  };

  const openEditDialog = (log: Log) => { setSelectedLog(log); setFormData({ type: log.type, amount: log.amount, category: log.category, description: log.description || "" }); setIsEditDialogOpen(true); };
  const openDeleteDialog = (log: Log) => { setSelectedLog(log); setIsDeleteDialogOpen(true); };
  const filteredLogs = logs.filter(log => filter === "all" || log.type === filter);

  return (
    <div className="space-y-4 md:space-y-6 font-[--font-cairo]">
      <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4">
        <h2 className="text-lg md:text-2xl font-black border-r-4 border-[#B38E2D] pr-3">السجل المالي</h2>
        <div className="flex flex-wrap gap-2">
          {["all", "income", "expense"].map(f => (
            <button key={f} onClick={() => setFilter(f as "all" | "income" | "expense")} className={`px-3 py-2 rounded-xl font-bold text-sm ${filter === f ? "bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white" : "bg-slate-100"}`}>{f === "all" ? "الكل" : f === "income" ? "إيراد" : "مصروف"}</button>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-gradient-to-r from-[#B38E2D] to-[#8B6914] h-10 px-3 md:px-4"><Plus className="w-4 h-4 ml-1 md:ml-2" /><span className="hidden xs:inline">إضافة</span></Button>} />
            <DialogContent className="rounded-2xl md:rounded-[2rem] p-4 md:p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-xl md:text-2xl font-black text-right">إضافة سجل</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div className="flex gap-2">
                  <label className={`flex-1 p-2 md:p-3 border-2 rounded-xl cursor-pointer text-center text-sm ${formData.type === 'income' ? 'bg-[#B38E2D]/10 border-[#B38E2D]' : 'border-slate-100'}`}>
                    <input type="radio" checked={formData.type === 'income'} onChange={() => setFormData({ ...formData, type: 'income'})} className="sr-only" />
                    <span className="font-bold">إيراد</span>
                  </label>
                  <label className={`flex-1 p-2 md:p-3 border-2 rounded-xl cursor-pointer text-center text-sm ${formData.type === 'expense' ? 'bg-red-50 border-red-500' : 'border-slate-100'}`}>
                    <input type="radio" checked={formData.type === 'expense'} onChange={() => setFormData({ ...formData, type: 'expense'})} className="sr-only" />
                    <span className="font-bold">مصروف</span>
                  </label>
                </div>
                 <div className="space-y-2">
                   <Label className="text-right block text-slate-400 font-black text-xs uppercase">الفئة</Label>
                   <Input required value={formData.category} onChange={e => handleFieldChange('category', e.target.value)} placeholder="مثال: تبرع" className={`rounded-xl h-11 ${formErrors.category ? 'border-red-300 bg-red-50' : ''}`} />
                   {formErrors.category && <p className="text-red-500 text-xs font-bold text-right">{formErrors.category}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label className="text-right block text-slate-400 font-black text-xs uppercase">المبلغ</Label>
                   <Input type="number" required value={formData.amount || ''} onChange={e => handleFieldChange('amount', e.target.value)} className={`rounded-xl h-11 ${formErrors.amount ? 'border-red-300 bg-red-50' : ''}`} />
                   {formErrors.amount && <p className="text-red-500 text-xs font-bold text-right">{formErrors.amount}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label className="text-right block text-slate-400 font-black text-xs uppercase">ملاحظات</Label>
                   <Input value={formData.description} onChange={e => handleFieldChange('description', e.target.value)} className={`rounded-xl h-11 ${formErrors.description ? 'border-red-300 bg-red-50' : ''}`} />
                   {formErrors.description && <p className="text-red-500 text-xs font-bold text-right">{formErrors.description}</p>}
                 </div>
                 <Button type="submit" disabled={submitting || Object.keys(formErrors).some(k => formErrors[k as keyof FinanceLogInput])} className="w-full h-11 bg-gradient-to-r from-[#B38E2D] to-[#8B6914] text-white rounded-xl font-black">{submitting ? "..." : "حفظ"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl md:rounded-[2rem] border bg-white shadow-sm overflow-x-auto">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}