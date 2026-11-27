import React from "react";
import { FlaskConical, Medal, Trophy } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { DEMO_LEADERBOARD_PEERS } from "@/data/demoData";
import type { DemoLeaderboardEntry } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { DemoBadge } from "@/components/common/DemoBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const LeaderboardPage: React.FC = () => {
  const { t, settings, metrics } = useApp();

  const userAccuracy =
    metrics.quizTotalAnswered > 0
      ? Math.round((metrics.quizCorrectAnswers / metrics.quizTotalAnswered) * 100)
      : 0;

  const userEntry: DemoLeaderboardEntry = {
    id: "local-current-user",
    name: settings.displayName,
    role: settings.roleTitle,
    xp: metrics.xp,
    quizzesCompleted: metrics.quizzesCompleted,
    accuracy: userAccuracy,
    streak: metrics.bestQuizStreak,
    isCurrentUser: true,
    isDemo: false,
  };

  const ranked = [...DEMO_LEADERBOARD_PEERS, userEntry].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.leaderboard.title}
        subtitle={t.leaderboard.subtitle}
        badge={<DemoBadge />}
      />

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs sm:text-sm flex items-start gap-2.5">
        <FlaskConical className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <span>{t.leaderboard.demoBanner}</span>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">{t.leaderboard.rank}</th>
                <th className="py-3.5 px-4">{t.leaderboard.learner}</th>
                <th className="py-3.5 px-4">{t.common.xp}</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">{t.leaderboard.accuracy}</th>
                <th className="py-3.5 px-4 hidden md:table-cell">{t.leaderboard.streak}</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row, idx) => {
                const rank = idx + 1;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/50 last:border-0 transition-colors",
                      row.isCurrentUser
                        ? "bg-sky-500/10"
                        : "hover:bg-secondary/35"
                    )}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        {rank <= 3 ? (
                          <Medal
                            className={cn(
                              "h-4 w-4",
                              rank === 1
                                ? "text-amber-400"
                                : rank === 2
                                ? "text-slate-300"
                                : "text-amber-700"
                            )}
                          />
                        ) : (
                          <span className="w-4 text-center text-muted-foreground">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm">{row.name}</span>
                        {row.isCurrentUser ? (
                          <Badge variant="emerald" className="text-[10px]">
                            YOU (Local)
                          </Badge>
                        ) : (
                          <DemoBadge label="DEMO" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{row.role}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 opacity-70" />
                        {row.xp}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-sm">
                      {row.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell font-mono text-sm">
                      {row.streak}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
