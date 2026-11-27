import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lightbulb,
  RefreshCw,
  Ruler,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { buildPasswordImprovementPlan } from "@/lib/security/passwordImprovement";
import type { PasswordAnalysisResult } from "@/types/security";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/CopyButton";
import { cn } from "@/lib/utils";

interface PasswordImprovementPanelProps {
  analysis: PasswordAnalysisResult;
  breachExposed?: boolean;
  breachCount?: number;
}

export const PasswordImprovementPanel: React.FC<PasswordImprovementPanelProps> = ({
  analysis,
  breachExposed,
  breachCount,
}) => {
  const { t, language } = useApp();
  const [refreshTick, setRefreshTick] = useState(0);

  const plan = useMemo(
    () => buildPasswordImprovementPlan(analysis, { breachExposed, breachCount }),
    // refreshTick intentionally regenerates CSPRNG passphrase ideas on demand
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analysis, breachExposed, breachCount, refreshTick]
  );

  const weakTraits =
    language === "hi" ? plan.weakCharacteristicsHi : plan.weakCharacteristicsEn;

  return (
    <Card className="border-sky-500/25">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              {t.improvement.title}
            </CardTitle>
            <CardDescription className="mt-1">{t.improvement.subtitle}</CardDescription>
          </div>
          <Badge variant="default" className="text-[10px]">
            Actionable Guidance
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Weak characteristics + Length Strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {t.improvement.weakTraitsTitle}
            </p>
            {weakTraits.length === 0 ? (
              <p className="text-xs sm:text-sm text-emerald-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {t.improvement.noWeakTraits}
              </p>
            ) : (
              <ul className="space-y-1.5 text-xs sm:text-sm">
                {weakTraits.map((trait, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" />
              {t.improvement.lengthGuidanceTitle}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {language === "hi"
                ? plan.lengthRecommendationHi
                : plan.lengthRecommendationEn}
            </p>
          </div>
        </div>

        {/* Repeated & Sequential Pattern Explanations */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            {t.improvement.patternExplanationsTitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plan.patternExplanations.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border p-3.5 space-y-1.5",
                  item.detected
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-border/70 bg-secondary/25"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">
                    {language === "hi" ? item.titleHi : item.titleEn}
                  </span>
                  {item.detected && (
                    <Badge variant="amber" className="text-[10px]">
                      Detected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === "hi" ? item.explanationHi : item.explanationEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Unique Memorable Passphrases */}
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              {t.improvement.passphraseSuggestionsTitle}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setRefreshTick((v) => v + 1)}
            >
              <RefreshCw className="h-3 w-3" />
              {t.improvement.refreshPassphrases}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {plan.passphraseSuggestions.map((phrase, idx) => (
              <div
                key={`${refreshTick}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/70 px-3 py-2"
              >
                <code className="font-mono text-xs sm:text-sm truncate text-emerald-400">
                  {phrase}
                </code>
                <CopyButton value={phrase} />
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Step-by-Step Remediation Plan */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.improvement.actionStepsTitle}
          </p>
          <div className="space-y-2">
            {plan.actionableSteps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/75 bg-secondary/30 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary/15 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">
                      {language === "hi" ? step.titleHi : step.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {language === "hi" ? step.detailHi : step.detailEn}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    step.priority === "high"
                      ? "destructive"
                      : step.priority === "medium"
                      ? "amber"
                      : "secondary"
                  }
                  className="uppercase text-[10px] shrink-0"
                >
                  {step.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
