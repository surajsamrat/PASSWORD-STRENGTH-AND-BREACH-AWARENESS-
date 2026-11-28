import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Eraser,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { analyzePassword } from "@/lib/security/passwordAnalyzer";
import { buildPasswordImprovementPlan } from "@/lib/security/passwordImprovement";
import { createSanitizedCredentialSnapshot } from "@/lib/security/securityReport";
import type { StrengthLevel } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { ScoreRing } from "@/components/common/ScoreRing";
import { PasswordImprovementPanel } from "@/components/security/PasswordImprovementPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const METER_SEGMENTS: Array<{
  level: StrengthLevel;
  colorClass: string;
  threshold: number;
}> = [
  { level: "very-weak", colorClass: "bg-rose-500", threshold: 1 },
  { level: "weak", colorClass: "bg-orange-500", threshold: 21 },
  { level: "fair", colorClass: "bg-amber-400", threshold: 43 },
  { level: "strong", colorClass: "bg-sky-500", threshold: 65 },
  { level: "very-strong", colorClass: "bg-emerald-500", threshold: 85 },
];

export const PasswordAnalyzerPage: React.FC = () => {
  const { t, language, settings, recordPasswordAudit, setSessionSnapshot, setAnalyzerContext } =
    useApp();
  const [password, setPassword] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Strict security requirement: clear password & sensitive context from memory on page leave
  useEffect(() => {
    return () => {
      setPassword("");
      setContextInput("");
      setShowPassword(false);
      setAnalyzerContext(undefined);
    };
  }, [setAnalyzerContext]);

  const result = useMemo(() => {
    const tokens = contextInput
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return analyzePassword(password, {
      contextTokens: tokens,
      strictMode: settings.strictAnalyzerMode,
    });
  }, [password, contextInput, settings.strictAnalyzerMode]);

  useEffect(() => {
    if (!password || result.level === "empty") {
      setAnalyzerContext(undefined);
      return;
    }
    // Expose strictly non-sensitive numeric/structural telemetry to the context-aware assistant
    setAnalyzerContext({
      score: result.score,
      level: result.level,
      length: result.length,
      entropyBits: result.entropyBits,
      effectiveEntropyBits: result.effectiveEntropyBits,
      weaknessIds: result.weaknesses.map((w) => w.id),
      crackTimes: result.crackTimes,
    });
  }, [password, result, setAnalyzerContext]);

  const handleClearMemory = () => {
    setPassword("");
    setContextInput("");
    setShowPassword(false);
  };

  const handleRecordAudit = () => {
    if (!password) return;
    // Only sanitized numeric/structural metadata is recorded—never the password string or hash
    recordPasswordAudit(result.effectiveEntropyBits, result.score);
    const plan = buildPasswordImprovementPlan(result);
    setSessionSnapshot(createSanitizedCredentialSnapshot(result, plan));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const levelTone =
    result.level === "very-strong"
      ? "emerald"
      : result.level === "strong"
      ? "blue"
      : result.level === "fair"
      ? "amber"
      : "red";

  const activeSegments =
    result.level === "empty"
      ? 0
      : result.level === "very-weak"
      ? 1
      : result.level === "weak"
      ? 2
      : result.level === "fair"
      ? 3
      : result.level === "strong"
      ? 4
      : 5;

  const badgeVariant =
    result.level === "very-strong"
      ? "emerald"
      : result.level === "strong"
      ? "default"
      : result.level === "fair"
      ? "amber"
      : result.level === "empty"
      ? "secondary"
      : "destructive";

  const SAMPLE_TEST_PASSWORDS = [
    { label: t.analyzer.sampleVeryWeak, value: "123456" },
    { label: t.analyzer.sampleWeak, value: "dragon99!" },
    { label: t.analyzer.sampleFair, value: "Summer2026!" },
    { label: t.analyzer.sampleVeryStrong, value: "timber-lantern-quartz-49!" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.analyzer.title}
        subtitle={t.analyzer.subtitle}
        badge={
          <Badge variant="emerald">
            <Lock className="h-3 w-3" />
            {t.analyzer.badgeLabel}
          </Badge>
        }
      />

      {/* Explicit Privacy Indicator Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
          <Lock className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-bold mr-1.5">{t.analyzer.privacyTitle}:</span>
            <span>{t.analyzer.privacyBanner}</span>
          </div>
        </div>
        <Badge variant="emerald" className="shrink-0 self-start sm:self-center font-mono text-[10px]">
          {t.analyzer.privacyPill}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input & Real-Time Strength Meter */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-sky-500" />
                {t.analyzer.inputLabel}
              </CardTitle>
              <Badge variant={badgeVariant} data-testid="strength-category-badge">
                {t.analyzer.levels[result.level]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.analyzer.inputPlaceholder}
                className="pr-24 font-mono text-base h-12"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={t.analyzer.inputLabel}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword
                      ? t.analyzer.hidePasswordAria
                      : t.analyzer.showPasswordAria
                  }
                  title={
                    showPassword
                      ? t.analyzer.hidePasswordAria
                      : t.analyzer.showPasswordAria
                  }
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearMemory}
                    aria-label={t.analyzer.clearPasswordAria}
                    title={t.analyzer.clearPasswordAria}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 5-Category Real-Time Strength Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">
                  {t.analyzer.strengthMeterLabel}
                </span>
                <span className="font-mono font-bold">
                  {result.score}/100 • {t.analyzer.levels[result.level]}
                </span>
              </div>
              <div
                className="grid grid-cols-5 gap-1.5"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={result.score}
              >
                {METER_SEGMENTS.map((seg, idx) => {
                  const filled = idx < activeSegments;
                  const activeSegColor =
                    activeSegments === 1
                      ? "bg-rose-500"
                      : activeSegments === 2
                      ? "bg-orange-500"
                      : activeSegments === 3
                      ? "bg-amber-400"
                      : activeSegments === 4
                      ? "bg-sky-500"
                      : "bg-emerald-500";
                  return (
                    <div
                      key={seg.level}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-300",
                        filled ? activeSegColor : "bg-secondary"
                      )}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-5 text-[10px] text-muted-foreground text-center">
                <span>{t.analyzer.levels["very-weak"]}</span>
                <span>{t.analyzer.levels.weak}</span>
                <span>{t.analyzer.levels.fair}</span>
                <span>{t.analyzer.levels.strong}</span>
                <span>{t.analyzer.levels["very-strong"]}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t.analyzer.contextLabel}
              </label>
              <Input
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder={t.analyzer.contextPlaceholder}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground mr-1">
                {t.analyzer.testSamplesLabel}
              </span>
              {SAMPLE_TEST_PASSWORDS.map((sample) => (
                <Button
                  key={sample.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPassword(sample.value)}
                >
                  {sample.label}
                </Button>
              ))}
            </div>

            <div className="pt-2 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="emerald"
                  disabled={!password}
                  onClick={handleRecordAudit}
                >
                  <Sparkles className="h-4 w-4" />
                  {t.analyzer.recordAuditBtn}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/security-report">
                    {t.nav.report}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              {savedNotice && (
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t.analyzer.auditSavedMsg}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Separate Entropy & zxcvbn Score Card */}
        <Card className="lg:col-span-5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 h-full justify-between">
            <ScoreRing
              value={result.score}
              size={146}
              tone={levelTone}
              label={`${result.score}`}
              sublabel={t.analyzer.levels[result.level]}
            />

            <div className="flex-1 w-full space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-2.5">
                  <p className="text-muted-foreground">{t.analyzer.entropyLabel}</p>
                  <p className="font-mono font-bold text-sky-400 mt-0.5">
                    {result.entropyBits} bits
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-2.5">
                  <p className="text-muted-foreground">{t.analyzer.shannonEntropyLabel}</p>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">
                    {result.shannonEntropyBits} bits
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-2.5">
                  <p className="text-muted-foreground">{t.analyzer.rawEntropyLabel}</p>
                  <p className="font-mono font-bold mt-0.5">
                    {result.effectiveEntropyBits} bits
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/40 p-2.5">
                  <p className="text-muted-foreground">{t.analyzer.zxcvbnScoreLabel}</p>
                  <p className="font-mono font-bold mt-0.5">
                    {result.zxcvbnScore}/4 (10^{result.zxcvbnGuessesLog10})
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-muted-foreground">
                  {t.analyzer.poolSizeLabel}: <strong className="font-mono text-foreground">{result.poolSize}</strong> • {t.common.lenShort}:{" "}
                  <strong className="font-mono text-foreground">{result.length}</strong>
                </span>
                <Badge variant={result.nistCompliant ? "emerald" : "destructive"}>
                  {result.nistCompliant ? t.analyzer.compliant : t.analyzer.nonCompliant}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Character & Pattern Detection Matrix + Offline Crack Times */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-500" />
              {t.analyzer.charBreakdownTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                label: `${t.analyzer.checks.lengthIdeal} (${result.length} ${t.common.charsUnit})`,
                ok: result.length >= 12,
                warn: result.length > 0 && result.length < 12,
              },
              { label: t.analyzer.checks.uppercase, ok: result.hasUpper, warn: false },
              { label: t.analyzer.checks.lowercase, ok: result.hasLower, warn: false },
              { label: t.analyzer.checks.digits, ok: result.hasDigit, warn: false },
              { label: t.analyzer.checks.symbols, ok: result.hasSymbol, warn: false },
              {
                label: t.analyzer.checks.noRepeats,
                ok: result.length > 0 && !result.hasRepeatedChars,
                warn: result.hasRepeatedChars,
              },
              {
                label: t.analyzer.checks.noSequences,
                ok: result.length > 0 && !result.hasSequentialPattern,
                warn: result.hasSequentialPattern,
              },
              {
                label: t.analyzer.checks.noDict,
                ok: result.length > 0 && !result.hasDictionaryOrCommon,
                warn: result.hasDictionaryOrCommon,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold",
                  item.ok
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-500"
                    : item.warn
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border/70 bg-secondary/30 text-muted-foreground"
                )}
              >
                <span>{item.label}</span>
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : item.warn ? (
                  <XCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-border" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-500" />
              {t.analyzer.crackTimesTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                labelEn: "Offline Slow Hash (bcrypt/Argon2 @ 10k/s)",
                labelHi: "ऑफ़लाइन धीमा हैश (bcrypt @ 10k/सेकंड)",
                val: result.crackTimes.offlineBcrypt,
                highlight: true,
              },
              {
                labelEn: "Offline Fast GPU Rig (SHA-256 @ 10B/s)",
                labelHi: "ऑफ़लाइन तेज़ GPU रिग (10B/सेकंड)",
                val: result.crackTimes.offlineGpuCluster,
                highlight: true,
              },
              {
                labelEn: "Online Throttled (100 attempts/hr)",
                labelHi: "ऑनलाइन सीमित (100/घंटा)",
                val: result.crackTimes.onlineThrottled,
                highlight: false,
              },
              {
                labelEn: "Online Unthrottled (10 attempts/sec)",
                labelHi: "ऑनलाइन असीमित (10/सेकंड)",
                val: result.crackTimes.onlineUnthrottled,
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.labelEn}
                className={cn(
                  "rounded-xl border p-3.5 flex flex-col justify-between gap-1",
                  tier.highlight
                    ? "border-sky-500/30 bg-sky-500/5"
                    : "border-border/80 bg-secondary/35"
                )}
              >
                <span className="text-xs text-muted-foreground">
                  {language === "hi" ? tier.labelHi : tier.labelEn}
                </span>
                <span className="text-base font-extrabold font-mono text-sky-400">
                  {tier.val}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weaknesses & Detailed Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t.analyzer.weaknessesTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.zxcvbnPatterns.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <span className="text-xs text-muted-foreground mr-1">
                  {t.analyzer.zxcvbnMatchesLabel}
                </span>
                {result.zxcvbnPatterns.map((p, idx) => (
                  <Badge key={idx} variant="outline" className="font-mono text-[10px]">
                    {p.pattern}
                    {p.dictionaryName ? `:${p.dictionaryName}` : ""} ({p.matchedLength})
                  </Badge>
                ))}
              </div>
            )}

            {result.weaknesses.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-500 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>{t.analyzer.noWeaknesses}</span>
              </div>
            ) : (
              result.weaknesses.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">
                      {language === "hi" ? w.titleHi : w.titleEn}
                    </span>
                    <Badge
                      variant={
                        w.severity === "high"
                          ? "destructive"
                          : w.severity === "medium"
                          ? "amber"
                          : "secondary"
                      }
                    >
                      {w.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === "hi" ? w.detailHi : w.detailEn}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t.analyzer.recommendationsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(language === "hi" ? result.recommendationsHi : result.recommendationsEn).map(
              (rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {password.length > 0 && <PasswordImprovementPanel analysis={result} />}
    </div>
  );
};
