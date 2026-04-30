import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100),
  name: z.string().min(2, "اسم المستخدم يجب أن يكون حرفين على الأقل").max(100),
  whatsapp: z.string().regex(/^\+?\d+$/, "رقم الهاتف غير صالح").min(8).max(25).optional(),
  requiredAmount: z.number().positive("المبلغ المطلوب يجب أن يكون أكبر من 0").max(10000000),
  faculty: z.enum(['medicine', 'dentistry', 'engineering', 'other']),
  semester: z.enum(['1', '2', '3', '4', '5', '6']),
});

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const studentSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  whatsapp: z.string().regex(/^\+?\d+$/, "رقم الهاتف غير صالح").min(8).max(25).optional(),
  requiredAmount: z.number().positive("المبلغ المطلوب يجب أن يكون أكبر من 0").max(10000000),
  faculty: z.enum(['medicine', 'dentistry', 'engineering', 'other'] as const),
  semester: z.enum(['1', '2', '3', '4', '5', '6'] as const),
});

export const paymentSchema = z.object({
  monthIndex: z.number().min(1, "الشهر يجب أن يكون بين 1 و 12").max(12),
  academicYear: z.number().min(2024, "السنة الأكاديمية غير صالحة").max(2100),
  amount: z.number().nonnegative("المبلغ يجب أن يكون صفر أو أكبر"),
});

export const donationSchema = z.object({
  donorName: z.string().min(1, "اسم المتبرع مطلوب").max(100),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من 0"),
});

export const financeLogSchema = z.object({
  type: z.enum(['income', 'expense'] as const),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من 0"),
  category: z.string().min(1, "التصنيف مطلوب"),
  description: z.string().optional(),
});

export const updateRoleSchema = z.object({
  userId: z.string().uuid("معرف المستخدم غير صالح"),
  role: z.enum(['admin', 'management', 'student'] as const),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
export type FinanceLogInput = z.infer<typeof financeLogSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
