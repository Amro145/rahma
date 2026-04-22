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
import { toast } from "sonner";

type Log = { id: number; type: "income" | "expense"; amount: number; category: string; description: string; createdAt: string };

export default function FinancePage() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: "income" as "income" | "expense", amount: "", category: "", description: "" });

  const { data, isLoading: loading, mutate } = useSWR<{ logs: Log[] }>("/api/finance/logs", () => apiFetch<{ logs: Log[] }>("/api/finance/logs"));
  const logs = data?.logs || [];

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>("/api/finance/logs", { method: "POST", body: JSON.stringify({ ...formData, amount: Number(formData.amount) }) });
      mutate({ logs: [json.log, ...logs] }, { revalidate: false });
      setFormData({ type: "income", amount: "", category: "", description: "" });
      setIsDialogOpen(false);
      toast.success("تم التسجيل");
    } catch { toast.error("فشل"); } finally { setSubmitting(false); }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>(`/api/finance/logs/${selectedLog.id}`, { method: "PATCH", body: JSON.stringify({ ...formData, amount: Number(formData.amount) }) });
      mutate({ logs: logs.map(l => l.id === selectedLog.id ? json.log : l) }, { revalidate: false });
      setIsEditDialogOpen(false);
      toast.success("تم التحديث");
    } catch { toast.error("فشل"); } finally { setSubmitting(false); }
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

  const openEditDialog = (log: Log) => { setSelectedLog(log); setFormData({ type: log.type, amount: log.amount.toString(), category: log.category, description: log.description || "" }); setIsEditDialogOpen(true); };
  const openDeleteDialog = (log: Log) => { setSelectedLog(log); setIsDeleteDialogOpen(true); };
  const filteredLogs = logs.filter(log => filter === "all" || log.type === filter);

  return (
    <div className="space-y-6 font-[--font-cairo]">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <h2 className="text-2xl font-black border-r-4 border-teal-600 pr-3">السجل المالي</h2>
        <div className="flex gap-2">
          {["all", "income", "expense"].map(f => (
            <button key={f} onClick={() => setFilter(f as "all" | "income" | "expense")} className={`px-4 py-2 rounded-xl font-bold ${filter === f ? "bg-teal-600 text-white" : "bg-slate-100"}`}>{f === "all" ? "الكل" : f === "income" ? "إيراد" : "مصروف"}</button>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-teal-600"><Plus className="w-4 h-4 ml-2" />إضافة</Button>} />
            <DialogContent className="rounded-[2rem] p-8">
              <DialogHeader><DialogTitle className="text-right text-xl font-black">إضافة سجل</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div className="flex gap-2"><label className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center ${formData.type === 'income' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-100'}`}><input type="radio" checked={formData.type === 'income'} onChange={() => setFormData({...formData, type: 'income'})} className="sr-only" /><span className="font-bold">إيراد</span></label><label className={`flex-1 p-3 border-2 rounded-xl cursor-pointer text-center ${formData.type === 'expense' ? 'bg-red-50 border-red-500' : 'border-slate-100'}`}><input type="radio" checked={formData.type === 'expense'} onChange={() => setFormData({...formData, type: 'expense'})} className="sr-only" /><span className="font-bold">مصروف</span></label></div>
                <div><Label className="text-right block">الفئة</Label><Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="مثال: تبرع" /></div>
                <div><Label className="text-right block">المبلغ</Label><Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
                <div><Label className="text-right block">ملاحظات</Label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                <Button type="submit" disabled={submitting} className="w-full bg-teal-600 text-white">{submitting ? "..." : "حفظ"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-[2rem] border bg-white shadow-sm">
        <Table>
          <TableHeader><TableRow className="bg-slate-50"><TableHead className="text-right font-black">النوع</TableHead><TableHead className="text-right font-black">الفئة</TableHead><TableHead className="text-right font-black">التفاصيل</TableHead><TableHead className="text-right font-black">التاريخ</TableHead><TableHead className="text-left font-black">المبلغ</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center">جاري...</TableCell></TableRow> : filteredLogs.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center">لا توجد بيانات</TableCell></TableRow> : filteredLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell><Badge variant="outline" className={log.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>{log.type === "income" ? "إيراد" : "مصروف"}</Badge></TableCell>
                <TableCell className="font-bold">{log.category}</TableCell>
                <TableCell className="text-slate-500">{log.description || "—"}</TableCell>
                <TableCell className="text-slate-500">{new Date(log.createdAt).toLocaleDateString("ar-EG")}</TableCell>
                <TableCell className={`text-left font-black ${log.type === "income" ? "text-emerald-600" : "text-red-600"}`}>{log.type === "income" ? "+" : "-"}{log.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}