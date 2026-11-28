import React from "react";
import { Bot, Eraser, Minus, X } from "lucide-react";
import type { AssistantHealthStatus } from "@/lib/security/aiAssistantClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  aiHealth: AssistantHealthStatus | null;
  isMinimized: boolean;
  hasMessages: boolean;
  onRequestClear: () => void;
  onToggleMinimize: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  aiHealth,
  isMinimized,
  hasMessages,
  onRequestClear,
  onToggleMinimize,
  onClose,
}) => {
  const isLiveAi = Boolean(aiHealth?.providerConfigured);

  return (
    <div className="px-3.5 py-2.5 border-b border-border/80 bg-gradient-to-r from-sky-500/10 via-card to-emerald-500/10 flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
          <Bot className="h-5 w-5 stroke-[2.2]" />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
              isLiveAi ? "bg-emerald-400" : "bg-sky-400"
            )}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-extrabold tracking-tight truncate">
              SecureCheck AI Assistant
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
            <span className="truncate">Your Personal Cybersecurity Guide</span>
            <span aria-hidden="true">•</span>
            <span
              className={cn(
                "font-semibold shrink-0",
                isLiveAi ? "text-emerald-500" : "text-sky-500"
              )}
            >
              {isLiveAi
                ? aiHealth?.provider === "gemini"
                  ? "Gemini Flash Ready"
                  : "AI Ready"
                : "Offline Guide"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {hasMessages && !isMinimized && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onRequestClear}
            title="Clear chat"
            aria-label="Clear chat"
          >
            <Eraser className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onToggleMinimize}
          title={isMinimized ? "Expand chat" : "Minimize chat"}
          aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          title="Close chat"
          aria-label="Close chat"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
