import React from "react";
import { AlertTriangle, Bot, ShieldCheck, User } from "lucide-react";
import type { ChatbotMessageItem } from "@/hooks/useChatbot";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
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
          className="font-mono text-[11px] bg-background/80 px-1 py-0.5 rounded border border-border/70"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic opacity-90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderStructuredAnswer(text: string): React.ReactNode {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} className="h-0.5" />;

        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="font-bold text-xs sm:text-[13px] text-sky-600 dark:text-sky-400 pt-0.5"
            >
              {renderInlineFormatting(line.slice(4))}
            </h4>
          );
        }

        if (line.startsWith("> ")) {
          return (
            <div
              key={idx}
              className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] sm:text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>{renderInlineFormatting(line.slice(2))}</span>
            </div>
          );
        }

        if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{renderInlineFormatting(line.slice(2))}</span>
            </div>
          );
        }

        const numbered = line.match(/^(\d+\.)\s+(.*)$/);
        if (numbered) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="font-mono font-bold text-sky-500 shrink-0">
                {numbered[1]}
              </span>
              <span>{renderInlineFormatting(numbered[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

interface ChatMessageProps {
  message: ChatbotMessageItem;
  onFollowUp?: (question: string) => void;
  disabled?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onFollowUp,
  disabled,
}) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 animate-fade-up",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "flex items-start gap-2 max-w-[92%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border",
            isUser
              ? "bg-primary/15 border-primary/35 text-primary"
              : message.blockedForPrivacy
              ? "bg-amber-500/15 border-amber-500/35 text-amber-400"
              : "bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border-sky-500/30 text-sky-400"
          )}
        >
          {isUser ? (
            <User className="h-3.5 w-3.5" />
          ) : message.blockedForPrivacy ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
        </div>

        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 border shadow-sm break-words min-w-0",
            isUser
              ? message.blockedForPrivacy
                ? "rounded-tr-sm bg-amber-500/10 border-amber-500/35 text-amber-700 dark:text-amber-300 text-xs"
                : "rounded-tr-sm bg-primary text-primary-foreground border-primary/80 text-xs sm:text-[13px]"
              : "rounded-tl-sm bg-secondary/55 border-border/80 text-foreground"
          )}
        >
          {!isUser && message.sourceLabel && (
            <div className="mb-1.5 flex flex-wrap items-center gap-1">
              <Badge
                variant={
                  message.source === "ai-backend"
                    ? "emerald"
                    : message.source === "fallback"
                    ? "amber"
                    : "default"
                }
                className="text-[9px] px-1.5 py-0"
              >
                {message.sourceLabel}
              </Badge>
            </div>
          )}

          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          ) : (
            renderStructuredAnswer(message.text)
          )}
        </div>
      </div>

      {/* Follow-up suggestions after assistant messages */}
      {!isUser && message.followUps && message.followUps.length > 0 && onFollowUp && (
        <div className="pl-9 flex flex-wrap gap-1.5 max-w-[92%]">
          {message.followUps.slice(0, 2).map((followUp) => (
            <button
              key={followUp}
              type="button"
              disabled={disabled}
              onClick={() => onFollowUp(followUp)}
              className="text-left text-[11px] rounded-lg border border-border bg-card/80 hover:border-sky-500/45 hover:bg-sky-500/10 text-muted-foreground hover:text-foreground px-2 py-1 transition-colors disabled:opacity-50"
            >
              {followUp}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
