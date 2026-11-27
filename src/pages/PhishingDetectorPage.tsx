import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FishOff,
  Globe,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { analyzePhishingInput } from "@/lib/security/phishingAnalyzer";
import { PHISHING_SAMPLE_CASES } from "@/data/demoData";
import type { PhishingAnalysisResult } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { ScoreRing } from "@/components/common/ScoreRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PhishingDetectorPage: React.FC = () => {
  const { t, language, recordPhishingScan } = useApp();
  const [urlInput, setUrlInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [result, setResult] = useState<PhishingAnalysisResult | null>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() && !messageInput.trim()) return;
    const res = analyzePhishingInput({
      url: urlInput,
      messageText: messageInput,
    });
    setResult(res);
    recordPhishingScan(
      res.riskLevel === "suspicious" || res.riskLevel === "high-risk",
      res.riskScore
    );
  };

  const riskTone =
    !result || result.riskLevel === "safe"
      ? "emerald"
      : result.riskLevel === "caution"
      ? "blue"
      : result.riskLevel === "suspicious"
      ? "amber"
      : "red";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.phishing.title}
        subtitle={t.phishing.subtitle}
        badge={
          <Badge variant="amber">
            <FishOff className="h-3 w-3" />
            Heuristic Inspector
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-sky-500" />
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
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={!urlInput.trim() && !messageInput.trim()}
                >
                  <FishOff className="h-4 w-4" />
                  {t.common.runScan}
                </Button>
                {(urlInput || messageInput) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setUrlInput("");
                      setMessageInput("");
                      setResult(null);
                    }}
                  >
                    {t.common.clear}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Risk Gauge Output */}
        <Card className="lg:col-span-5">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 h-full">
            <ScoreRing
              value={result ? result.riskScore : 0}
              size={150}
              tone={riskTone}
              label={result ? `${result.riskScore}` : "—"}
              sublabel={
                result ? t.phishing.riskLabels[result.riskLevel] : t.common.status
              }
            />

            {result?.parsedHost && (
              <div className="w-full rounded-xl border border-border/80 bg-secondary/40 p-3 text-xs space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span>Parsed Host & Protocol</span>
                </div>
                <p className="font-mono font-bold break-all">
                  {result.parsedProtocol}://{result.parsedHost}
                </p>
              </div>
            )}

            {result && result.extractedUrls.length > 0 && (
              <div className="w-full text-left space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  URLs Inspected ({result.extractedUrls.length})
                </p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {result.extractedUrls.map((u) => (
                    <p
                      key={u}
                      className="text-[11px] font-mono truncate rounded bg-secondary/40 px-2 py-1"
                    >
                      {u}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Indicators & Defensive Advice */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {t.phishing.indicatorsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.indicators.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-500 flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>{t.phishing.noIndicators}</span>
                </div>
              ) : (
                result.indicators.map((ind) => (
                  <div
                    key={ind.id}
                    className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">
                        {language === "hi" ? ind.titleHi : ind.titleEn}
                      </span>
                      <Badge
                        variant={
                          ind.severity === "high"
                            ? "destructive"
                            : ind.severity === "medium"
                            ? "amber"
                            : "secondary"
                        }
                      >
                        +{ind.weight} risk
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
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
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {t.phishing.adviceTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {(language === "hi" ? result.adviceHi : result.adviceEn).map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/30 p-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
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
