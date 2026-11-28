import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Eraser,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  generateCryptoPassword,
  generateMultiplePassphrases,
  generateMultiplePasswords,
  generatePassphrase,
  InvalidGeneratorConfigError,
  MAX_PASSPHRASE_WORDS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSPHRASE_WORDS,
  MIN_PASSWORD_LENGTH,
  validatePassphraseGenOptions,
  validatePasswordGenOptions,
  type PassphraseGenOptions,
  type PasswordGenOptions,
} from "@/lib/security/passwordGenerator";
import { analyzePassword } from "@/lib/security/passwordAnalyzer";
import { PageHeader } from "@/components/common/PageHeader";
import { CopyButton } from "@/components/common/CopyButton";
import { ScoreRing } from "@/components/common/ScoreRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const LENGTH_PRESETS = [12, 16, 24, 32, 64];
const BATCH_COUNTS = [1, 3, 5, 8, 12];

export const PasswordGeneratorPage: React.FC = () => {
  const { t, settings, recordPasswordGenerated, setGeneratorContext } = useApp();
  const [mode, setMode] = useState<"random" | "passphrase">("random");
  const [batchCount, setBatchCount] = useState<number>(5);

  const [pwOpts, setPwOpts] = useState<PasswordGenOptions>({
    length: 18,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const [phraseOpts, setPhraseOpts] = useState<PassphraseGenOptions>({
    wordCount: 5,
    separator: "-",
    capitalize: false,
    includeNumber: true,
  });

  const [primarySecret, setPrimarySecret] = useState("");
  const [batchSecrets, setBatchSecrets] = useState<string[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [clipboardTimer, setClipboardTimer] = useState<number | null>(null);

  // Clear generated secrets from memory when leaving the generator
  useEffect(() => {
    return () => {
      setPrimarySecret("");
      setBatchSecrets([]);
      setGeneratorContext(undefined);
    };
  }, [setGeneratorContext]);

  useEffect(() => {
    const enabledCount = [
      pwOpts.uppercase,
      pwOpts.lowercase,
      pwOpts.numbers,
      pwOpts.symbols,
    ].filter(Boolean).length;
    setGeneratorContext({
      mode,
      lengthOrWords: mode === "random" ? pwOpts.length : phraseOpts.wordCount,
      enabledCharsetsCount: mode === "random" ? enabledCount : 4,
      excludeAmbiguous: pwOpts.excludeAmbiguous,
    });
  }, [mode, pwOpts, phraseOpts.wordCount, setGeneratorContext]);

  const validationError = useMemo(() => {
    try {
      if (mode === "random") {
        validatePasswordGenOptions(pwOpts);
      } else {
        validatePassphraseGenOptions(phraseOpts);
      }
      return null;
    } catch (err) {
      if (err instanceof InvalidGeneratorConfigError) {
        if (err.code === "NO_CHARSETS_ENABLED") return t.generator.invalidNoCharset;
        if (err.code === "INVALID_LENGTH") return t.generator.invalidLength;
        return err.message;
      }
      return t.generator.invalidNoCharset;
    }
  }, [mode, pwOpts, phraseOpts, t.generator.invalidNoCharset, t.generator.invalidLength]);

  const regenerate = useCallback(
    (trackMetric = false) => {
      if (validationError) {
        setConfigError(validationError);
        setPrimarySecret("");
        setBatchSecrets([]);
        return;
      }

      try {
        const nextPrimary =
          mode === "random"
            ? generateCryptoPassword(pwOpts)
            : generatePassphrase(phraseOpts);
        const extraCount = Math.max(0, batchCount - 1);
        const extras =
          extraCount > 0
            ? mode === "random"
              ? generateMultiplePasswords(pwOpts, extraCount)
              : generateMultiplePassphrases(phraseOpts, extraCount)
            : [];

        setConfigError(null);
        setPrimarySecret(nextPrimary);
        setBatchSecrets([nextPrimary, ...extras]);

        if (trackMetric) {
          const evalRes = analyzePassword(nextPrimary);
          // Only numeric entropy bits are recorded—generated password is never stored
          recordPasswordGenerated(evalRes.effectiveEntropyBits);
        }
      } catch (err) {
        setPrimarySecret("");
        setBatchSecrets([]);
        setConfigError(
          err instanceof Error ? err.message : t.generator.invalidNoCharset
        );
      }
    },
    [
      validationError,
      mode,
      pwOpts,
      phraseOpts,
      batchCount,
      recordPasswordGenerated,
      t.generator.invalidNoCharset,
    ]
  );

  useEffect(() => {
    regenerate(false);
  }, [regenerate]);

  useEffect(() => {
    if (clipboardTimer === null || clipboardTimer <= 0) return;
    const timer = setInterval(() => {
      setClipboardTimer((prev) => {
        if (prev === null || prev <= 1) {
          navigator.clipboard?.writeText("").catch(() => {});
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [clipboardTimer]);

  const analysis = useMemo(() => analyzePassword(primarySecret), [primarySecret]);

  const handleCopied = () => {
    if (settings.clipboardAutoClearSeconds > 0) {
      setClipboardTimer(settings.clipboardAutoClearSeconds);
    }
  };

  const handleLengthInput = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setPwOpts((o) => ({ ...o, length: 0 }));
      return;
    }
    setPwOpts((o) => ({ ...o, length: parsed }));
  };

  const strengthTone =
    analysis.level === "very-strong"
      ? "emerald"
      : analysis.level === "strong"
      ? "blue"
      : analysis.level === "fair"
      ? "amber"
      : "red";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title={t.generator.title}
        subtitle={t.generator.subtitle}
        badge={
          <Badge variant="emerald">
            <KeyRound className="h-3 w-3" />
            crypto.getRandomValues()
          </Badge>
        }
      />

      {/* Zero-Storage Privacy Guarantee */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
          <Lock className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
          <span>{t.generator.privacyNotice}</span>
        </div>
        <Badge variant="emerald" className="shrink-0 self-start sm:self-center font-mono text-[10px]">
          {t.generator.privacyPill}
        </Badge>
      </div>

      {/* Primary Output + Live Strength Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-8 border-sky-500/30">
          <CardContent className="p-6 space-y-4">
            {configError ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/45 bg-destructive/10 p-4 flex items-start gap-3 text-sm text-destructive"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{configError}</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/80 p-4">
                <code
                  data-testid="generated-password-output"
                  className="font-mono text-base sm:text-xl font-bold tracking-wide break-all text-sky-400"
                >
                  {primarySecret}
                </code>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton
                    value={primarySecret}
                    onCopied={handleCopied}
                    size="default"
                    disabled={!primarySecret}
                  />
                  <Button
                    type="button"
                    onClick={() => regenerate(true)}
                    disabled={Boolean(validationError)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t.generator.generateBtn}
                  </Button>
                  {primarySecret && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPrimarySecret("");
                        setBatchSecrets([]);
                      }}
                      title={t.generator.clearBtn}
                      aria-label={t.generator.clearBtn}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                <Badge
                  variant={analysis.level === "very-strong" ? "emerald" : "default"}
                  className="shrink-0"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {t.analyzer.levels[analysis.level]} ({analysis.score}/100)
                </Badge>
                <Progress value={analysis.score} className="max-w-xs" />
              </div>

              <div className="text-muted-foreground flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-sky-400" />
                <span>
                  {t.generator.clipboardNote}{" "}
                  <strong className="font-mono text-foreground">
                    {clipboardTimer !== null
                      ? `${clipboardTimer}s`
                      : `${settings.clipboardAutoClearSeconds}s`}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strength Analysis Summary Card */}
        <Card className="xl:col-span-4 border-emerald-500/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t.generator.strengthTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ScoreRing
              value={analysis.score}
              size={108}
              strokeWidth={8}
              tone={strengthTone}
              label={`${analysis.score}`}
              sublabel={t.analyzer.levels[analysis.level]}
            />
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.analyzer.entropyLabel}:</span>
                <span className="font-mono font-bold text-sky-400">
                  {analysis.entropyBits} bits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.analyzer.shannonEntropyLabel}:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {analysis.shannonEntropyBits} bits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.analyzer.zxcvbnScoreLabel}:</span>
                <span className="font-mono font-bold">{analysis.zxcvbnScore}/4</span>
              </div>
              <div className="pt-1 border-t border-border/60 flex items-center justify-between gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t.generator.offlineCrackLabel}:
                </span>
                <span className="font-mono font-bold text-sky-400 text-right">
                  {analysis.crackTimes.offlineBcrypt}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration & Multiple Generated Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardContent className="p-6">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "random" | "passphrase")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="random">{t.generator.modeRandom}</TabsTrigger>
                <TabsTrigger value="passphrase">{t.generator.modePassphrase}</TabsTrigger>
              </TabsList>

              <TabsContent value="random" className="space-y-5 pt-2">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">{t.generator.length}</span>
                    <div className="flex items-center gap-2">
                      {LENGTH_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          size="sm"
                          variant={pwOpts.length === preset ? "default" : "outline"}
                          className="h-7 px-2.5 text-xs font-mono"
                          onClick={() => setPwOpts((o) => ({ ...o, length: preset }))}
                        >
                          {preset}
                        </Button>
                      ))}
                      <Input
                        type="number"
                        min={MIN_PASSWORD_LENGTH}
                        max={MAX_PASSWORD_LENGTH}
                        value={pwOpts.length || ""}
                        onChange={(e) => handleLengthInput(e.target.value)}
                        className="w-20 h-8 font-mono text-center"
                        aria-label={t.generator.length}
                      />
                    </div>
                  </div>
                  <Slider
                    min={MIN_PASSWORD_LENGTH}
                    max={MAX_PASSWORD_LENGTH}
                    step={1}
                    value={[
                      Math.min(
                        MAX_PASSWORD_LENGTH,
                        Math.max(MIN_PASSWORD_LENGTH, pwOpts.length || MIN_PASSWORD_LENGTH)
                      ),
                    ]}
                    onValueChange={([v]) => setPwOpts((o) => ({ ...o, length: v }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "uppercase", label: t.generator.uppercase },
                    { key: "lowercase", label: t.generator.lowercase },
                    { key: "numbers", label: t.generator.numbers },
                    { key: "symbols", label: t.generator.symbols },
                    { key: "excludeAmbiguous", label: t.generator.excludeAmbiguous },
                  ].map((item) => {
                    const checked = pwOpts[item.key as keyof PasswordGenOptions] as boolean;
                    return (
                      <label
                        key={item.key}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/35 px-3.5 py-3 cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                        <Switch
                          checked={checked}
                          onCheckedChange={(val) =>
                            setPwOpts((o) => ({ ...o, [item.key]: val }))
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="passphrase" className="space-y-5 pt-2">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{t.generator.wordCount}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {phraseOpts.wordCount}
                    </span>
                  </div>
                  <Slider
                    min={MIN_PASSPHRASE_WORDS}
                    max={MAX_PASSPHRASE_WORDS}
                    step={1}
                    value={[phraseOpts.wordCount]}
                    onValueChange={([v]) =>
                      setPhraseOpts((o) => ({ ...o, wordCount: v }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-semibold">{t.generator.separator}</span>
                  <div className="flex flex-wrap gap-2">
                    {(["-", "_", ".", " "] as const).map((sep) => (
                      <Button
                        key={sep}
                        type="button"
                        size="sm"
                        variant={phraseOpts.separator === sep ? "default" : "outline"}
                        onClick={() => setPhraseOpts((o) => ({ ...o, separator: sep }))}
                      >
                        {sep === " " ? t.generator.spaceSeparator : `"${sep}"`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/35 px-3.5 py-3 cursor-pointer">
                    <span className="text-sm font-medium">{t.generator.capitalizeWords}</span>
                    <Switch
                      checked={phraseOpts.capitalize}
                      onCheckedChange={(val) =>
                        setPhraseOpts((o) => ({ ...o, capitalize: val }))
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/35 px-3.5 py-3 cursor-pointer">
                    <span className="text-sm font-medium">{t.generator.appendNumber}</span>
                    <Switch
                      checked={phraseOpts.includeNumber}
                      onCheckedChange={(val) =>
                        setPhraseOpts((o) => ({ ...o, includeNumber: val }))
                      }
                    />
                  </label>
                </div>
              </TabsContent>
            </Tabs>

            {/* Batch Count Selector */}
            <div className="mt-5 pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t.generator.batchCountLabel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BATCH_COUNTS.map((cnt) => (
                  <Button
                    key={cnt}
                    type="button"
                    size="sm"
                    variant={batchCount === cnt ? "default" : "outline"}
                    className="h-8 px-3 font-mono"
                    onClick={() => setBatchCount(cnt)}
                  >
                    {cnt}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Generated Candidates */}
        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t.generator.batchTitle}</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {batchSecrets.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2.5 max-h-[380px] overflow-y-auto">
            {batchSecrets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                {configError ?? t.generator.invalidNoCharset}
              </p>
            ) : (
              batchSecrets.map((secret, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-secondary/35 px-3.5 py-2.5"
                >
                  <code className="font-mono text-xs sm:text-sm truncate">{secret}</code>
                  <CopyButton value={secret} onCopied={handleCopied} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
