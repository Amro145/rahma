"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, UserCog, GraduationCap } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Role = "admin" | "management" | "student";

type DBUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
};

type MeResponse = {
  user: {
    role: Role;
  };
};

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "مشرف", color: "text-purple-600" },
  management: { label: "إدارة", color: "text-blue-600" },
  student: { label: "طالب", color: "text-teal-600" },
};

export default function UsersPage() {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: meData } = useSWR<MeResponse>("/api/me", () => apiFetch<MeResponse>("/api/me"));

  const { data, isLoading, mutate } = useSWR<{ users: DBUser[] }>(
    "/api/users",
    () => apiFetch<{ users: DBUser[] }>("/api/users")
  );

  const isAdmin = meData?.user?.role === "admin";
  const isManagement = meData?.user?.role === "management" || isAdmin;

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await apiFetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      mutate();
      toast.success("تم تغيير الدور بنجاح");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل تغيير الدور";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isManagement) {
    return (
      <div className="min-h-screen bg-slate-50 font-[--font-cairo] p-8" dir="rtl">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-red-500 font-bold">غير مصرح لك الدخول لهذه الصفحة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-[--font-cairo] p-4 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">إدارة المستخدمين</h1>
          <p className="text-sm font-bold text-slate-400">قم بتعديل أدوار المستخدمين</p>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-right font-black text-slate-500">الاسم</TableHead>
              <TableHead className="text-right font-black text-slate-500">البريد</TableHead>
              <TableHead className="text-right font-black text-slate-500">الدور</TableHead>
              <TableHead className="text-right font-black text-slate-500">تاريخ التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : data?.users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                  لا توجد مستخدمين
                </TableCell>
              </TableRow>
            ) : (
              data?.users?.map((user) => {
                const roleInfo = roleLabels[user.role] || roleLabels.student;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold text-slate-700">{user.name}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: string) => handleRoleChange(user.id, value)}
                        disabled={updatingId === user.id}
                      >
                        <SelectTrigger className={`w-32 ${roleInfo.color} border-0 bg-slate-50 font-bold`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {isAdmin && (
                            <SelectItem value="admin" className="font-bold">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-600" />
                                <span>مشرف</span>
                              </div>
                            </SelectItem>
                          )}
                          <SelectItem value="management" className="font-bold">
                            <div className="flex items-center gap-2">
                              <UserCog className="w-4 h-4 text-blue-600" />
                              <span>إدارة</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="student" className="font-bold">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-teal-600" />
                              <span>طالب</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}