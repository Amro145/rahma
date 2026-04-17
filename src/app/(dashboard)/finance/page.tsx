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
import { Plus, Filter } from "lucide-react";

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
      // Add standard instantly
      setLogs((prev) => [json.log, ...prev]);
      
      // Reset form and close
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Logs</h1>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("income")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "income" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilter("expense")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === "expense" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Expense
            </button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Financial Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="income"
                        checked={formData.type === "income"}
                        onChange={(e) => setFormData({ ...formData, type: "income" })}
                      />
                      <span className="text-sm">Income</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="expense"
                        checked={formData.type === "expense"}
                        onChange={(e) => setFormData({ ...formData, type: "expense" })}
                      />
                      <span className="text-sm">Expense</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    required
                    placeholder="e.g. Tuition, Utility Bill..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Additional details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Loading financial records...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="transition-colors hover:bg-muted/30">
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.type === "income"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {log.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.category}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {log.description || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${log.type === "income" ? "text-green-600" : "text-red-600"}`}>
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
