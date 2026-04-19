"use client";

import { useEffect, useState } from "react";
import { organization, useSession } from "@/lib/auth.client";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function OrganizationSwitcher() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orgs, setOrgs] = useState<any[]>([]);

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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}





