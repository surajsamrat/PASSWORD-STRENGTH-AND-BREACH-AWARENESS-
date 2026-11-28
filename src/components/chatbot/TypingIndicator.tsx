import React from "react";
import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  label?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  label = "SecureCheck AI is generating a response...",
}) => {
  return (
    <div
      className="flex items-start gap-2.5 animate-fade-up"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
        <Bot className="h-3.5 w-3.5 text-sky-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border/80 bg-secondary/60 px-3.5 py-2.5 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
        </div>
        <span className="text-[11px] text-muted-foreground">Typing...</span>
      </div>
    </div>
  );
};
