import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "@/i18n";
import type { TranslationSchema } from "@/i18n/en";
import {
  DEMO_SAMPLE_ACTIVITIES,
  INITIAL_HYGIENE_CHECKLIST,
} from "@/data/demoData";
import type {
  ActivityItem,
  HygieneChecklistItem,
  Language,
  SanitizedCredentialSnapshot,
  ThemeMode,
  UserMetrics,
  UserSettings,
} from "@/types/security";

const STORAGE_KEY = "securecheck_state_v1";

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "Security Operator",
  roleTitle: "Cybersecurity Learner",
  persistActivity: true,
  clipboardAutoClearSeconds: 30,
  strictAnalyzerMode: false,
};

const DEFAULT_METRICS: UserMetrics = {
  passwordsAudited: 0,
  bestEntropySeen: 0,
  passwordsGenerated: 0,
  breachChecksRun: 0,
  phishingScansRun: 0,
  threatsFlagged: 0,
  quizzesCompleted: 0,
  quizCorrectAnswers: 0,
  quizTotalAnswered: 0,
  bestQuizStreak: 0,
  xp: 0,
  usedHindiOrSwitchedLang: false,
};

interface PersistedState {
  theme: ThemeMode;
  language: Language;
  settings: UserSettings;
  metrics: UserMetrics;
  hygiene: HygieneChecklistItem[];
  activities: ActivityItem[];
  demoPreviewActive: boolean;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        theme: parsed.theme === "light" ? "light" : "dark",
        language: parsed.language === "hi" ? "hi" : "en",
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        metrics: { ...DEFAULT_METRICS, ...(parsed.metrics || {}) },
        hygiene: parsed.hygiene?.length ? parsed.hygiene : INITIAL_HYGIENE_CHECKLIST,
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
        demoPreviewActive: Boolean(parsed.demoPreviewActive),
      };
    }
  } catch {
    // Ignore storage read errors and fall back to defaults
  }
  return {
    theme: "dark",
    language: "en",
    settings: DEFAULT_SETTINGS,
    metrics: DEFAULT_METRICS,
    hygiene: INITIAL_HYGIENE_CHECKLIST,
    activities: [],
    demoPreviewActive: false,
  };
}

