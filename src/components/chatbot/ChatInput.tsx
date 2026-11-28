import React, { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ disabled, onSend }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue("");
    onSend(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-border/80 bg-card/95 space-y-1.5 shrink-0"
    >
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about passwords, crack time, breaches, or phishing..."
          maxLength={600}
          disabled={disabled}
          aria-label="Type your cybersecurity question"
          className="h-9 text-xs sm:text-[13px] bg-secondary/40 border-border/80"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || disabled}
          title="Send message"
          aria-label="Send message"
          className="h-9 w-9 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-0.5">
        <Lock className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
        <span>Never paste real passwords or full hashes into chat.</span>
      </p>
    </form>
  );
};
