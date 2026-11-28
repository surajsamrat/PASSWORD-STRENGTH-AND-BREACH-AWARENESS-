import React, { useState } from "react";
import {
  CheckCircle2,
  FlaskConical,
  Languages,
  Moon,
  Shield,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export const SettingsPage: React.FC = () => {
  const {
    t,
    theme,
    setTheme,
    language,
    setLanguage,
    settings,
    updateSettings,
    demoPreviewActive,
    loadDemoPreview,
    clearDemoPreview,
    resetAllData,
  } = useApp();

  const [displayName, setDisplayName] = useState(settings.displayName);
  const [roleTitle, setRoleTitle] = useState(settings.roleTitle);
  const [savedFlag, setSavedFlag] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      displayName: displayName.trim() || "Security Operator",
      roleTitle: roleTitle.trim() || "Cybersecurity Learner",
    });
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Appearance & Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              {t.settings.appearanceCard}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.settings.themeLabel}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4" />
                  {t.common.darkMode}
                </Button>
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4" />
                  {t.common.lightMode}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.common.language}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => setLanguage("en")}
                >
                  {t.common.english}
                </Button>
                <Button
                  type="button"
                  variant={language === "hi" ? "default" : "outline"}
                  onClick={() => setLanguage("hi")}
                >
                  {t.common.hindi}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operator Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {t.settings.profileCard}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t.settings.displayNameLabel}
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={32}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t.settings.roleTitleLabel}
                </label>
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit">{t.settings.saveProfile}</Button>
                {savedFlag && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t.settings.saved}
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy & Analyzer Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              {t.settings.privacyCard}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold">{t.settings.persistActivityTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {t.settings.persistActivityDesc}
                </p>
              </div>
              <Switch
                checked={settings.persistActivity}
                onCheckedChange={(v) => updateSettings({ persistActivity: v })}
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold">{t.settings.strictModeTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {t.settings.strictModeDesc}
                </p>
              </div>
              <Switch
                checked={settings.strictAnalyzerMode}
                onCheckedChange={(v) => updateSettings({ strictAnalyzerMode: v })}
              />
            </label>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{t.settings.clipboardTimerLabel}</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  {settings.clipboardAutoClearSeconds}s
                </span>
              </div>
              <Slider
                min={10}
                max={90}
                step={5}
                value={[settings.clipboardAutoClearSeconds]}
                onValueChange={([v]) =>
                  updateSettings({ clipboardAutoClearSeconds: v })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Demo & Data Reset */}
        <Card className="border-destructive/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {t.settings.dangerZone}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {!demoPreviewActive ? (
                <Button variant="outline" onClick={loadDemoPreview}>
                  {t.dashboard.previewDemoBtn}
                </Button>
              ) : (
                <Button variant="outline" onClick={clearDemoPreview}>
                  {t.dashboard.clearDemoBtn}
                </Button>
              )}

              <Button variant="destructive" onClick={resetAllData}>
                <Trash2 className="h-4 w-4" />
                {t.common.reset}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.settings.resetWarning}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
