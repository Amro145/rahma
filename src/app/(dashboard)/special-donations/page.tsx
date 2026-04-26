"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Donation = {
  id: number;
  donorName: string;
  amount: number;
  createdAt: string;
};

export default function SpecialDonationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ donorName: "", amount: "" });

  const { data, isLoading, mutate } = useSWR<{ donations: Donation[] }>(
    "/api/special-donations",
    () => apiFetch<{ donations: Donation[] }>("/api/special-donations")
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/api/special-donations", {
        method: "POST",
        body: JSON.stringify({
          donorName: form.donorName,
          amount: Number(form.amount),
        }),
      });
      setIsDialogOpen(false);
      setForm({ donorName: "", amount: "" });
      toast.success("تمت إضافة التبرع بنجاح");
      mutate();
    } catch {
      toast.error("فشل إضافة التبرع");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/special-donations/${id}`, { method: "DELETE" });
      toast.success("تم حذف التبرع");
      mutate();
    } catch {
      toast.error("فشل حذف التبرع");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalAmount = data?.donations?.reduce((sum, d) => sum + d.amount, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">التبرعات الخاصة</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black gap-2">
              <Plus className="w-4 h-4" />
              <span>إضافة متبرع خاص</span>
            </Button>
          } />
          <DialogContent className="sm:max-w-md rounded-2xl p-6 font-[--font-cairo]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 text-right">إضافة متبرع خاص</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-xs uppercase text-right block">اسم المتبرع</Label>
                <Input required className="rounded-xl h-12 border-slate-200" placeholder="الاسم الكامل..." value={form.donorName} onChange={e => setForm({...form, donorName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-xs uppercase text-right block">المبلغ</Label>
                <Input required type="number" className="rounded-xl h-12 border-slate-200" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-12 bg-teal-600 rounded-xl font-black text-white">
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black text-slate-400 uppercase">إجمالي التبرعات الخاصة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-teal-600 flex items-center gap-2">
            <Heart className="w-6 h-6" />
            <span>{totalAmount.toLocaleString()}</span>
            <span className="text-sm font-bold text-slate-300">ج.م</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-right font-black text-slate-500">اسم المتبرع</TableHead>
              <TableHead className="text-right font-black text-slate-500">المبلغ</TableHead>
              <TableHead className="text-right font-black text-slate-500">التاريخ</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.donations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                  لا توجد تبرعات خاصة حتى الآن
                </TableCell>
              </TableRow>
            ) : (
              data?.donations?.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-bold text-slate-700">{donation.donorName}</TableCell>
                  <TableCell className="font-bold text-teal-600">{donation.amount.toLocaleString()} ج.م</TableCell>
                  <TableCell className="text-slate-400">{formatDate(donation.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDelete(donation.id)} className="text-red-600 gap-2">
                          <Trash2 className="w-4 h-4" />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
