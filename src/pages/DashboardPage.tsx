import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FishOff,
  FlaskConical,
  KeyRound,
  Lightbulb,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/common/ScoreRing";
import { StatCard } from "@/components/common/StatCard";
import { DemoBadge } from "@/components/common/DemoBadge";
import { NAV_ITEMS } from "@/components/layout/navConfig";
import { DAILY_SECURITY_TIPS } from "@/data/demoData";
import { cn } from "@/lib/utils";

export const DashboardPage: React.FC = () => {
  const {
    t,
    language,
    settings,
    metrics,
    hygiene,
    activities,
    postureScore,
    demoPreviewActive,
    loadDemoPreview,
    clearDemoPreview,
  } = useApp();

  const [tipIndex, setTipIndex] = useState(0);
  const activeTip = DAILY_SECURITY_TIPS[tipIndex];
  const hygieneDone = hygiene.filter((h) => h.completed).length;

  const quickActions = [
    {
      path: "/analyzer",
      title: t.nav.analyzer,
      desc:
        language === "hi"
          ? "पासवर्ड की एंट्रॉपी और क्रैक-समय जांचें"
          : "Audit entropy, patterns & crack resistance",
      icon: ShieldAlert,
      accent: "from-sky-500/20 to-cyan-500/5 border-sky-500/30 text-sky-400",
    },
    {
      path: "/generator",
      title: t.nav.generator,
      desc:
        language === "hi"
          ? "मजबूत CSPRNG पासवर्ड या पासफ़्रेज़ बनाएं"
          : "Generate CSPRNG passwords & passphrases",
      icon: KeyRound,
      accent: "from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-400",
    },
    {
      path: "/breach-checker",
      title: t.nav.breach,
      desc:
        language === "hi"
          ? "k-Anonymity द्वारा पासवर्ड लीक जांचें"
          : "Check exposure safely with k-Anonymity",
      icon: Radar,
      accent: "from-cyan-500/20 to-blue-500/5 border-cyan-500/30 text-cyan-400",
    },
    {
      path: "/phishing-detector",
      title: t.nav.phishing,
      desc:
        language === "hi"
          ? "संदिग्ध लिंक और ईमेल टेक्स्ट स्कैन करें"
          : "Inspect suspicious URLs & scam messages",
      icon: FishOff,
      accent: "from-amber-500/20 to-orange-500/5 border-amber-500/30 text-amber-400",
    },
  ];

  const featureCards = NAV_ITEMS.filter((i) => i.id !== "dashboard");

  return (
    <div className="space-y-6 animate-fade-up">
      {/* 1. Welcome Section & Security Posture Hero */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-8 relative overflow-hidden border-sky-500/25">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  <Sparkles className="h-3 w-3" />
                  {t.brand.name} Intelligence
                </Badge>
                <Badge variant="emerald">{t.common.liveLocal}</Badge>
                {demoPreviewActive && <DemoBadge />}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.dashboard.welcomeTitle}{" "}
                <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                  {settings.displayName}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {t.dashboard.welcomeSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/70">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <FlaskConical className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>{t.dashboard.loadDemoBanner}</span>
              </p>
              <div className="flex items-center gap-2">
                {!demoPreviewActive ? (
                  <Button variant="outline" size="sm" onClick={loadDemoPreview}>
                    {t.dashboard.previewDemoBtn}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={clearDemoPreview}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    {t.dashboard.clearDemoBtn}
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link to="/security-report">
                    {t.nav.report}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Overview Ring Card */}
        <Card className="xl:col-span-4 border-emerald-500/25">
          <CardContent className="p-6 flex flex-col sm:flex-row xl:flex-col items-center justify-between gap-5 h-full text-center sm:text-left xl:text-center">
            <div className="space-y-1">
              <CardTitle className="flex items-center justify-center sm:justify-start xl:justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                {t.dashboard.postureTitle}
              </CardTitle>
              <CardDescription>{t.dashboard.postureSubtitle}</CardDescription>
            </div>

            <ScoreRing
              value={postureScore}
              size={140}
              label={`${postureScore}%`}
              sublabel={`${metrics.xp} ${t.common.xp}`}
            />

            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.dashboard.stats.hygieneCompleted}</span>
                <span className="font-mono font-semibold text-foreground">
                  {hygieneDone}/{hygiene.length}
                </span>
              </div>
              <Progress value={(hygieneDone / hygiene.length) * 100} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Security Overview KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.stats.passwordsAudited}
          value={metrics.passwordsAudited}
          hint={
            language === "hi"
              ? "केवल स्थानीय मीट्रिक सहेजा गया"
              : "Zero-plaintext local counter"
          }
          icon={ShieldAlert}
          accent="blue"
          badge={demoPreviewActive ? <DemoBadge /> : undefined}
        />
        <StatCard
          title={t.dashboard.stats.bestEntropy}
          value={`${Math.round(metrics.bestEntropySeen)} bits`}
          hint={language === "hi" ? "लक्ष्य: 80+ बिट्स" : "Target: 80+ bits"}
          icon={Cpu}
          accent="emerald"
        />
        <StatCard
          title={t.dashboard.stats.threatsFlagged}
          value={metrics.threatsFlagged}
          hint={
            language === "hi"
              ? "ब्रीच और फ़िशिंग जांच से"
              : "From breach & phishing scans"
          }
          icon={FishOff}
          accent="amber"
        />
        <StatCard
          title={t.dashboard.stats.hygieneCompleted}
          value={`${hygieneDone}/${hygiene.length}`}
          hint={
            language === "hi"
              ? `${metrics.quizzesCompleted} क्विज़ पूरे हुए`
              : `${metrics.quizzesCompleted} quiz session(s) completed`
          }
          icon={CheckCircle2}
          accent="emerald"
        />
      </section>

      {/* 3. Quick Action Cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight">{t.dashboard.quickActionsTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path} className="group">
                <Card className="h-full hover:border-primary/50 hover:-translate-y-0.5 transition-all">
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div
                      className={cn(
                        "h-11 w-11 rounded-xl border bg-gradient-to-br flex items-center justify-center",
                        action.accent
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Recent Learning Activity + Security Tips */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500" />
                {t.dashboard.recentActivityTitle}
              </CardTitle>
            </div>
            {activities.some((a) => a.isDemo) && <DemoBadge />}
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t.dashboard.emptyActivity}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {activities.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-secondary/30 px-3.5 py-2.5"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {language === "hi" ? item.titleHi : item.titleEn}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.isDemo && <DemoBadge />}
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {item.meta}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips Card */}
        <Card className="lg:col-span-5 flex flex-col justify-between border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                {t.dashboard.securityTipsTitle}
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {tipIndex + 1}/{DAILY_SECURITY_TIPS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 space-y-2">
              <Badge variant="emerald" className="text-[10px]">
                {language === "hi" ? activeTip.categoryHi : activeTip.categoryEn}
              </Badge>
              <h3 className="text-sm font-bold leading-snug">
                {language === "hi" ? activeTip.titleHi : activeTip.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {language === "hi" ? activeTip.bodyHi : activeTip.bodyEn}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex gap-1.5">
                {DAILY_SECURITY_TIPS.map((tip, idx) => (
                  <button
                    key={tip.id}
                    type="button"
                    aria-label={`Tip ${idx + 1}`}
                    onClick={() => setTipIndex(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      idx === tipIndex ? "w-6 bg-emerald-500" : "w-2 bg-border"
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTipIndex((i) => (i + 1) % DAILY_SECURITY_TIPS.length)}
              >
                {t.dashboard.nextTip}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Feature Navigation Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight">{t.dashboard.featureNavTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.path} className="group">
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Icon className={cn("h-5 w-5", item.accentColor)} />
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">
                        {t.nav[item.labelKey]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {language === "hi" ? item.descHi : item.descEn}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
