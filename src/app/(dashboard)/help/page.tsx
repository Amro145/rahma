"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  CreditCard,
  ShieldCheck,
  Bell,
  ArrowLeft,
  CheckCircle,
  BookOpen,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

type Section = {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
    warning?: string;
  }[];
};

const sections: Section[] = [
  {
    id: "getting-started",
    icon: Building2,
    title: "البداية — إعداد المؤسسة",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    steps: [
      {
        title: "تسجيل الدخول",
        description:
          "قم بزيارة الموقع وتسجيل الدخول باستخدام حساب Google الخاص بك. يتم توثيق هويتك بشكل آمن تلقائياً.",
      },
      {
        title: "اختيار المؤسسة النشطة",
        description:
          "من القائمة المنسدلة في أعلى الشريط الجانبي، اختر المؤسسة التي تريد الإدارة منها. ستُعرض جميع البيانات مرتبطة بالمؤسسة المختارة فقط.",
        warning:
          "تأكد دائماً من اختيار المؤسسة الصحيحة قبل إضافة أي بيانات لضمان عزل البيانات بين المؤسسات.",
      },
    ],
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "لوحة التحكم — نظرة عامة",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    steps: [
      {
        title: "الإحصائيات الفورية",
        description:
          "تعرض لوحة التحكم إجمالي الإيرادات، المصروفات، وصافي الرصيد المتاح بشكل فوري ومحدّث دائماً.",
      },
      {
        title: "إضافة طالب جديد بسرعة",
        description:
          'من بطاقة "إضافة طالب جديد" في لوحة التحكم، يمكنك إدخال بيانات الطالب (الاسم، رقم الواتساب، المبلغ المطلوب) دون الحاجة للانتقال لصفحة الطلاب.',
      },
      {
        title: "تسجيل حركة مالية سريعة",
        description:
          'من بطاقة "تسجيل حركة مالية"، يمكنك تسجيل إيراد أو مصروف مباشرةً مع تحديد التصنيف والمبلغ والوصف.',
        tip: "استخدم لوحة التحكم للمهام السريعة، والصفحات المتخصصة للإدارة التفصيلية.",
      },
    ],
  },
  {
    id: "students",
    icon: Users,
    title: "إدارة الطلاب",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    steps: [
      {
        title: "إضافة طالب",
        description:
          'اضغط على زر "إضافة طالب" في الأعلى. أدخل الاسم الرباعي، رقم الواتساب الدولي (مثال: 201234567890)، والمبلغ الشهري المطلوب من الطالب.',
        tip: 'رقم الواتساب يُستخدم لإنشاء رابط مباشر. اضغط على رقم الطالب في الجدول للتواصل معه عبر WhatsApp مباشرةً.',
      },
      {
        title: "تأكيد السداد السريع",
        description:
          'لكل طالب في حالة "قيد الانتظار"، يظهر زر "تأكيد السداد". بالضغط عليه يتم تسجيل دفعة الشهر الحالي تلقائياً في السجلات المالية.',
      },
      {
        title: "تعديل أو حذف طالب",
        description:
          'من القائمة المنسدلة (⋮) بجانب كل طالب، يمكنك تعديل بياناته أو حذفه. الحذف نهائي ويشمل كل سجلات دفعاته.',
        warning:
          "لا يمكن التراجع عن حذف الطالب. تأكد من أنك تريد حذفه بشكل نهائي.",
      },
      {
        title: "البحث والتصفية",
        description:
          "استخدم حقل البحث في أعلى الصفحة للبحث بالاسم. يمكنك الوصول لأي طالب بسرعة حتى لو كانت قائمة الطلاب كبيرة.",
      },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "سجل مدفوعات الطالب",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    steps: [
      {
        title: "الوصول لسجل الدفع",
        description:
          'من قائمة الطلاب، اضغط على القائمة المنسدلة (⋮) ثم "سجل المدفوعات"، أو اضغط مباشرةً على اسم الطالب.',
      },
      {
        title: "تقويم الدفع الشهري",
        description:
          "يعرض سجل الطالب تقويماً لـ 12 شهراً في السنة الحالية. كل شهر له حالة: مدفوع (أخضر)، غير مدفوع (أحمر)، أو قادم (رمادي).",
      },
      {
        title: "تسجيل دفعة شهر معين",
        description:
          'لكل شهر غير مدفوع، يظهر زر "دفع الآن". بالضغط عليه يتم تسجيل الدفعة وتحديث حالة الشهر فوراً.',
        tip: "يتم تسجيل الدفعة تلقائياً في السجلات المالية كإيراد من نوع (رسوم دراسية).",
      },
      {
        title: "إجمالي المستحق",
        description:
          "تظهر بطاقة جانبية تحسب إجمالي الرسوم المتراكمة غير المدفوعة للشهور المنقضية.",
      },
    ],
  },
  {
    id: "finance",
    icon: FileText,
    title: "السجلات المالية",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    steps: [
      {
        title: "عرض وتصفية السجلات",
        description:
          "تعرض الصفحة جميع الحركات المالية. استخدم أزرار التصفية (الكل / الإيرادات / المصروفات) لعرض نوع محدد.",
      },
      {
        title: "تسجيل إيراد أو مصروف",
        description:
          'اضغط "إضافة سجل"، اختر النوع (إيراد/مصروف)، أدخل المبلغ والتصنيف (مثال: تبرع، إيجار، رواتب...)، ثم أضف وصفاً اختيارياً.',
        tip: 'تصنيفات مقترحة للإيرادات: "تبرع عام"، "رسوم دراسية"، "منحة".\nتصنيفات مقترحة للمصروفات: "إيجار"، "رواتب"، "أدوات مكتبية"، "نفقات متنوعة".',
      },
      {
        title: "تعديل سجل موجود",
        description:
          'من القائمة المنسدلة (⋮) بجانب كل سجل، اضغط "تعديل" لتغيير بيانات الحركة المالية.',
      },
      {
        title: "حذف سجل",
        description:
          'اضغط "حذف" من القائمة المنسدلة. تتوفر إمكانية الحذف للمدير والمالك فقط، وليس للأعضاء العاديين.',
        warning: "حذف السجل المالي نهائي ولا يمكن التراجع عنه.",
      },
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "الأمان وإدارة الصلاحيات",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    steps: [
      {
        title: "الأدوار والصلاحيات",
        description:
          "يدعم النظام ثلاثة أدوار: المالك (owner) – له كل الصلاحيات. المدير (admin) – يمكنه الإضافة والتعديل والحذف. العضو (member) – يمكنه الإضافة والتعديل فقط.",
      },
      {
        title: "عزل البيانات",
        description:
          "كل مؤسسة تملك بياناتها المنفصلة تماماً. لا يمكن لأي مستخدم رؤية أو التعديل على بيانات مؤسسة أخرى إلا إذا كان عضواً فيها.",
      },
      {
        title: "دعوة أعضاء جدد",
        description:
          "يمكن للمالك والمدير دعوة أعضاء جدد عن طريق بريدهم الإلكتروني مع تحديد الدور المناسب لهم.",
        tip: "ستصلهم دعوة على بريدهم الإلكتروني لقبولها والانضمام للمؤسسة.",
      },
      {
        title: "تسجيل الخروج",
        description:
          'اضغط على زر "تسجيل الخروج" في أعلى يسار الشاشة لإنهاء جلستك بأمان.',
      },
    ],
  },
];

const faqs = [
  {
    q: "هل يمكنني إدارة أكثر من مؤسسة؟",
    a: "نعم، يمكنك إنشاء عدة مؤسسات وتبديل بينها بسهولة من القائمة المنسدلة في الشريط الجانبي.",
  },
  {
    q: "ماذا يحدث عند تأكيد سداد الطالب؟",
    a: 'يُسجَّل السداد في سجل مدفوعات الطالب للشهر الحالي، ويُنشأ تلقائياً إيراد في السجلات المالية بتصنيف "رسوم دراسية".',
  },
  {
    q: "هل بيانات المؤسسات مؤمّنة ومنفصلة؟",
    a: "نعم تماماً. كل مؤسسة لها قاعدة بيانات منعزلة بالكامل، ولا يمكن لأي مستخدم الوصول لبيانات مؤسسة لم يُدعَ إليها.",
  },
  {
    q: "هل يمكنني تعديل دفعة شهر تم تسجيلها؟",
    a: 'حالياً، يمكنك تعديل السجل المالي المرتبط بالدفعة من صفحة السجلات المالية. ميزة "تعديل الشهر" ستُضاف مستقبلاً.',
  },
  {
    q: "ماذا يحدث إذا سجلت دفعة شهر تم دفعه مسبقاً؟",
    a: "النظام يتعرف على المدفوعات المكررة ويحدّث السجل الموجود بدلاً من إنشاء سجل جديد.",
  },
  {
    q: "هل تعمل المنصة على الموبايل؟",
    a: "نعم. المنصة مصممة بالكامل لتعمل على جميع الأجهزة: كمبيوتر، تابلت، وموبايل.",
  },
];

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string | null>("getting-started");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[--font-cairo]"
      dir="rtl"
    >
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 rounded-[2rem] p-8 md:p-12 overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full -ml-16 -mb-16 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black mb-2">
              دليل استخدام منصة رحمة
            </h1>
            <p className="text-teal-100 font-bold text-sm md:text-base leading-relaxed max-w-2xl">
              كل ما تحتاج معرفته لإدارة طلابك وسجلاتك المالية بكفاءة واحترافية.
              اتبع الخطوات التالية للبدء.
            </p>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "إدارة الطلاب", icon: Users },
            { label: "تتبع المدفوعات", icon: CreditCard },
            { label: "السجلات المالية", icon: FileText },
            { label: "حماية كاملة", icon: ShieldCheck },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 border border-white/10"
            >
              <Icon className="w-4 h-4 text-teal-200 shrink-0" />
              <span className="text-xs md:text-sm font-black text-white/90">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setOpenSection(s.id);
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
              openSection === s.id
                ? `${s.bgColor} ${s.borderColor} shadow-md`
                : "bg-white border-slate-100 hover:border-slate-200"
            }`}
          >
            <s.icon className={`w-6 h-6 ${openSection === s.id ? s.color : "text-slate-400"}`} />
            <span className={`text-[11px] font-black text-center leading-tight ${openSection === s.id ? s.color : "text-slate-500"}`}>
              {s.title.split("—")[0].trim()}
            </span>
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              id={section.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                isOpen ? section.borderColor : "border-slate-100"
              } bg-white shadow-sm`}
            >
              <button
                className="w-full flex items-center justify-between p-5 md:p-6 text-right"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${section.bgColor} flex items-center justify-center shrink-0`}>
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <h2 className={`text-base md:text-lg font-black ${isOpen ? section.color : "text-slate-800"}`}>
                    {section.title}
                  </h2>
                </div>
                {isOpen ? (
                  <ChevronUp className={`w-5 h-5 ${section.color} shrink-0`} />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                  {section.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-8 h-8 rounded-full ${section.bgColor} border-2 ${section.borderColor} flex items-center justify-center`}>
                          <span className={`text-xs font-black ${section.color}`}>{idx + 1}</span>
                        </div>
                        {idx < section.steps.length - 1 && (
                          <div className="w-px flex-1 bg-slate-100 min-h-[20px]" />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <h3 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                          {step.description}
                        </p>
                        {step.tip && (
                          <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-amber-800 text-xs font-bold leading-relaxed whitespace-pre-line">
                              {step.tip}
                            </p>
                          </div>
                        )}
                        {step.warning && (
                          <div className="mt-3 flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-red-800 text-xs font-bold leading-relaxed">
                              {step.warning}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-slate-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900">الأسئلة الشائعة</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx}>
                <button
                  className="w-full text-right flex items-center justify-between p-5 hover:bg-slate-50 transition-colors gap-4"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <span className="font-black text-slate-800 text-sm flex-1 text-right">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 flex gap-3">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-slate-600 font-medium text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">هل تحتاج مساعدة إضافية؟</h3>
            <p className="text-slate-400 font-medium text-sm mt-1">
              المنصة في تطور مستمر. إذا واجهتك أي مشكلة، راجع هذا الدليل أو تواصل مع المطوّر.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-teal-600/20 px-4 py-2.5 rounded-xl border border-teal-700/30 shrink-0">
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span className="text-teal-300 font-black text-sm">amroaltayeb14@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
