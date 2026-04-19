"use client";

import { useEffect, useState } from "react";
import { organization, useSession } from "@/lib/auth.client";
import { Building2, Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function OrganizationSwitcher() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orgs, setOrgs] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchOrgs = async () => {
    try {
      const result = await organization.list();
      if (result && result.data) {
        setOrgs(result.data);
      } else if (result && Array.isArray(result)) {
         setOrgs(result);
      }
    } catch (err) {
      console.error("Failed to fetch orgs:", err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const activeOrgId = session?.session?.activeOrganizationId;
  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  const handleOrgConfig = async (id: string) => {
    try {
      await organization.setActive({ organizationId: id });
      window.location.reload();
    } catch (error) {
      console.error("Failed to set active organization:", error);
      toast.error("فشل في تبديل المؤسسة");
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await organization.create({
        name: newOrgName,
        slug: newOrgName.toLowerCase().replace(/\s+/g, '-'),
      });

      if (error) throw error;
      
      toast.success("تم إنشاء المؤسسة بنجاح");
      setIsCreateOpen(false);
      setNewOrgName("");
      
      // Select the new org immediately
      if (data?.id) {
        await organization.setActive({ organizationId: data.id });
        window.location.reload();
      } else {
        fetchOrgs();
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إنشاء المؤسسة");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-10 border-slate-200 bg-white hover:bg-slate-50 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-2 truncate text-slate-700 font-bold">
              <Building2 className="h-4 w-4 text-teal-600" />
              <span className="truncate">{activeOrg?.name || (orgs.length > 0 ? "اختر مؤسسة" : "لا توجد مؤسسة")}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 font-[--font-cairo] p-2" align="center">
          {orgs.length > 0 ? (
            orgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleOrgConfig(org.id)}
                className={`flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-lg mb-1 transition-colors ${
                  org.id === activeOrgId ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={`h-4 w-4 ${org.id === activeOrgId ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">{org.name}</span>
                </div>
                {org.id === activeOrgId && (
                  <Check className="h-4 w-4 text-teal-600" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
             <div className="px-2 py-4 text-center text-xs text-slate-400 font-bold">
                لم تقم بإنشاء أي مؤسسة بعد
             </div>
          )}
          
          <DropdownMenuSeparator className="my-2" />
          
          <DropdownMenuItem 
            onSelect={(e) => {
              e.preventDefault();
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer py-2.5 px-3 rounded-lg text-teal-600 hover:bg-teal-50 font-black text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مؤسسة جديدة</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 font-[--font-cairo]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 text-right">مؤسسة جديدة</DialogTitle>
            <DialogDescription className="text-right font-bold text-slate-500 mt-2">
              ابدأ بتنظيم أعمالك الخيرية من خلال إنشاء مؤسسة مخصصة.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-6 mt-6 border-t border-slate-100 pt-6">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-slate-400 font-black text-xs uppercase tracking-widest block text-right">اسم المؤسسة</Label>
              <Input
                id="org-name"
                required
                className="rounded-2xl border-slate-200 bg-white h-12 focus-visible:ring-teal-500 font-bold"
                placeholder="مثال: جمعية رحمة بالخرطوم"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
            
            <Button 
                type="submit" 
                disabled={creating} 
                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-100 text-lg font-black transition-all"
            >
              {creating ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : "إنشاء المؤسسة الآن"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