interface AppContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  metrics: UserMetrics;
  hygiene: HygieneChecklistItem[];
  toggleHygieneItem: (id: string) => void;
  activities: ActivityItem[];
  demoPreviewActive: boolean;
  postureScore: number;
  sessionSnapshot: SanitizedCredentialSnapshot | null;
  setSessionSnapshot: (snapshot: SanitizedCredentialSnapshot | null) => void;
  updateSessionBreachStatus: (
    status: SanitizedCredentialSnapshot["breachStatus"],
    count: number
  ) => void;
  recordPasswordAudit: (entropyBits: number, score: number) => void;
  recordPasswordGenerated: (entropyBits: number) => void;
  recordBreachCheck: (exposed: boolean, labelEn: string, labelHi: string) => void;
  recordPhishingScan: (flagged: boolean, riskScore: number) => void;
  recordQuizResult: (correctCount: number, totalCount: number, streak: number, xpEarned: number) => void;
  loadDemoPreview: () => void;
  clearDemoPreview: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  // Strictly volatile in-memory sanitized report snapshot (never persisted to localStorage)
  const [sessionSnapshot, setSessionSnapshot] =
    useState<SanitizedCredentialSnapshot | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [state.theme]);

  useEffect(() => {
    try {
      const toSave: PersistedState = state.settings.persistActivity
        ? state
        : { ...state, activities: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  const setTheme = (theme: ThemeMode) => setState((prev) => ({ ...prev, theme }));
  const toggleTheme = () =>
    setState((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }));

  const setLanguage = (language: Language) =>
    setState((prev) => ({
      ...prev,
      language,
      metrics: {
        ...prev.metrics,
        usedHindiOrSwitchedLang: prev.metrics.usedHindiOrSwitchedLang || language === "hi",
      },
    }));

  const updateSettings = (patch: Partial<UserSettings>) =>
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));

  const appendActivity = (
    prev: PersistedState,
    item: Omit<ActivityItem, "id" | "timestamp">
  ): ActivityItem[] => {
    const entry: ActivityItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    return [entry, ...prev.activities].slice(0, 25);
  };

  const toggleHygieneItem = (id: string) =>
    setState((prev) => {
      const nextHygiene = prev.hygiene.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      const toggled = nextHygiene.find((item) => item.id === id);
      const xpDelta = toggled?.completed ? 30 : 0;
      return {
        ...prev,
        hygiene: nextHygiene,
        metrics: { ...prev.metrics, xp: prev.metrics.xp + xpDelta },
        activities: toggled?.completed
          ? appendActivity(prev, {
              type: "hygiene",
              titleEn: `Completed hygiene control: ${toggled.titleEn}`,
              titleHi: `सुरक्षा नियंत्रण पूरा किया: ${toggled.titleHi}`,
              meta: "+30 XP",
            })
          : prev.activities,
      };
    });

  const recordPasswordAudit = (entropyBits: number, score: number) =>
    setState((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        passwordsAudited: prev.metrics.passwordsAudited + 1,
        bestEntropySeen: Math.max(prev.metrics.bestEntropySeen, entropyBits),
        xp: prev.metrics.xp + 20,
      },
      activities: appendActivity(prev, {
        type: "analyzer",
        titleEn: `Audited password strength (${entropyBits} bits • ${score}/100)`,
        titleHi: `पासवर्ड क्षमता जांची (${entropyBits} बिट्स • ${score}/100)`,
        meta: "+20 XP",
      }),
    }));

  const recordPasswordGenerated = (entropyBits: number) =>
    setState((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        passwordsGenerated: prev.metrics.passwordsGenerated + 1,
        bestEntropySeen: Math.max(prev.metrics.bestEntropySeen, entropyBits),
        xp: prev.metrics.xp + 10,
      },
      activities: appendActivity(prev, {
        type: "generator",
        titleEn: `Generated CSPRNG secret (${entropyBits} bits entropy)`,
        titleHi: `नया CSPRNG पासवर्ड बनाया (${entropyBits} बिट्स एंट्रॉपी)`,
        meta: "+10 XP",
      }),
    }));

  const recordBreachCheck = (exposed: boolean, labelEn: string, labelHi: string) =>
    setState((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        breachChecksRun: prev.metrics.breachChecksRun + 1,
        threatsFlagged: prev.metrics.threatsFlagged + (exposed ? 1 : 0),
        xp: prev.metrics.xp + 25,
      },
      activities: appendActivity(prev, {
        type: "breach",
        titleEn: labelEn,
        titleHi: labelHi,
        meta: "+25 XP",
      }),
    }));

  const recordPhishingScan = (flagged: boolean, riskScore: number) =>
    setState((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        phishingScansRun: prev.metrics.phishingScansRun + 1,
        threatsFlagged: prev.metrics.threatsFlagged + (flagged ? 1 : 0),
        xp: prev.metrics.xp + 25,
      },
      activities: appendActivity(prev, {
        type: "phishing",
        titleEn: `Phishing scan completed (Risk ${riskScore}/100)`,
        titleHi: `फ़िशिंग स्कैन पूरा हुआ (जोखिम ${riskScore}/100)`,
        meta: "+25 XP",
      }),
    }));

  const recordQuizResult = (
    correctCount: number,
    totalCount: number,
    streak: number,
    xpEarned: number
  ) =>
    setState((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        quizzesCompleted: prev.metrics.quizzesCompleted + 1,
        quizCorrectAnswers: prev.metrics.quizCorrectAnswers + correctCount,
        quizTotalAnswered: prev.metrics.quizTotalAnswered + totalCount,
        bestQuizStreak: Math.max(prev.metrics.bestQuizStreak, streak),
        xp: prev.metrics.xp + xpEarned,
      },
      activities: appendActivity(prev, {
        type: "quiz",
        titleEn: `Completed Security Quiz (${correctCount}/${totalCount} correct)`,
        titleHi: `सुरक्षा क्विज़ पूरा किया (${correctCount}/${totalCount} सही)`,
        meta: `+${xpEarned} XP`,
      }),
    }));

  const loadDemoPreview = () =>
    setState((prev) => ({
      ...prev,
      demoPreviewActive: true,
      metrics: {
        ...prev.metrics,
        passwordsAudited: Math.max(prev.metrics.passwordsAudited, 6),
        bestEntropySeen: Math.max(prev.metrics.bestEntropySeen, 86.4),
        passwordsGenerated: Math.max(prev.metrics.passwordsGenerated, 8),
        breachChecksRun: Math.max(prev.metrics.breachChecksRun, 3),
        phishingScansRun: Math.max(prev.metrics.phishingScansRun, 4),
        threatsFlagged: Math.max(prev.metrics.threatsFlagged, 2),
        quizzesCompleted: Math.max(prev.metrics.quizzesCompleted, 2),
        quizCorrectAnswers: Math.max(prev.metrics.quizCorrectAnswers, 7),
        quizTotalAnswered: Math.max(prev.metrics.quizTotalAnswered, 8),
        bestQuizStreak: Math.max(prev.metrics.bestQuizStreak, 5),
        xp: Math.max(prev.metrics.xp, 520),
      },
      hygiene: prev.hygiene.map((h, idx) => (idx < 3 ? { ...h, completed: true } : h)),
      activities: [...DEMO_SAMPLE_ACTIVITIES, ...prev.activities.filter((a) => !a.isDemo)].slice(0, 25),
    }));

  const clearDemoPreview = () =>
    setState((prev) => ({
      ...prev,
      demoPreviewActive: false,
      metrics: DEFAULT_METRICS,
      hygiene: INITIAL_HYGIENE_CHECKLIST,
      activities: prev.activities.filter((a) => !a.isDemo),
    }));

  const updateSessionBreachStatus = (
    breachStatus: SanitizedCredentialSnapshot["breachStatus"],
    breachCount: number
  ) => {
    setSessionSnapshot((prev) =>
      prev ? { ...prev, breachStatus, breachCount } : prev
    );
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionSnapshot(null);
    setState({
      theme: state.theme,
      language: state.language,
      settings: DEFAULT_SETTINGS,
      metrics: DEFAULT_METRICS,
      hygiene: INITIAL_HYGIENE_CHECKLIST,
      activities: [],
      demoPreviewActive: false,
    });
  };

  const postureScore = useMemo(() => {
    const hygieneWeight = state.hygiene.reduce(
      (sum, item) => sum + (item.completed ? item.weight : 0),
      0
    ); // 0..100 -> contributes 45%
    const quizAcc =
      state.metrics.quizTotalAnswered > 0
        ? (state.metrics.quizCorrectAnswers / state.metrics.quizTotalAnswered) * 100
        : 0; // contributes 25%
    const entropyFactor = Math.min(100, (state.metrics.bestEntropySeen / 80) * 100); // 20%
    const activeToolUsage = Math.min(
      100,
      (state.metrics.passwordsAudited + state.metrics.breachChecksRun + state.metrics.phishingScansRun) * 20
    ); // 10%
    return Math.round(
      hygieneWeight * 0.45 + quizAcc * 0.25 + entropyFactor * 0.2 + activeToolUsage * 0.1
    );
  }, [state.hygiene, state.metrics]);

  const value: AppContextValue = {
    theme: state.theme,
    setTheme,
    toggleTheme,
    language: state.language,
    setLanguage,
    t: dictionaries[state.language],
    settings: state.settings,
    updateSettings,
    metrics: state.metrics,
    hygiene: state.hygiene,
    toggleHygieneItem,
    activities: state.activities,
    demoPreviewActive: state.demoPreviewActive,
    postureScore,
    sessionSnapshot,
    setSessionSnapshot,
    updateSessionBreachStatus,
    recordPasswordAudit,
    recordPasswordGenerated,
    recordBreachCheck,
    recordPhishingScan,
    recordQuizResult,
    loadDemoPreview,
    clearDemoPreview,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
