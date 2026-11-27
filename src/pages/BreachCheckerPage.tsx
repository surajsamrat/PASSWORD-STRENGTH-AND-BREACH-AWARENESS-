import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Eraser,
  Eye,
  EyeOff,
  FlaskConical,
  Loader2,
  Lock,
  Mail,
  Radar,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { checkPasswordBreachKAnonymity } from "@/lib/security/breachChecker";
import { DEMO_EMAIL_BREACH_PROFILES } from "@/data/demoData";
import type { DemoEmailBreach, PasswordBreachResult } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { DemoBadge } from "@/components/common/DemoBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const IDLE_RESULT: PasswordBreachResult = {
  status: "idle",
  prefix: "",
  count: 0,
};

export const BreachCheckerPage: React.FC = () => {
  const { t, language, recordBreachCheck, updateSessionBreachStatus } = useApp();

  // Password k-Anonymity state (held in memory only, cleared on unmount)
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwResult, setPwResult] = useState<PasswordBreachResult>(IDLE_RESULT);

  // Demo Email Awareness state
  const [emailInput, setEmailInput] = useState("demo@securecheck.local");
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const [emailBreaches, setEmailBreaches] = useState<DemoEmailBreach[] | null>(null);

  useEffect(() => {
    return () => {
      setPassword("");
      setShowPw(false);
      setPwResult(IDLE_RESULT);
    };
  }, []);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (pwResult.status !== "idle") {
      setPwResult(IDLE_RESULT);
    }
  };

  const handleClear = () => {
    setPassword("");
    setShowPw(false);
    setPwResult(IDLE_RESULT);
  };

  const handlePasswordCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || pwResult.status === "checking") return;
    setPwResult({ status: "checking", prefix: "", count: 0 });
    const res = await checkPasswordBreachKAnonymity(password);
    setPwResult(res);
    if (res.status === "pwned" || res.status === "clean") {
      updateSessionBreachStatus(res.status, res.count);
      recordBreachCheck(
        res.status === "pwned",
        res.status === "pwned"
          ? `k-Anonymity check: password found ${res.count.toLocaleString()} times`
          : "k-Anonymity check: password clean in HIBP",
        res.status === "pwned"
          ? `k-Anonymity जांच: पासवर्ड ${res.count.toLocaleString()} बार लीक मिला`
          : "k-Anonymity जांच: पासवर्ड लीक सूची में नहीं मिला"
      );
    }
  };

  const handleDemoEmailCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const key = emailInput.trim().toLowerCase();
    const matches = DEMO_EMAIL_BREACH_PROFILES[key] ?? [];
    setCheckedEmail(key);
    setEmailBreaches(matches);
  };

  const activeRecommendations =
    language === "hi" ? pwResult.recommendationsHi : pwResult.recommendationsEn;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.breach.title}
        subtitle={t.breach.subtitle}
        badge={
          <Badge variant="default">
            <Radar className="h-3 w-3" />
            k-Anonymity SHA-1
          </Badge>
        }
      />

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="password">{t.breach.tabPassword}</TabsTrigger>
          <TabsTrigger value="email">{t.breach.tabEmail}</TabsTrigger>
        </TabsList>

        {/* Live HIBP k-Anonymity Password Tab */}
        <TabsContent value="password" className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  {t.breach.pwInputLabel}
                </CardTitle>
                <Badge variant="emerald" className="font-mono text-[10px]">
                  5-Char Prefix Only • No Hash Storage
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-3.5 text-xs sm:text-sm text-sky-700 dark:text-sky-300">
                {t.breach.kAnonNotice}
              </div>

              <form onSubmit={handlePasswordCheck} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder={t.breach.pwPlaceholder}
                    className="pr-20 font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPw((s) => !s)}
                      className="h-8 w-8"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {password && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="h-8 w-8"
                        aria-label="Clear input"
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!password || pwResult.status === "checking"}
                  className="shrink-0"
                >
                  {pwResult.status === "checking" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Radar className="h-4 w-4" />
                  )}
                  {t.breach.checkPwBtn}
                </Button>
              </form>

              {pwResult.status === "checking" && (
                <div
                  aria-busy="true"
                  className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 flex items-center gap-3 text-sm text-sky-400"
                >
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                  <span>
                    {language === "hi"
                      ? "स्थानीय SHA-1 गणना हो रही है और केवल 5-अक्षर प्रीफ़िक्स से HIBP रेंज जांची जा रही है..."
                      : "Computing SHA-1 locally and querying HIBP range with 5-character prefix..."}
                  </span>
                </div>
              )}

              {pwResult.status === "pwned" && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-destructive font-bold">
                      <AlertOctagon className="h-5 w-5" />
                      <span>{t.breach.pwnedAlert}</span>
                    </div>
                    <Badge variant="destructive" className="font-mono">
                      {pwResult.count.toLocaleString()} occurrences
                    </Badge>
                  </div>

                  <p className="text-sm">
                    {language === "hi"
                      ? `यह पासवर्ड सार्वजनिक डेटा ब्रीच में ${pwResult.count.toLocaleString()} बार दिखाई दिया है। इसे तुरंत बदलें।`
                      : `This password has appeared ${pwResult.count.toLocaleString()} times in known public data breaches. Do not use it.`}
                  </p>

                  <p className="text-xs font-mono text-muted-foreground">
                    SHA-1 Prefix Sent: {pwResult.prefix} • Range Suffixes Checked:{" "}
                    {pwResult.rangeEntriesChecked ?? 0}
                    {pwResult.paddedEntriesIgnored
                      ? ` (${pwResult.paddedEntriesIgnored} zero-count padded entries ignored)`
                      : ""}
                  </p>

                  {activeRecommendations && (
                    <div className="pt-2 border-t border-destructive/25 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-destructive">
                        {language === "hi" ? "सुरक्षा सुझाव" : "Security Recommendations"}
                      </p>
                      <ul className="space-y-1.5 text-xs sm:text-sm">
                        {activeRecommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ShieldCheck className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-1 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="emerald">
                          <Link to="/generator">
                            {t.nav.generator}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {pwResult.status === "clean" && (
                <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{t.breach.cleanAlert}</span>
                    </div>
                    <Badge variant="emerald" className="font-mono">
                      0 occurrences
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {language === "hi"
                      ? "वर्तमान HIBP डेटाबेस में इस हैश का कोई मिलान नहीं मिला। फिर भी उच्च एंट्रॉपी बनाए रखें।"
                      : "No matching SHA-1 suffix was found in the Have I Been Pwned password corpus. Keep it unique per account."}
                  </p>

                  <p className="text-xs font-mono text-muted-foreground">
                    SHA-1 Prefix Sent: {pwResult.prefix} • Range Suffixes Checked:{" "}
                    {pwResult.rangeEntriesChecked ?? 0}
                    {pwResult.paddedEntriesIgnored
                      ? ` (${pwResult.paddedEntriesIgnored} zero-count padded entries ignored)`
                      : ""}
                  </p>

                  {activeRecommendations && (
                    <div className="pt-2 border-t border-emerald-500/25 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        {language === "hi" ? "सुरक्षा सुझाव" : "Security Recommendations"}
                      </p>
                      <ul className="space-y-1.5 text-xs sm:text-sm">
                        {activeRecommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-1 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/analyzer">
                            {t.nav.analyzer}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {pwResult.status === "error" && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-amber-500 font-bold">
                    <WifiOff className="h-5 w-5" />
                    <span>
                      {language === "hi"
                        ? "लाइव API जांच विफल रही"
                        : "Live API Request Failed"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {pwResult.errorMessage} — SecureCheck does not fake a "clean" response when the network is unreachable or returns an invalid payload.
                  </p>
                  {pwResult.prefix && (
                    <p className="text-xs font-mono text-muted-foreground">
                      Computed Local SHA-1 Prefix: {pwResult.prefix}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clearly Marked Demo Email Breach Tab */}
        <TabsContent value="email" className="space-y-5">
          <Card className="border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                {t.breach.emailInputLabel}
              </CardTitle>
              <DemoBadge />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs sm:text-sm flex items-start gap-2.5">
                <FlaskConical className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{t.breach.emailDemoNotice}</span>
              </div>

              <form onSubmit={handleDemoEmailCheck} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="demo@securecheck.local"
                />
                <Button type="submit" variant="outline" className="shrink-0">
                  {t.breach.checkEmailBtn}
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-muted-foreground self-center">Demo profiles:</span>
                {Object.keys(DEMO_EMAIL_BREACH_PROFILES).map((sampleEmail) => (
                  <Button
                    key={sampleEmail}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEmailInput(sampleEmail);
                      setCheckedEmail(sampleEmail);
                      setEmailBreaches(DEMO_EMAIL_BREACH_PROFILES[sampleEmail]);
                    }}
                  >
                    {sampleEmail}
                  </Button>
                ))}
              </div>

              {emailBreaches !== null && checkedEmail && (
                <div className="space-y-3 pt-2">
                  {emailBreaches.length === 0 ? (
                    <div className="rounded-xl border border-border/80 bg-secondary/40 p-4 text-sm text-muted-foreground">
                      No simulated demo records exist for{" "}
                      <strong className="font-mono">{checkedEmail}</strong>. Select one of
                      the Demo profiles above to inspect sample breach telemetry.
                    </div>
                  ) : (
                    emailBreaches.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl border border-border/80 bg-secondary/35 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{b.breachName}</span>
                            <DemoBadge />
                          </div>
                          <Badge variant={b.severity === "high" ? "destructive" : "amber"}>
                            {b.breachDate} • {b.pwnCountLabel}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {language === "hi" ? b.descriptionHi : b.descriptionEn}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {b.dataClasses.map((dc) => (
                            <Badge key={dc} variant="outline" className="text-[10px]">
                              {dc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
