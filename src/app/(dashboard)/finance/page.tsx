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
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

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
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev";
      const res = await fetch(`${backendUrl}/api/finance/logs`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const json = (await res.json()) as any;
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
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev";
      const res = await fetch(`${backendUrl}/api/finance/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (!res.ok) throw new Error("Failed to create log");

      const json = (await res.json()) as any;
      setLogs((prev) => [json.log, ...prev]);
      
      setFormData({ type: "income", amount: "", category: "", description: "" });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error creating record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Financial Ledger</h2>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner border border-slate-200">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                filter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All Data
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                filter === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilter("expense")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                filter === "expense" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Expense
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-teal-600 text-white hover:bg-teal-700 shadow-sm rounded-xl px-4" />}>
                <Plus className="w-4 h-4 mr-2 -ml-1" />
                Add Record
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800">Add New Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-5 mt-4">
                <div className="space-y-3">
                  <Label className="text-slate-600 font-semibold text-xs uppercase tracking-wider">Transaction Type</Label>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition-all ${formData.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}>
                      <input
                        type="radio"
                        value="income"
                        className="sr-only"
                        checked={formData.type === "income"}
                        onChange={(e) => setFormData({ ...formData, type: "income" })}
                      />
                      <span className="text-sm font-semibold">Income</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}>
                      <input
                        type="radio"
                        value="expense"
                        className="sr-only"
                        checked={formData.type === "expense"}
                        onChange={(e) => setFormData({ ...formData, type: "expense" })}
                      />
                      <span className="text-sm font-semibold">Expense</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-600 font-semibold text-xs uppercase tracking-wider">Category</Label>
                  <Input
                    id="category"
                    required
                    className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-teal-500"
                    placeholder="e.g. Donation, Utility Bill..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-600 font-semibold text-xs uppercase tracking-wider">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-teal-500 text-lg font-medium"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-600 font-semibold text-xs uppercase tracking-wider">Description (Optional)</Label>
                  <Input
                    id="description"
                    className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-teal-500"
                    placeholder="Additional context about this transaction..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-5 flex justify-end">
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm px-6">
                    {submitting ? "Processing..." : "Save Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-50/80">
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Classification</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Transaction Context</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Details</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider">Logged Date</TableHead>
              <TableHead className="font-semibold text-slate-600 h-12 uppercase text-xs tracking-wider text-right pr-6">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    Retrieving ledger...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No transaction records matched your filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="transition-colors hover:bg-slate-50/50 border-b border-slate-100 last:border-0 group">
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={
                        log.type === "income"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm"
                          : "bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm"
                      }
                    >
                      {log.type === "income" ? "INCOME" : "EXPENSE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 font-semibold text-slate-900">{log.category}</TableCell>
                  <TableCell className="py-4 text-slate-500 max-w-[200px] truncate group-hover:text-slate-700 transition-colors">
                    {log.description || <span className="italic text-slate-300">Unspecified</span>}
                  </TableCell>
                  <TableCell className="py-4 text-slate-400 font-medium text-sm whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(log.createdAt))}
                  </TableCell>
                  <TableCell className={`py-4 text-right pr-6 text-base font-black tracking-tight ${log.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                    {log.type === "income" ? "+" : "-"}${log.amount.toLocaleString()}
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
