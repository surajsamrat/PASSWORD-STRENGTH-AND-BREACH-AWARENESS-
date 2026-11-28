import React, { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  FishOff,
  Globe,
  Link2,
  Loader2,
  Lock,
  Radar,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { analyzePhishingInput } from "@/lib/security/phishingAnalyzer";
import { checkUrlThreatIntel } from "@/lib/security/threatIntelClient";
import { PHISHING_SAMPLE_CASES } from "@/data/demoData";
import type { PhishingAnalysisResult, ThreatIntelResult } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { ScoreRing } from "@/components/common/ScoreRing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const PhishingDetectorPage: React.FC = () => {
  const { t, language, recordPhishingScan, setPhishingContext } = useApp();
  const [urlInput, setUrlInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [result, setResult] = useState<PhishingAnalysisResult | null>(null);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelResult | null>(null);
  const [checkingIntel, setCheckingIntel] = useState(false);

  React.useEffect(() => {
    return () => {
      setPhishingContext(undefined);
    };
  }, [setPhishingContext]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() && !messageInput.trim()) return;

    const res = analyzePhishingInput({
      url: urlInput,
      messageText: messageInput,
    });
    setResult(res);
    setThreatIntel(null);
    const summaryFlags: string[] = [];
    if (res.detectionSummary.isIpBasedHost) summaryFlags.push("ip-host");
    if (res.detectionSummary.hasMisleadingSubdomain) summaryFlags.push("misleading-subdomain");
    if (res.detectionSummary.isUrlShortener) summaryFlags.push("url-shortener");
    if (res.detectionSummary.hasSuspiciousDomainPattern) summaryFlags.push("suspicious-domain");
    if (res.detectionSummary.hasSuspiciousKeywords) summaryFlags.push("scam-keywords");
    if (res.detectionSummary.hasUnsafeProtocol) summaryFlags.push("unsafe-protocol");
    setPhishingContext({
      riskScore: res.riskScore,
      riskLevel: res.riskLevel,
      indicatorCategories: Array.from(new Set(res.indicators.map((i) => i.category))),
      summaryFlags,
    });
    recordPhishingScan(
      res.riskLevel === "suspicious" || res.riskLevel === "high-risk",
      res.riskScore
    );

    const targetUrl = urlInput.trim() || res.extractedUrls[0];
    if (targetUrl && res.isValidUrlSyntax) {
      setCheckingIntel(true);
      const intel = await checkUrlThreatIntel(targetUrl);
      setThreatIntel(intel);
      setCheckingIntel(false);
    }
  };

  const riskTone =
    !result || result.riskLevel === "safe"
      ? "emerald"
      : result.riskLevel === "caution"
      ? "blue"
      : result.riskLevel === "suspicious"
      ? "amber"
      : "red";

  const riskBadgeVariant =
    !result || result.riskLevel === "safe"
      ? "emerald"
      : result.riskLevel === "caution"
      ? "default"
      : result.riskLevel === "suspicious"
      ? "amber"
      : "destructive";

  const inspectionChecks = result
    ? [
        {
          label: t.phishing.matrixLabels.syntax,
          flagged: !result.isValidUrlSyntax,
          okText: t.common.valid,
          warnText: t.common.invalid,
        },
        {
          label: t.phishing.matrixLabels.ipHost,
          flagged: result.detectionSummary.isIpBasedHost,
          okText: t.common.none,
          warnText: t.common.detected,
        },
        {
          label: t.phishing.matrixLabels.subdomain,
          flagged: result.detectionSummary.hasMisleadingSubdomain,
          okText: t.common.none,
          warnText: t.common.detected,
        },
        {
          label: t.phishing.matrixLabels.shortener,
          flagged: result.detectionSummary.isUrlShortener,
          okText: t.common.none,
          warnText: t.common.detected,
        },
        {
          label: t.phishing.matrixLabels.domainPattern,
          flagged: result.detectionSummary.hasSuspiciousDomainPattern,
          okText: t.common.none,
          warnText: t.common.detected,
        },
        {
          label: t.phishing.matrixLabels.keywords,
          flagged: result.detectionSummary.hasSuspiciousKeywords,
          okText: t.common.none,
          warnText: t.common.detected,
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.phishing.title}
        subtitle={t.phishing.subtitle}
        badge={
          <Badge variant="amber">
            <FishOff className="h-3 w-3" />
            {t.phishing.badgeLabel}
          </Badge>
        }
      />

      {/* Non-visit & Non-guarantee Security Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
        <Lock className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t.phishing.safetyBanner}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              {t.phishing.samplesTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PHISHING_SAMPLE_CASES.map((sample) => (
                <Button
                  key={sample.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUrlInput(sample.url);
                    setMessageInput(sample.message);
                  }}
                >
                  {language === "hi" ? sample.labelHi : sample.labelEn}
                </Button>
              ))}
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t.phishing.urlLabel}
                </label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={t.phishing.urlPlaceholder}
                  className="font-mono text-xs sm:text-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t.phishing.textLabel}
                </label>
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t.phishing.textPlaceholder}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={(!urlInput.trim() && !messageInput.trim()) || checkingIntel}
                >
                  {checkingIntel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FishOff className="h-4 w-4" />
                  )}
                  {t.common.runScan}
                </Button>
                {(urlInput || messageInput || result) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setUrlInput("");
                      setMessageInput("");
                      setResult(null);
                      setThreatIntel(null);
                    }}
                  >
                    {t.common.clear}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Heuristic Risk Category & Score Gauge */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-sm">{t.phishing.riskCategoryTitle}</CardTitle>
              <Badge variant={riskBadgeVariant}>
                {result ? t.phishing.riskLabels[result.riskLevel] : t.common.status}
              </Badge>
            </div>
            <CardDescription>{t.phishing.heuristicBadge}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 flex flex-col items-center justify-center text-center gap-4">
            <ScoreRing
              value={result ? result.riskScore : 0}
              size={146}
              tone={riskTone}
              label={result ? `${result.riskScore}` : "—"}
              sublabel={
                result ? t.phishing.riskLabels[result.riskLevel] : t.common.status
              }
            />

            {result && !result.isValidUrlSyntax && (
              <div
                role="alert"
                className="w-full rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive text-left"
              >
                {language === "hi" ? result.syntaxErrorHi : result.syntaxErrorEn}
              </div>
            )}

            {/* Strictly inert non-clickable URL Anatomy */}
            {result?.urlAnatomy && (
              <div className="w-full rounded-xl border border-border/80 bg-secondary/40 p-3 text-xs space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <Globe className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{t.phishing.anatomyTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div className="rounded bg-background/60 px-2 py-1">
                    <span className="text-muted-foreground">
                      {t.phishing.anatomyProtocol}:{" "}
                    </span>
                    <span className="font-bold">{result.urlAnatomy.protocol}</span>
                  </div>
                  <div className="rounded bg-background/60 px-2 py-1">
                    <span className="text-muted-foreground">
                      {t.phishing.anatomyRoot}:{" "}
                    </span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 break-all">
                      {result.urlAnatomy.rootDomain}
                    </span>
                  </div>
                  <div className="rounded bg-background/60 px-2 py-1 col-span-2">
                    <span className="text-muted-foreground">
                      {t.phishing.anatomySubdomains}:{" "}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 break-all">
                      {result.urlAnatomy.subdomains || t.phishing.anatomyNone}
                    </span>
                  </div>
                  <div className="rounded bg-background/60 px-2 py-1 col-span-2 truncate">
                    <span className="text-muted-foreground">
                      {t.phishing.anatomyPath}:{" "}
                    </span>
                    <span>{result.urlAnatomy.pathAndQuery || "/"}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clearly Distinguished: 1) Heuristic Detection Matrix  2) Verified Threat Intelligence */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle className="text-base">{t.phishing.detectionMatrixTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {inspectionChecks.map((chk) => (
                <div
                  key={chk.label}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold",
                    chk.flagged
                      ? "border-amber-500/45 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <span>{chk.label}</span>
                  <span className="flex items-center gap-1 font-mono">
                    {chk.flagged ? (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        {chk.warnText}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {chk.okText}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 border-sky-500/30">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Radar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  {t.phishing.threatIntelTitle}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {t.phishing.apiLookupBadge}
                </Badge>
              </div>
              <CardDescription>{t.phishing.threatIntelSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkingIntel ? (
                <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.phishing.threatCheckingMsg}</span>
                </div>
              ) : !result.isValidUrlSyntax ? (
                <p className="text-xs text-muted-foreground">
                  {t.phishing.threatSkippedMsg}
                </p>
              ) : threatIntel ? (
                <div
                  className={cn(
                    "rounded-xl border p-3.5 space-y-2 text-xs",
                    threatIntel.status === "flagged"
                      ? "border-destructive/45 bg-destructive/10"
                      : threatIntel.status === "safe"
                      ? "border-emerald-500/35 bg-emerald-500/10"
                      : "border-amber-500/35 bg-amber-500/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold flex items-center gap-1.5">
                      {threatIntel.status === "flagged" ? (
                        <AlertOctagon className="h-4 w-4 text-destructive" />
                      ) : threatIntel.status === "safe" ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                      {threatIntel.providerName}
                    </span>
                    <Badge
                      variant={
                        threatIntel.status === "flagged"
                          ? "destructive"
                          : threatIntel.status === "safe"
                          ? "emerald"
                          : "amber"
                      }
                      className="uppercase text-[10px]"
                    >
                      {threatIntel.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {language === "hi" ? threatIntel.noteHi : threatIntel.noteEn}
                  </p>
                  {threatIntel.matches.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {threatIntel.matches.map((m, idx) => (
                        <Badge key={idx} variant="destructive" className="text-[10px]">
                          {m.threatType}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t.phishing.threatEmptyMsg}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indicators & Defensive Advice */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                {t.phishing.indicatorsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.indicators.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>{t.phishing.noIndicators}</span>
                </div>
              ) : (
                result.indicators.map((ind) => (
                  <div
                    key={ind.id}
                    className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {language === "hi" ? ind.titleHi : ind.titleEn}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {ind.category}
                        </Badge>
                        <Badge
                          variant={
                            ind.severity === "high"
                              ? "destructive"
                              : ind.severity === "medium"
                              ? "amber"
                              : "secondary"
                          }
                        >
                          +{ind.weight}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {language === "hi" ? ind.detailHi : ind.detailEn}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t.phishing.adviceTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {(language === "hi" ? result.adviceHi : result.adviceEn).map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
