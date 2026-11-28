import React from "react";
import { Bot, Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  chips: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  chips,
  onSelect,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      {/* Welcome bubble */}
      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500/25 to-emerald-500/25 border border-sky-500/35 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border/80 bg-secondary/50 px-3.5 py-3 text-xs sm:text-[13px] leading-relaxed text-foreground space-y-2 shadow-sm">
          <p className="font-semibold">Hey! I&apos;m SecureCheck AI 👋</p>
          <p className="text-muted-foreground">
            I can help you understand password security, crack time, breaches, phishing,
            and all SecureCheck features.
          </p>
          <p className="font-medium text-sky-600 dark:text-sky-400">
            What would you like to know?
          </p>
        </div>
      </div>

      {/* Clickable Suggested Chips */}
      <div className="space-y-1.5 pl-9">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          Suggested Questions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((q) => (
            <button
              key={q}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(q)}
              className="text-left text-[11px] sm:text-xs font-medium rounded-xl border border-sky-500/25 bg-sky-500/[0.07] hover:bg-sky-500/15 hover:border-sky-500/45 text-foreground px-2.5 py-1.5 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
