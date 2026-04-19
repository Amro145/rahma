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

export function OrganizationSwitcher() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user's organizations
    const fetchOrgs = async () => {
      try {
        const result = await organization.list();
        if (result && result.data) {
          setOrgs(result.data);
        } else if (result && Array.isArray(result)) {
           // Fallback array structure based on plugin version
           setOrgs(result);
        }
      } catch (err) {
        console.error("Failed to fetch orgs:", err);
      }
    };
    fetchOrgs();
  }, []);

  if (!orgs || orgs.length === 0) return null;

  const activeOrgId = session?.session?.activeOrganizationId;
  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  const handleOrgConfig = async (id: string) => {
    try {
      await organization.setActive({ organizationId: id });
      // Update data and context context by reloading
      window.location.reload();
    } catch (error) {
      console.error("Failed to set active organization:", error);
    }
  };

  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-10 border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate text-slate-700 font-bold">
              <Building2 className="h-4 w-4 text-teal-600" />
              <span className="truncate">{activeOrg?.name || "اختر مؤسسة"}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 font-[--font-cairo]" align="center">
          {orgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleOrgConfig(org.id)}
              className={`flex items-center justify-between cursor-pointer py-2.5 rounded-lg mb-1 ${
                org.id === activeOrgId ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className={`h-4 w-4 ${org.id === activeOrgId ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="font-bold">{org.name}</span>
              </div>
              {org.id === activeOrgId && (
                <Check className="h-4 w-4 text-teal-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
