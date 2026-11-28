import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Eraser,
  Languages,
  Loader2,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  WifiOff,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  AiAssistantClientError,
  buildNonSensitiveAssistantMetadata,
  fetchAssistantHealth,
  sendAssistantMessage,
  type AssistantHealthStatus,
} from "@/lib/security/aiAssistantClient";
import { generateLocalSecurityReply } from "@/lib/security/assistantEngine";
import type { Language } from "@/types/security";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sourceLabel?: string;
  tags?: string[];
}

function renderSafeFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="font-mono text-xs bg-background/70 px-1.5 py-0.5 rounded border border-border/70"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

const STARTER_PROMPTS = {
  en: [
    "Why do repeated characters and keyboard sequences weaken a password?",
    "Explain password entropy and how passphrases resist GPU cracking.",
    "How do I spot phishing links and fake KYC/OTP scams?",
    "Give me account security recommendations using Passkeys and MFA.",
  ],
  hi: [
    "दोहराए गए अक्षर और कीबोर्ड पैटर्न पासवर्ड को कमज़ोर क्यों बनाते हैं?",
    "पासवर्ड एंट्रॉपी क्या है और पासफ़्रेज़ अधिक सुरक्षित क्यों होते हैं?",
    "फ़िशिंग लिंक और नकली KYC/OTP स्कैम की पहचान कैसे करें?",
    "पासकी और MFA के साथ खाता सुरक्षा बढ़ाने के उपाय बताएं।",
  ],
};

