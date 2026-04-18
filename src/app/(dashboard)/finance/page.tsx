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
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Log = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  createdAt: string;
};

export default function FinancePage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const json = await apiFetch<{ logs: Log[] }>("/api/finance/logs");
      setLogs(json.logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>("/api/finance/logs", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      setLogs((prev) => [json.log, ...prev]);
      
      setFormData({ type: "income", amount: "", category: "", description: "" });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error creating record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>(`/api/finance/logs/${selectedLog.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      setLogs((prev) => prev.map(l => l.id === selectedLog.id ? json.log : l));
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedLog) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/finance/logs/${selectedLog.id}`, {
        method: "DELETE",
      });
      setLogs((prev) => prev.filter(l => l.id !== selectedLog.id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (log: Log) => {
    setSelectedLog(log);
    setFormData({
      type: log.type,
      amount: log.amount.toString(),
      category: log.category,
      description: log.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (log: Log) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[--font-cairo]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 border-r-4 border-teal-600 pr-3">سجل المعاملات المالية</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100/80 rounded-2xl p-1.5 shadow-inner border border-slate-200 backdrop-blur-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all duration-300 ${
                filter === "all" ? "bg-white text-slate-900 shadow-md scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all duration-300 ${
                filter === "income" ? "bg-white text-emerald-600 shadow-md scale-105" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              الإيرادات
            </button>
            <button
              onClick={() => setFilter("expense")}
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all duration-300 ${
                filter === "expense" ? "bg-white text-red-600 shadow-md scale-105" : "text-slate-500 hover:text-red-700"
              }`}
            >
              المصروفات
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200/50 rounded-2xl px-6 h-11 font-black transition-all hover:-translate-y-0.5" />}>
                <Plus className="w-5 h-5 ml-2 -mr-1" />
                إضافة سجل جديد
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-900 text-right">تسجيل حركة مالية</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
                <div className="space-y-3">
                  <Label className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">نوع المعاملة</Label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                      <input
                        type="radio"
                        value="income"
                        className="sr-only"
                        checked={formData.type === "income"}
                        onChange={() => setFormData({ ...formData, type: "income" })}
                      />
                      <span className="text-sm font-black">إيراد جديد</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                      <input
                        type="radio"
                        value="expense"
                        className="sr-only"
                        checked={formData.type === "expense"}
                        onChange={() => setFormData({ ...formData, type: "expense" })}
                      />
                      <span className="text-sm font-black">مصروف هالك</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفئة أو التصنيف</Label>
                  <Input
                    id="category"
                    required
                    className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                    placeholder="مثال: تبرع عام، أدوات مكتبية..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ (بالجنيه المصري)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 text-xl font-black"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">ملاحظات إضافية</Label>
                  <Input
                    id="description"
                    className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                    placeholder="اكتب أي تفاصيل أخرى هنا..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={submitting} className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 text-lg font-black transition-all active:scale-95">
                    {submitting ? "جاري الحفظ..." : "حفظ السجل الآن"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
              <TableHead className="font-black text-slate-500 h-14 uppercase text-xs tracking-widest text-right pr-8">النوع</TableHead>
              <TableHead className="font-black text-slate-500 h-14 uppercase text-xs tracking-widest text-right">التصنيف</TableHead>
              <TableHead className="font-black text-slate-500 h-14 uppercase text-xs tracking-widest text-right">التفاصيل</TableHead>
              <TableHead className="font-black text-slate-500 h-14 uppercase text-xs tracking-widest text-right">التاريخ</TableHead>
              <TableHead className="font-black text-slate-500 h-14 uppercase text-xs tracking-widest text-left pl-8">المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold">جاري تحديث السجلات المالية...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-bold">
                  لا توجد معاملات مسجلة في هذه الفئة.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="transition-all hover:bg-slate-50/50 border-b border-slate-50 last:border-0 group">
                  <TableCell className="py-5 pr-8">
                    <Badge
                      variant="outline"
                      className={
                        log.type === "income"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full px-4 py-1 text-xs font-black shadow-sm"
                          : "bg-red-50 text-red-600 border-red-100 rounded-full px-4 py-1 text-xs font-black shadow-sm"
                      }
                    >
                      {log.type === "income" ? "إيراد" : "مصروف"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 font-black text-slate-800">{log.category}</TableCell>
                  <TableCell className="py-5 text-slate-400 font-bold max-w-xs truncate group-hover:text-slate-600 transition-colors">
                    {log.description || <span className="italic text-slate-200">لا يوجد وصف</span>}
                  </TableCell>
                  <TableCell className="py-5 text-slate-400 font-bold text-sm">
                    {new Intl.DateTimeFormat('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(log.createdAt))}
                  </TableCell>
                  <TableCell className={`py-5 text-left pl-8 text-lg font-black tracking-tighter ${log.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center">
                        <span>{log.type === "income" ? "+" : "-"}</span>
                        <span>{log.amount.toLocaleString()}</span>
                        <span className="text-xs mr-1 opacity-50 font-bold">ج.م</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 font-[--font-cairo]">
                          <DropdownMenuItem onClick={() => openEditDialog(log)} className="flex items-center justify-between text-slate-600 font-bold cursor-pointer">
                            <span>تعديل السجل</span>
                            <Edit2 className="w-4 h-4 ml-2" />
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(log)} className="flex items-center justify-between text-red-600 font-bold focus:text-red-700 focus:bg-red-50 cursor-pointer">
                            <span>حذف السجل</span>
                            <Trash2 className="w-4 h-4 ml-2" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 text-right">تعديل حركة مالية</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRecord} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
            <div className="space-y-3">
              <Label className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">نوع المعاملة</Label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                  <input
                    type="radio"
                    value="income"
                    className="sr-only"
                    checked={formData.type === "income"}
                    onChange={() => setFormData({ ...formData, type: "income" })}
                  />
                  <span className="text-sm font-black">إيراد</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                  <input
                    type="radio"
                    value="expense"
                    className="sr-only"
                    checked={formData.type === "expense"}
                    onChange={() => setFormData({ ...formData, type: "expense" })}
                  />
                  <span className="text-sm font-black">مصروف</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">الفئة أو التصنيف</Label>
              <Input
                id="edit-category"
                required
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">المبلغ (بالجنيه المصري)</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                required
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 text-xl font-black"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">ملاحظات إضافية</Label>
              <Input
                id="edit-description"
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <DialogTitle className="text-2xl font-black text-slate-900 text-right">حذف السجل</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-right">
            <p className="text-slate-600 font-bold text-lg">هل أنت متأكد من رغبتك في حذف هذا السجل؟</p>
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-slate-400 text-xs font-black uppercase tracking-widest">تفاصيل السجل</p>
               <p className="text-slate-900 font-black mt-1">{selectedLog?.category}</p>
               <p className={`font-black mt-1 ${selectedLog?.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                 {selectedLog?.type === 'income' ? '+' : '-'}{selectedLog?.amount.toLocaleString()} ج.م
               </p>
            </div>
            <p className="text-slate-400 text-sm mt-4 font-medium italic">هذا الإجراء لا يمكن التراجع عنه.</p>
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
              onClick={handleDeleteRecord}
              disabled={submitting}
            >
              {submitting ? "جاري الحذف..." : "نعم، حذف السجل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
