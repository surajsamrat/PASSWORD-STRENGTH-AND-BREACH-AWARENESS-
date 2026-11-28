import React from "react";
import { Bot } from "lucide-react";

interface FloatingChatButtonProps {
  hasUnreadBadge: boolean;
  onClick: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  hasUnreadBadge,
  onClick,
}) => {
  const tooltipText = "Ask SecureCheck AI";

  return (
    <div className="no-print fixed right-4 bottom-[4.5rem] lg:bottom-6 lg:right-6 z-40 group">
      {/* Hover / Focus Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none hidden sm:flex items-center gap-1.5 absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border border-sky-500/30 bg-card/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>{tooltipText}</span>
      </div>

      {/* Subtle ambient glow ring */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-tr from-sky-500/40 to-emerald-500/40 blur-md opacity-70 animate-pulse-glow group-hover:opacity-100 transition-opacity"
      />

      <button
        type="button"
        onClick={onClick}
        title={tooltipText}
        aria-label={tooltipText}
        data-testid="floating-chatbot-button"
        className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-slate-950 shadow-xl shadow-sky-500/25 border border-white/25 flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Bot className="h-6 w-6 stroke-[2.3]" />

        {/* First-time user notification indicator */}
        {hasUnreadBadge && (
          <span
            aria-label="New assistant available"
            className="absolute -top-1 -right-1 flex h-3.5 w-3.5"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-85" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-background" />
          </span>
        )}
      </button>
    </div>
  );
};
