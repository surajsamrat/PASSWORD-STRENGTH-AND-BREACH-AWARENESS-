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
  category:
    | "syntax"
    | "ip-host"
    | "subdomain"
    | "domain"
    | "shortener"
    | "keywords"
    | "protocol"
    | "content";
  titleEn: string;
  titleHi: string;
  detailEn: string;
  detailHi: string;
  weight: number;
}

export interface UrlAnatomy {
  protocol: string;
  subdomains: string;
  rootDomain: string;
  port: string;
  pathAndQuery: string;
}

export interface PhishingDetectionSummary {
  isIpBasedHost: boolean;
  hasMisleadingSubdomain: boolean;
  isUrlShortener: boolean;
  hasSuspiciousDomainPattern: boolean;
  hasSuspiciousKeywords: boolean;
  hasUnsafeProtocol: boolean;
}

export interface PhishingAnalysisResult {
  isValidUrlSyntax: boolean;
  syntaxErrorEn?: string;
  syntaxErrorHi?: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  parsedHost?: string;
  parsedProtocol?: string;
  urlAnatomy?: UrlAnatomy;
  detectionSummary: PhishingDetectionSummary;
  extractedUrls: string[];
  indicators: PhishingIndicator[];
  adviceEn: string[];
  adviceHi: string[];
}

export interface ThreatIntelMatch {
  threatType: string;
  platformType: string;
  threatEntryType: string;
}

export interface ThreatIntelResult {
  provider: string;
  providerName: string;
  configured: boolean;
  status: "safe" | "flagged" | "unconfigured" | "error";
  matches: ThreatIntelMatch[];
  checkedAt?: string;
  noteEn: string;
  noteHi: string;
}

export interface ActivityItem {
  id: string;
  type: "analyzer" | "generator" | "breach" | "phishing" | "hygiene";
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

export interface LiveToolContext {
  analyzer?: {
    score: number;
    level: StrengthLevel;
    length: number;
    entropyBits: number;
    effectiveEntropyBits: number;
    weaknessIds: string[];
    crackTimes: CrackTimeEstimates;
  };
  generator?: {
    mode: "random" | "passphrase";
    lengthOrWords: number;
    enabledCharsetsCount: number;
    excludeAmbiguous: boolean;
  };
  breach?: {
    status: "idle" | "checking" | "pwned" | "clean" | "error";
    count: number;
  };
  phishing?: {
    riskScore: number;
    riskLevel: RiskLevel;
    indicatorCategories: string[];
    summaryFlags: string[];
  };
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
