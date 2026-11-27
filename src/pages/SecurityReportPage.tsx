import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eraser,
  Eye,
  EyeOff,
  FileBarChart2,
  Info,
  Lock,
  Printer,
  Radar,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { analyzePassword } from "@/lib/security/passwordAnalyzer";
import { buildPasswordImprovementPlan } from "@/lib/security/passwordImprovement";
import {
  buildSecurityRiskReport,
  createSanitizedCredentialSnapshot,
  downloadSecurityReportPdf,
} from "@/lib/security/securityReport";
import { PageHeader } from "@/components/common/PageHeader";
import { ScoreRing } from "@/components/common/ScoreRing";
import { DemoBadge } from "@/components/common/DemoBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const SecurityReportPage: React.FC = () => {
  const {
    t,
    language,
    settings,
    metrics,
    hygiene,
    toggleHygieneItem,
    postureScore,
    demoPreviewActive,
    sessionSnapshot,
    setSessionSnapshot,
    recordPasswordAudit,
  } = useApp();

  // Optional quick in-memory evaluator on the Report page (clears immediately on submit & unmount)
  const [quickPw, setQuickPw] = useState("");
  const [showQuickPw, setShowQuickPw] = useState(false);

  useEffect(() => {
    return () => {
      setQuickPw("");
      setShowQuickPw(false);
    };
  }, []);

  const report = useMemo(
    () =>
      buildSecurityRiskReport({
        operatorName: settings.displayName,
        postureScore,
        demoPreviewIncluded: demoPreviewActive,
        credentialSnapshot: sessionSnapshot,
        hygiene,
      }),
    [settings.displayName, postureScore, demoPreviewActive, sessionSnapshot, hygiene]
  );

  const quizAccuracy =
    metrics.quizTotalAnswered > 0
      ? Math.round((metrics.quizCorrectAnswers / metrics.quizTotalAnswered) * 100)
      : 0;

  const handleQuickEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPw) return;
    const analysis = analyzePassword(quickPw, {
      strictMode: settings.strictAnalyzerMode,
    });
    const plan = buildPasswordImprovementPlan(analysis);
    const snapshot = createSanitizedCredentialSnapshot(analysis, plan);
    setSessionSnapshot(snapshot);
    recordPasswordAudit(analysis.effectiveEntropyBits, analysis.score);
    // Clear password immediately from component memory after generating sanitized snapshot
    setQuickPw("");
    setShowQuickPw(false);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `securecheck-risk-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const snap = report.credentialSnapshot;

  const riskBadgeVariant =
    report.overallAssessment.riskTier === "low"
      ? "emerald"
      : report.overallAssessment.riskTier === "moderate"
      ? "default"
      : report.overallAssessment.riskTier === "elevated"
      ? "amber"
      : "destructive";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.report.title}
        subtitle={t.report.subtitle}
        badge={
          demoPreviewActive ? (
            <DemoBadge />
          ) : (
            <Badge variant="emerald">
              <Lock className="h-3 w-3" />
              Sanitized Report
            </Badge>
          )
        }
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            {snap && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSessionSnapshot(null)}
              >
                <Eraser className="h-4 w-4" />
                {t.report.clearSession}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Download className="h-4 w-4" />
              {t.common.exportJson}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {t.common.printReport}
            </Button>
            <Button
              size="sm"
              variant="emerald"
              onClick={() => downloadSecurityReportPdf(report, language)}
            >
              <Download className="h-4 w-4" />
              {t.report.downloadPdf}
            </Button>
          </div>
        }
      />

      {/* Strict Report Sanitization Privacy Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
          <Lock className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
          <span>{t.report.privacyBanner}</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground shrink-0">
          ID: {report.reportId}
        </span>
      </div>

      {/* Overall Security Assessment & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileBarChart2 className="h-4 w-4 text-emerald-500" />
                {t.report.postureGrade}
              </CardTitle>
              <Badge variant={riskBadgeVariant} className="uppercase text-[10px]">
                {report.overallAssessment.riskTier} risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <ScoreRing
                value={report.postureScore}
                size={138}
                label={report.postureGrade}
                sublabel={`${report.postureScore}/100`}
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-sm font-bold">
                  {language === "hi"
                    ? report.overallAssessment.labelHi
                    : report.overallAssessment.labelEn}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === "hi"
                    ? report.overallAssessment.summaryHi
                    : report.overallAssessment.summaryEn}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Operator: <strong className="text-foreground">{report.operatorName}</strong>
              </span>
              <span>{new Date(report.generatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>{t.report.metricsBreakdown}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                labelEn: "Passwords Audited",
                labelHi: "जांचे गए पासवर्ड",
                value: metrics.passwordsAudited,
                progress: Math.min(100, metrics.passwordsAudited * 20),
              },
              {
                labelEn: "Peak Effective Entropy",
                labelHi: "सर्वोच्च एंट्रॉपी",
                value: `${Math.round(metrics.bestEntropySeen)} bits`,
                progress: Math.min(100, (metrics.bestEntropySeen / 90) * 100),
              },
              {
                labelEn: "Breach & Phishing Scans",
                labelHi: "ब्रीच और फ़िशिंग स्कैन",
                value: metrics.breachChecksRun + metrics.phishingScansRun,
                progress: Math.min(
                  100,
                  (metrics.breachChecksRun + metrics.phishingScansRun) * 20
                ),
              },
              {
                labelEn: "Quiz Accuracy",
                labelHi: "क्विज़ सटीकता",
                value: `${quizAccuracy}%`,
                progress: quizAccuracy,
              },
            ].map((row) => (
              <div
                key={row.labelEn}
                className="rounded-xl border border-border/80 bg-secondary/35 p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "hi" ? row.labelHi : row.labelEn}
                  </span>
                  <span className="font-mono font-bold">{row.value}</span>
                </div>
                <Progress value={row.progress} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Credential Risk Snapshot Section */}
      <Card className="border-sky-500/25">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-sky-400" />
                {t.report.credentialSection}
              </CardTitle>
              <CardDescription className="mt-1">
                {snap
                  ? `Assessed ${new Date(snap.assessedAt).toLocaleString()} • Length: ${snap.length} chars (plaintext omitted)`
                  : t.report.noCredentialYet}
              </CardDescription>
            </div>
            {snap && (
              <Badge
                variant={
                  snap.strengthLevel === "very-strong"
                    ? "emerald"
                    : snap.strengthLevel === "strong"
                    ? "default"
                    : snap.strengthLevel === "fair"
                    ? "amber"
                    : "destructive"
                }
              >
                {t.analyzer.levels[snap.strengthLevel]} ({snap.score}/100)
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {!snap ? (
            <div className="space-y-4">
              <form
                onSubmit={handleQuickEvaluate}
                className="no-print flex flex-col sm:flex-row gap-3 rounded-xl border border-border/80 bg-secondary/30 p-4"
              >
                <div className="relative flex-1">
                  <Input
                    type={showQuickPw ? "text" : "password"}
                    value={quickPw}
                    onChange={(e) => setQuickPw(e.target.value)}
                    placeholder={t.analyzer.inputPlaceholder}
                    className="pr-11 font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQuickPw((s) => !s)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    aria-label={showQuickPw ? "Hide password" : "Show password"}
                  >
                    {showQuickPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button type="submit" disabled={!quickPw}>
                  {t.common.runScan}
                </Button>
              </form>
              <div className="no-print flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/analyzer">
                    {t.report.goToAnalyzer}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/breach-checker">
                    {t.report.goToBreach}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Strength, Entropy & Breach Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/80 bg-secondary/35 p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground">Strength Category</p>
                  <p className="text-base font-extrabold">
                    {t.analyzer.levels[snap.strengthLevel]}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    zxcvbn: {snap.zxcvbnScore}/4 (10^{snap.zxcvbnGuessesLog10})
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-secondary/35 p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground">Entropy Estimate</p>
                  <p className="text-base font-extrabold font-mono text-sky-400">
                    {snap.effectiveEntropyBits} bits
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    Pool {snap.entropyBits} • Shannon {snap.shannonEntropyBits}
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-secondary/35 p-3.5 space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Radar className="h-3.5 w-3.5 text-sky-400" />
                    {t.report.breachStatusTitle}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        snap.breachStatus === "pwned"
                          ? "text-destructive"
                          : snap.breachStatus === "clean"
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {snap.breachStatus === "pwned"
                        ? `Exposed in public breaches (${snap.breachCount.toLocaleString()} occurrences)`
                        : snap.breachStatus === "clean"
                        ? "Not found in HIBP public password corpus"
                        : snap.breachStatus === "error"
                        ? "Breach check failed / unavailable"
                        : "Not checked yet — run Breach Checker to attach status"}
                    </p>
                    {snap.breachStatus === "not-checked" && (
                      <Button asChild size="sm" variant="outline" className="no-print h-7 text-xs">
                        <Link to="/breach-checker">{t.report.goToBreach}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Crack-Time Assumptions Table */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  {t.report.crackAssumptionsTitle}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.crackTimeAssumptions.map((row) => (
                    <div
                      key={row.scenarioEn}
                      className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold">
                          {language === "hi" ? row.scenarioHi : row.scenarioEn}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {language === "hi" ? row.assumptionHi : row.assumptionEn}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-extrabold text-sky-400 shrink-0">
                        {row.estimate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sanitized Weaknesses & Improvement Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {t.report.weaknessesTitle}
                  </p>
                  {snap.sanitizedWeaknesses.length === 0 ? (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-500 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>{t.analyzer.noWeaknesses}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {snap.sanitizedWeaknesses.map((w) => (
                        <div
                          key={w.id}
                          className="rounded-xl border border-border/75 bg-secondary/30 p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold">
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
                              className="text-[10px] uppercase"
                            >
                              {w.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {language === "hi" ? w.detailHi : w.detailEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t.report.recommendationsTitle}
                  </p>
                  <div className="space-y-2">
                    {snap.improvementSteps.map((step) => (
                      <div
                        key={step.id}
                        className="rounded-xl border border-border/75 bg-secondary/30 p-3 space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">
                            {language === "hi" ? step.titleHi : step.titleEn}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {step.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {language === "hi" ? step.detailHi : step.detailEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Interactive Hygiene Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-500" />
            {t.report.hygieneTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {hygiene.map((item) => (
            <label
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border/80 bg-secondary/30 p-4 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.completed && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="text-sm font-bold">
                    {language === "hi" ? item.titleHi : item.titleEn}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "hi" ? item.descriptionHi : item.descriptionEn}
                </p>
              </div>
              <Switch
                checked={item.completed}
                onCheckedChange={() => toggleHygieneItem(item.id)}
              />
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Limitations of Estimates & Security Disclaimers */}
      <Card className="border-amber-500/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-amber-400" />
            {t.report.limitationsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            {(language === "hi"
              ? report.estimateLimitationsHi
              : report.estimateLimitationsEn
            ).map((lim, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-secondary/25 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
