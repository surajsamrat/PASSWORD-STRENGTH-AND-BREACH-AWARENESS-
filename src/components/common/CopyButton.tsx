import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  value: string;
  onCopied?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  onCopied,
  children,
  variant = "outline",
  size = "sm",
  ...props
}) => {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <Button type="button" variant={variant} size={size} onClick={handleCopy} {...props}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>{t.common.copied}</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>{children ?? t.common.copy}</span>
        </>
      )}
    </Button>
  );
};
