import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { ChatHeader } from "./ChatHeader";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";

export const ChatWindow: React.FC = () => {
  const {
    isMinimized,
    messages,
    isTyping,
    error,
    lastFailedQuery,
    aiHealth,
    starterChips,
    closeChat,
    toggleMinimize,
    sendMessage,
    retryLast,
    useOfflineFallbackForLast,
    clearChat,
  } = useChatbot();

  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, error, isMinimized]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeChat]);

  const handleConfirmClear = () => {
    clearChat();
    setConfirmClear(false);
  };

  return (
    <section
      role="dialog"
      aria-label="SecureCheck AI Assistant"
      data-testid="floating-chatbot-window"
      className="no-print fixed right-3 sm:right-6 bottom-[4.5rem] lg:bottom-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[400px] md:w-[420px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border/90 bg-card/95 backdrop-blur-xl shadow-2xl shadow-slate-950/50 overflow-hidden flex flex-col animate-fade-up"
      style={
        isMinimized
          ? undefined
          : { maxHeight: "min(600px, calc(100dvh - 6.5rem))" }
      }
    >
      <ChatHeader
        aiHealth={aiHealth}
        isMinimized={isMinimized}
        hasMessages={messages.length > 0}
        onRequestClear={() => setConfirmClear((c) => !c)}
        onToggleMinimize={toggleMinimize}
        onClose={closeChat}
      />

      {!isMinimized && (
        <>
          {/* Clear chat inline confirmation */}
          {confirmClear && (
            <div className="px-3.5 py-2 border-b border-border/80 bg-destructive/10 flex items-center justify-between gap-2 text-xs shrink-0 animate-fade-up">
              <span className="font-medium text-foreground">
                Clear all chat messages?
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-7 px-2.5 text-[11px]"
                  onClick={handleConfirmClear}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-[11px]"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Scrollable message area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 min-h-[260px]">
            {messages.length === 0 ? (
              <SuggestedQuestions
                chips={starterChips}
                onSelect={sendMessage}
                disabled={isTyping}
              />
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onFollowUp={sendMessage}
                  disabled={isTyping}
                />
              ))
            )}

            {isTyping && (
              <TypingIndicator label="SecureCheck AI is generating a response..." />
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs text-destructive space-y-2 animate-fade-up"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {lastFailedQuery && (
                  <div className="flex flex-wrap items-center gap-1.5 pl-6">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px]"
                      onClick={retryLast}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 px-2 text-[11px]"
                      onClick={useOfflineFallbackForLast}
                    >
                      Use Offline Guide
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput disabled={isTyping} onSend={sendMessage} />
        </>
      )}
    </section>
  );
};
