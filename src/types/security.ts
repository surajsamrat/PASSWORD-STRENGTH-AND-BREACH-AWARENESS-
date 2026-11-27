export type Language = "en" | "hi";
export type ThemeMode = "dark" | "light";

export type StrengthLevel =
  | "empty"
  | "very-weak"
  | "weak"
  | "fair"
  | "strong"
  | "very-strong";

export interface PasswordWeakness {
  id: string;
  severity: "high" | "medium" | "low";
  titleEn: string;
  titleHi: string;
  detailEn: string;
  detailHi: string;
}

export interface CrackTimeEstimates {
  onlineThrottled: string;
  onlineUnthrottled: string;
  offlineBcrypt: string;
  offlineGpuCluster: string;
}

export interface ZxcvbnPatternSummary {
  pattern: string;
  matchedLength: number;
  dictionaryName?: string;
}

export interface PasswordAnalysisResult {
  length: number;
  poolSize: number;
  entropyBits: number;
  shannonEntropyBits: number;
  effectiveEntropyBits: number;
  score: number; // 0 - 100
  level: StrengthLevel;
  zxcvbnScore: 0 | 1 | 2 | 3 | 4;
  zxcvbnGuessesLog10: number;
  zxcvbnWarning: string;
  zxcvbnSuggestions: string[];
  zxcvbnPatterns: ZxcvbnPatternSummary[];
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  hasRepeatedChars: boolean;
  hasSequentialPattern: boolean;
  hasDictionaryOrCommon: boolean;
  uniqueChars: number;
  weaknesses: PasswordWeakness[];
  recommendationsEn: string[];
  recommendationsHi: string[];
  nistCompliant: boolean;
  crackTimes: CrackTimeEstimates;
}

export interface PasswordBreachResult {
  status: "idle" | "checking" | "pwned" | "clean" | "error";
  prefix: string;
  count: number;
  rangeEntriesChecked?: number;
  paddedEntriesIgnored?: number;
  recommendationsEn?: string[];
  recommendationsHi?: string[];
  errorMessage?: string;
  checkedAt?: string;
}

export interface DemoEmailBreach {
  id: string;
  breachName: string;
  domain: string;
  breachDate: string;
  pwnCountLabel: string;
  dataClasses: string[];
  severity: "high" | "medium" | "low";
  descriptionEn: string;
  descriptionHi: string;
}

export type RiskLevel = "safe" | "caution" | "suspicious" | "high-risk";

export interface PhishingIndicator {
  id: string;
  severity: "high" | "medium" | "low" | "info";
  category: "url" | "domain" | "content" | "protocol";
  titleEn: string;
  titleHi: string;
  detailEn: string;
  detailHi: string;
  weight: number;
}

export interface PhishingAnalysisResult {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  parsedHost?: string;
  parsedProtocol?: string;
  extractedUrls: string[];
  indicators: PhishingIndicator[];
  adviceEn: string[];
  adviceHi: string[];
}

export interface QuizQuestion {
  id: string;
  category: "passwords" | "phishing" | "mfa" | "network";
  difficulty: "beginner" | "intermediate" | "advanced";
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
  xp: number;
}

export interface ActivityItem {
  id: string;
  type: "analyzer" | "generator" | "breach" | "phishing" | "quiz" | "hygiene";
  titleEn: string;
  titleHi: string;
  meta: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface HygieneChecklistItem {
  id: string;
  completed: boolean;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  weight: number;
}

export interface UserMetrics {
  passwordsAudited: number;
  bestEntropySeen: number;
  passwordsGenerated: number;
  breachChecksRun: number;
  phishingScansRun: number;
  threatsFlagged: number;
  quizzesCompleted: number;
  quizCorrectAnswers: number;
  quizTotalAnswered: number;
  bestQuizStreak: number;
  xp: number;
  usedHindiOrSwitchedLang: boolean;
}

export interface UserSettings {
  displayName: string;
  roleTitle: string;
  persistActivity: boolean;
  clipboardAutoClearSeconds: number;
  strictAnalyzerMode: boolean;
}

export interface AchievementDef {
  id: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  xpReward: number;
  progress: (metrics: UserMetrics, hygieneDoneCount: number) => {
    current: number;
    target: number;
    unlocked: boolean;
  };
}

export interface DemoLeaderboardEntry {
  id: string;
  name: string;
  role: string;
  xp: number;
  quizzesCompleted: number;
  accuracy: number;
  streak: number;
  isCurrentUser?: boolean;
  isDemo: boolean;
}

export interface ImprovementActionStep {
  id: string;
  priority: "high" | "medium" | "low";
  titleEn: string;
  titleHi: string;
  detailEn: string;
  detailHi: string;
}

export interface PatternExplanation {
  id: "repeated" | "sequential" | "length" | "dictionary";
  detected: boolean;
  titleEn: string;
  titleHi: string;
  explanationEn: string;
  explanationHi: string;
}

export interface PasswordImprovementPlan {
  weakCharacteristicsEn: string[];
  weakCharacteristicsHi: string[];
  lengthRecommendationEn: string;
  lengthRecommendationHi: string;
  patternExplanations: PatternExplanation[];
  passphraseSuggestions: string[];
  actionableSteps: ImprovementActionStep[];
}

export interface SanitizedCredentialSnapshot {
  strengthLevel: StrengthLevel;
  score: number;
  length: number;
  entropyBits: number;
  shannonEntropyBits: number;
  effectiveEntropyBits: number;
  zxcvbnScore: 0 | 1 | 2 | 3 | 4;
  zxcvbnGuessesLog10: number;
  crackTimes: CrackTimeEstimates;
  breachStatus: "not-checked" | "pwned" | "clean" | "error";
  breachCount: number;
  sanitizedWeaknesses: Array<{
    id: string;
    severity: "high" | "medium" | "low";
    titleEn: string;
    titleHi: string;
    detailEn: string;
    detailHi: string;
  }>;
  improvementSteps: ImprovementActionStep[];
  assessedAt: string;
}

export interface CrackTimeAssumption {
  scenarioEn: string;
  scenarioHi: string;
  assumptionEn: string;
  assumptionHi: string;
  estimate: string;
}

export interface SecurityRiskReport {
  reportId: string;
  generatedAt: string;
  operatorName: string;
  postureScore: number;
  postureGrade: "A" | "B" | "C" | "D" | "F";
  demoPreviewIncluded: boolean;
  credentialSnapshot: SanitizedCredentialSnapshot | null;
  crackTimeAssumptions: CrackTimeAssumption[];
  hygieneSummary: {
    completed: number;
    total: number;
    items: Array<{ id: string; titleEn: string; titleHi: string; completed: boolean }>;
  };
  overallAssessment: {
    riskTier: "low" | "moderate" | "elevated" | "high";
    labelEn: string;
    labelHi: string;
    summaryEn: string;
    summaryHi: string;
  };
  estimateLimitationsEn: string[];
  estimateLimitationsHi: string[];
}
