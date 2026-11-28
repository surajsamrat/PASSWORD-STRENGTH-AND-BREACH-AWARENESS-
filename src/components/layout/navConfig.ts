import {
  Award,
  Bot,
  FileBarChart2,
  FishOff,
  KeyRound,
  LayoutDashboard,
  Radar,
  Settings,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { TranslationSchema } from "@/i18n/en";

export interface NavItemConfig {
  id: string;
  path: string;
  labelKey: keyof TranslationSchema["nav"];
  group: "overview" | "tools" | "learning" | "system";
  icon: LucideIcon;
  accentColor: string;
  descEn: string;
  descHi: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    labelKey: "dashboard",
    group: "overview",
    icon: LayoutDashboard,
    accentColor: "text-sky-400",
    descEn: "Posture telemetry, quick actions & recent activity",
    descHi: "सुरक्षा स्थिति, त्वरित क्रियाएं और हालिया गतिविधि",
  },
  {
    id: "analyzer",
    path: "/analyzer",
    labelKey: "analyzer",
    group: "tools",
    icon: ShieldAlert,
    accentColor: "text-sky-400",
    descEn: "Real-time entropy, crack times & NIST checks",
    descHi: "रियल-टाइम एंट्रॉपी, क्रैक समय और NIST जांच",
  },
  {
    id: "generator",
    path: "/generator",
    labelKey: "generator",
    group: "tools",
    icon: KeyRound,
    accentColor: "text-emerald-400",
    descEn: "CSPRNG passwords & diceware passphrases",
    descHi: "क्रिप्टोग्राफ़िक पासवर्ड और पासफ़्रेज़ निर्माण",
  },
  {
    id: "breach",
    path: "/breach-checker",
    labelKey: "breach",
    group: "tools",
    icon: Radar,
    accentColor: "text-cyan-400",
    descEn: "Zero-knowledge k-Anonymity & demo breach lookup",
    descHi: "k-Anonymity पासवर्ड जांच और डेमो ब्रीच विश्लेषण",
  },
  {
    id: "phishing",
    path: "/phishing-detector",
    labelKey: "phishing",
    group: "tools",
    icon: FishOff,
    accentColor: "text-amber-400",
    descEn: "Inspect suspicious URLs, domains & scam texts",
    descHi: "संदिग्ध URL, डोमेन और धोखाधड़ी संदेश जांचें",
  },
  {
    id: "assistant",
    path: "/assistant",
    labelKey: "assistant",
    group: "tools",
    icon: Bot,
    accentColor: "text-sky-400",
    descEn: "Local rule-based security playbook advisor",
    descHi: "स्थानीय नियम-आधारित साइबर सुरक्षा सलाहकार",
  },
  {
    id: "report",
    path: "/security-report",
    labelKey: "report",
    group: "tools",
    icon: FileBarChart2,
    accentColor: "text-emerald-400",
    descEn: "Hygiene checklist, telemetry & printable report",
    descHi: "स्वच्छता सूची, टेलीमेट्री और प्रिंटेबल रिपोर्ट",
  },
  {
    id: "achievements",
    path: "/achievements",
    labelKey: "achievements",
    group: "learning",
    icon: Award,
    accentColor: "text-emerald-400",
    descEn: "Unlock badges through real security actions",
    descHi: "सुरक्षा गतिविधियों से उपलब्धियां और बैज अनलॉक करें",
  },
  {
    id: "settings",
    path: "/settings",
    labelKey: "settings",
    group: "system",
    icon: Settings,
    accentColor: "text-slate-400",
    descEn: "Theme, EN/HI language, profile & data controls",
    descHi: "थीम, अंग्रेज़ी/हिन्दी भाषा, प्रोफ़ाइल और डेटा नियंत्रण",
  },
];