export const AiAssistantPage: React.FC = () => {
  const { t, language, sessionSnapshot, hygiene } = useApp();

  const [aiLanguage, setAiLanguage] = useState<Language>(language);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<{
    message: string;
    code: string;
    lastQuery?: string;
  } | null>(null);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [health, setHealth] = useState<AssistantHealthStatus | null>(null);
  const [healthChecked, setHealthChecked] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Sync AI default language when user switches app language
  useEffect(() => {
    setAiLanguage(language);
  }, [language]);

  // Clear volatile chat history and draft input when leaving the page
  useEffect(() => {
    return () => {
      setMessages([]);
      setInput("");
      setErrorState(null);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchAssistantHealth().then((status) => {
      if (!active) return;
      setHealth(status);
      setHealthChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const nonSensitiveMetadata = useMemo(
    () => buildNonSensitiveAssistantMetadata(sessionSnapshot, hygiene),
    [sessionSnapshot, hygiene]
  );

  const resolveLocalizedError = (code: string, fallbackMessage: string): string => {
    const map = t.errors as Record<string, string>;
    return map[code] || fallbackMessage || t.errors.UNKNOWN_ERROR;
  };

  const handleUseOfflinePlaybook = (queryText: string) => {
    const reply = generateLocalSecurityReply(queryText, aiLanguage);
    setErrorState(null);
    setMessages((prev) => {
      const alreadyHasUser =
        prev.length > 0 &&
        prev[prev.length - 1].sender === "user" &&
        prev[prev.length - 1].text === queryText;
      const next = alreadyHasUser
        ? prev
        : [...prev, { id: `u-${Date.now()}`, sender: "user" as const, text: queryText }];
      return [
        ...next,
        {
          id: `b-${Date.now() + 1}`,
          sender: "assistant",
          text: reply.answer,
          sourceLabel: t.assistant.offlineBadge,
          tags: reply.tags,
        },
      ];
    });
  };

  const submitQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    setErrorState(null);

    const userTurn: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };
    const nextHistory = messages.map((m) => ({
      role: m.sender,
      content: m.text,
    }));

    setMessages((prev) => [...prev, userTurn]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendAssistantMessage({
        message: trimmed,
        language: aiLanguage,
        history: nextHistory,
        metadata: includeMetadata ? nonSensitiveMetadata : undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now() + 1}`,
          sender: "assistant",
          text: reply.reply,
          sourceLabel: `${reply.provider.toUpperCase()} (${reply.model})`,
        },
      ]);
    } catch (err) {
      if (err instanceof AiAssistantClientError) {
        setErrorState({
          code: err.code,
          message: resolveLocalizedError(err.code, err.message),
          lastQuery: err.code === "CLIENT_PRIVACY_BLOCK" ? undefined : trimmed,
        });
      } else {
        setErrorState({
          code: "UNKNOWN_ERROR",
          message: t.errors.UNKNOWN_ERROR,
          lastQuery: trimmed,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = !healthChecked ? (
    <Badge variant="secondary">{t.assistant.checkingServer}</Badge>
  ) : health?.providerConfigured ? (
    <Badge variant="emerald">
      <Sparkles className="h-3 w-3" />
      {t.assistant.serverConnected} ({health.provider})
    </Badge>
  ) : health ? (
    <Badge variant="amber">
      <AlertTriangle className="h-3 w-3" />
      {t.assistant.serverUnconfigured}
    </Badge>
  ) : (
    <Badge variant="amber">
      <WifiOff className="h-3 w-3" />
      {t.assistant.serverOffline}
    </Badge>
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t.assistant.title}
        subtitle={t.assistant.subtitle}
        badge={statusBadge}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Explicit AI Assistant Response Language Selection */}
            <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card/70 p-1">
              <Languages className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 ml-1.5 mr-1" />
              <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">
                {t.assistant.responseLangLabel}:
              </span>
              <Button
                type="button"
                size="sm"
                variant={aiLanguage === "en" ? "default" : "ghost"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setAiLanguage("en")}
              >
                {t.common.english}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={aiLanguage === "hi" ? "default" : "ghost"}
                className="h-7 px-2.5 text-xs"
                onClick={() => setAiLanguage("hi")}
              >
                {t.common.hindi}
              </Button>
            </div>

            {messages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessages([]);
                  setErrorState(null);
                }}
              >
                <Eraser className="h-4 w-4" />
                {t.assistant.clearChat}
              </Button>
            )}
          </div>
        }
      />

      {/* Privacy Guardrail Banner + Metadata Toggle */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300">
          <Lock className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{t.assistant.disclaimer}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs">
            <Switch
              checked={includeMetadata}
              onCheckedChange={setIncludeMetadata}
            />
            <span className="font-medium">{t.assistant.includeMetadataLabel}</span>
          </label>
          {includeMetadata && (
            <code className="font-mono text-[10px] text-muted-foreground bg-background/60 px-2 py-1 rounded border border-border/70 max-w-full truncate">
              {JSON.stringify(nonSensitiveMetadata)}
            </code>
          )}
        </div>
      </div>

      <Card className="flex flex-col h-[540px]">
        <CardContent className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-2">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Bot className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-lg">
                <p className="font-bold text-base">{t.assistant.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t.assistant.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
                {STARTER_PROMPTS[aiLanguage].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitQuery(prompt)}
                    className="text-left rounded-xl border border-border/80 bg-secondary/40 hover:border-primary/50 hover:bg-secondary/70 p-3 text-xs sm:text-sm transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.sender === "assistant" && (
                    <div className="h-8 w-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm space-y-2",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60 border border-border/80"
                    )}
                  >
                    {msg.sourceLabel && (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {msg.sourceLabel}
                        </Badge>
                        {msg.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.sender === "assistant"
                        ? renderSafeFormattedText(msg.text)
                        : msg.text}
                    </div>
                  </div>

                  {msg.sender === "user" && (
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start" aria-live="polite">
                  <div className="h-8 w-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 text-sky-600 dark:text-sky-400 animate-spin" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-xs sm:text-sm bg-secondary/60 border border-border/80 text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.assistant.thinking}</span>
                  </div>
                </div>
              )}

              {errorState && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2.5 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{errorState.code}</span>
                  </div>
                  <p className="text-muted-foreground">{errorState.message}</p>
                  {errorState.lastQuery && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseOfflinePlaybook(errorState.lastQuery!)}
                    >
                      {t.assistant.offlineFallbackBtn}
                    </Button>
                  )}
                </div>
              )}

              <div ref={endRef} />
            </>
          )}
        </CardContent>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitQuery(input);
          }}
          className="border-t border-border/80 p-4 flex items-center gap-2.5"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.assistant.placeholder}
            disabled={loading}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={!input.trim() || loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t.assistant.send}
          </Button>
        </form>
      </Card>
    </div>
  );
};
