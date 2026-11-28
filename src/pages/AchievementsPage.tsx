import React from "react";
import {
  Award,
  CheckCircle2,
  Cpu,
  FishOff,
  KeyRound,
  Languages,
  Lock,
  Radar,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { ACHIEVEMENTS } from "@/data/achievements";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Cpu,
  KeyRound,
  Radar,
  FishOff,
  Award,
  Languages,
};

export const AchievementsPage: React.FC = () => {
  const { t, language, metrics, hygiene } = useApp();
  const hygieneDoneCount = hygiene.filter((h) => h.completed).length;

  const evaluated = ACHIEVEMENTS.map((ach) => ({
    ach,
    state: ach.progress(metrics, hygieneDoneCount),
  }));
  const unlockedCount = evaluated.filter((e) => e.state.unlocked).length;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.achievements.title}
        subtitle={t.achievements.subtitle}
        badge={
          <Badge variant="emerald">
            <Award className="h-3 w-3" />
            {unlockedCount}/{ACHIEVEMENTS.length} {t.achievements.unlocked}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {evaluated.map(({ ach, state }) => {
          const Icon = ICON_MAP[ach.icon] || Award;
          const pct = Math.min(100, Math.round((state.current / state.target) * 100));

          return (
            <Card
              key={ach.id}
              className={cn(
                "transition-all",
                state.unlocked
                  ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                  : "opacity-90"
              )}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-xl border flex items-center justify-center shrink-0",
                      state.unlocked
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : "border-border bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {ach.tier}
                    </Badge>
                    <Badge variant={state.unlocked ? "emerald" : "secondary"}>
                      {state.unlocked ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          {t.achievements.unlocked}
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          {t.achievements.locked}
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm">
                    {language === "hi" ? ach.titleHi : ach.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {language === "hi" ? ach.descriptionHi : ach.descriptionEn}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-muted-foreground">
                      {state.current}/{state.target}
                    </span>
                    <span className="font-mono font-semibold text-sky-400">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
