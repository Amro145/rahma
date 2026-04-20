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
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "@/lib/auth.client";

type Log = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  createdAt: string;
};

export default function FinancePage() {
  const { data: session } = useSession();
  const activeOrgId = session?.session?.activeOrganizationId;

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

  const { data, isLoading: loading, mutate } = useSWR<{ logs: Log[] }>(
    activeOrgId ? `/api/finance/logs?orgId=${activeOrgId}` : null,
    () => apiFetch<{ logs: Log[] }>("/api/finance/logs", { orgId: activeOrgId as string })
  );
  
  const logs = data?.logs || [];

  const validateForm = () => {
    const amount = Number(formData.amount.replace(/,/g, '').trim());
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return null;
    }
    if (!formData.category.trim()) {
      toast.error("يرجى إدخال التصنيف");
      return null;
    }
    return amount;
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;

    const amount = validateForm();
    if (amount === null) return;

    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>("/api/finance/logs", {
        method: "POST",
        orgId: activeOrgId,
        body: JSON.stringify({
          ...formData,
          amount,
        }),
      });

      mutate({ logs: [json.log, ...logs] }, { revalidate: false });
      
      setFormData({ type: "income", amount: "", category: "", description: "" });
      setIsDialogOpen(false);
      toast.success("تم تسجيل العملية بنجاح");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل تسجيل العملية";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog || !activeOrgId) return;

    const amount = validateForm();
    if (amount === null) return;

    setSubmitting(true);
    try {
      const json = await apiFetch<{ log: Log }>(`/api/finance/logs/${selectedLog.id}`, {
        method: "PATCH",
        orgId: activeOrgId,
        body: JSON.stringify({
          ...formData,
          amount,
        }),
      });

      mutate({ logs: logs.map(l => l.id === selectedLog.id ? json.log : l) }, { revalidate: false });
      setIsEditDialogOpen(false);
      toast.success("تم تحديث السجل بنجاح");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل تحديث السجل";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedLog || !activeOrgId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/finance/logs/${selectedLog.id}`, {
        method: "DELETE",
        orgId: activeOrgId,
      });
      mutate({ logs: logs.filter(l => l.id !== selectedLog.id) }, { revalidate: false });
      setIsDeleteDialogOpen(false);
      toast.success("تم حذف السجل بنجاح");
    } catch {
      toast.error("فشل حذف السجل");
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-teal-600 rounded-full hidden md:block" />
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 pr-0 md:pr-1">سجل المعاملات المالية</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-100/80 rounded-2xl p-1 shadow-inner border border-slate-200 backdrop-blur-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 sm:flex-none px-4 md:px-5 py-2 text-sm font-black rounded-xl transition-all duration-300 ${
                filter === "all" ? "bg-white text-slate-900 shadow-md scale-105" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`flex-1 sm:flex-none px-4 md:px-5 py-2 text-sm font-black rounded-xl transition-all duration-300 ${
                filter === "income" ? "bg-white text-emerald-600 shadow-md scale-105" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              الإيرادات
            </button>
            <button
              onClick={() => setFilter("expense")}
              className={`flex-1 sm:flex-none px-4 md:px-5 py-2 text-sm font-black rounded-xl transition-all duration-300 ${
                filter === "expense" ? "bg-white text-red-600 shadow-md scale-105" : "text-slate-500 hover:text-red-700"
              }`}
            >
              المصروفات
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
                <Button 
                    onClick={() => setFormData({ type: "income", amount: "", category: "", description: "" })}
                    className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200/50 rounded-2xl px-6 h-11 font-black transition-all hover:-translate-y-0.5 shrink-0" 
                />
            }>
                <Plus className="w-5 h-5 ml-2 -mr-1" />
                إضافة سجل
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 font-[--font-cairo] overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">تسجيل حركة مالية</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
                <div className="space-y-3">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">نوع المعاملة</Label>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                      <input
                        type="radio"
                        value="income"
                        className="sr-only"
                        checked={formData.type === "income"}
                        onChange={() => setFormData({ ...formData, type: "income" })}
                      />
                      <span className="text-xs md:text-sm font-black">إيراد جديد</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                      <input
                        type="radio"
                        value="expense"
                        className="sr-only"
                        checked={formData.type === "expense"}
                        onChange={() => setFormData({ ...formData, type: "expense" })}
                      />
                      <span className="text-xs md:text-sm font-black">مصروف هالك</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">الفئة أو التصنيف</Label>
                  <Input
                    id="category"
                    required
                    className="rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 focus-visible:ring-teal-500 font-bold text-sm"
                    placeholder="تبرع عام، أدوات مكتبية..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">المبلغ (بالجنيه المصري)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 focus-visible:ring-teal-500 text-lg md:text-xl font-black"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">ملاحظات إضافية</Label>
                  <Input
                    id="description"
                    className="rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 focus-visible:ring-teal-500 font-bold text-sm"
                    placeholder="اكتب أي تفاصيل أخرى هنا..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-2 md:pt-4">
                  <Button type="submit" disabled={submitting} className="w-full h-12 md:h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-xl md:rounded-2xl shadow-xl shadow-teal-100 text-base md:text-lg font-black transition-all active:scale-95">
                    {submitting ? "جاري الحفظ..." : "حفظ السجل الآن"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-slate-100">
           <div className="h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-500 font-black">جاري تحميل السجلات المالية...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-[2.5rem] border border-slate-100">
          <p className="text-slate-400 font-black text-lg">لا توجد معاملات مسجلة في هذه الفئة.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
                    <TableHead className="font-black text-slate-500 h-14 uppercase text-[10px] tracking-widest text-right pr-8">النوع</TableHead>
                    <TableHead className="font-black text-slate-500 h-14 uppercase text-[10px] tracking-widest text-right">التصنيف</TableHead>
                    <TableHead className="font-black text-slate-500 h-14 uppercase text-[10px] tracking-widest text-right">التفاصيل</TableHead>
                    <TableHead className="font-black text-slate-500 h-14 uppercase text-[10px] tracking-widest text-right">التاريخ</TableHead>
                    <TableHead className="font-black text-slate-500 h-14 uppercase text-[10px] tracking-widest text-left pl-8">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="transition-all hover:bg-slate-50/50 border-b border-slate-50 last:border-0 group">
                      <TableCell className="py-5 pr-8">
                        <Badge
                          variant="outline"
                          className={
                            log.type === "income"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full px-4 py-1 text-xs font-black shadow-sm whitespace-nowrap"
                              : "bg-red-50 text-red-600 border-red-100 rounded-full px-4 py-1 text-xs font-black shadow-sm whitespace-nowrap"
                          }
                        >
                          {log.type === "income" ? "إيراد" : "مصروف"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 font-black text-slate-800">{log.category}</TableCell>
                      <TableCell className="py-5 text-slate-400 font-bold max-w-xs truncate group-hover:text-slate-600 transition-colors px-2">
                        {log.description || <span className="italic text-slate-200">لا يوجد وصف</span>}
                      </TableCell>
                      <TableCell className="py-5 text-slate-400 font-bold text-sm whitespace-nowrap">
                        {new Intl.DateTimeFormat('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(log.createdAt))}
                      </TableCell>
                      <TableCell className={`py-5 text-left pl-8 text-lg font-black tracking-tighter ${log.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex items-center whitespace-nowrap">
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative group active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <Badge
                    variant="outline"
                    className={
                      log.type === "income"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 rounded-full px-3 py-1 text-[10px] font-black"
                        : "bg-red-50 text-red-600 border-red-100 rounded-full px-3 py-1 text-[10px] font-black"
                    }
                  >
                    {log.type === "income" ? "إيراد" : "مصروف"}
                  </Badge>
                  
                  <div className="text-slate-400 text-[10px] font-bold">
                    {new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(log.createdAt))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-black text-slate-800 text-base mb-1">{log.category}</h3>
                  <p className="text-slate-400 font-bold text-xs line-clamp-2">
                    {log.description || "بدون وصف إضافي"}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-[2rem] border-t border-slate-50">
                  <div className={`text-lg font-black tracking-tighter ${log.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                    {log.type === "income" ? "+" : "-"}{log.amount.toLocaleString()} <span className="text-[10px] mr-1 opacity-60">ج.م</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(log)}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-600 shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openDeleteDialog(log)}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-red-500 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 font-[--font-cairo] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">تعديل حركة مالية</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRecord} className="space-y-4 md:space-y-6 mt-4 md:mt-6 border-t border-slate-100 pt-4 md:pt-6">
            <div className="space-y-3">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">نوع المعاملة</Label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                  <input
                    type="radio"
                    value="income"
                    className="sr-only"
                    checked={formData.type === "income"}
                    onChange={() => setFormData({ ...formData, type: "income" })}
                  />
                  <span className="text-xs md:text-sm font-black">إيراد</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-500'}`}>
                  <input
                    type="radio"
                    value="expense"
                    className="sr-only"
                    checked={formData.type === "expense"}
                    onChange={() => setFormData({ ...formData, type: "expense" })}
                  />
                  <span className="text-xs md:text-sm font-black">مصروف</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">الفئة أو التصنيف</Label>
              <Input
                id="edit-category"
                required
                className="rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 focus-visible:ring-teal-500 font-bold text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">المبلغ (بالجنيه المصري)</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                required
                className="rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 focus-visible:ring-teal-500 text-lg md:text-xl font-black"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-slate-400 font-black text-[10px] uppercase tracking-widest block text-right">ملاحظات إضافية</Label>
              <Input
                id="edit-description"
                className="rounded-xl md:rounded-2xl border-slate-200 bg-white h-11 md:h-12 focus-visible:ring-teal-500 font-bold text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-2 md:pt-4">
              <Button type="submit" disabled={submitting} className="w-full h-12 md:h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-xl md:rounded-2xl shadow-xl shadow-teal-100 text-base md:text-lg font-black transition-all">
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 font-[--font-cairo]">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 text-right">حذف السجل</DialogTitle>
          </DialogHeader>
          <div className="mt-2 md:mt-4 text-right">
            <p className="text-slate-600 font-bold text-base md:text-lg">هل أنت متأكد من رغبتك في حذف هذا السجل؟</p>
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">تفاصيل السجل</p>
               <p className="text-slate-900 font-black mt-1 text-sm md:text-base">{selectedLog?.category}</p>
               <p className={`font-black mt-1 text-base md:text-lg ${selectedLog?.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                 {selectedLog?.type === 'income' ? '+' : '-'}{selectedLog?.amount.toLocaleString()} ج.م
               </p>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm mt-4 font-medium italic">هذا الإجراء لا يمكن التراجع عنه.</p>
          </div>
          <DialogFooter className="mt-6 md:mt-8 flex flex-row gap-3 sm:justify-start">
            <Button
              variant="ghost"
              className="flex-1 h-11 md:h-12 rounded-xl md:rounded-2xl font-black hover:bg-slate-100 text-sm md:text-base"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              className="flex-1 h-11 md:h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl md:rounded-2xl font-black shadow-lg shadow-red-200/50 text-sm md:text-base"
              onClick={handleDeleteRecord}
              disabled={submitting}
            >
              {submitting ? "جاري الحذف..." : "نعم، حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
