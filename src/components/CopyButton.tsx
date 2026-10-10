"use client";

import { useState, useCallback } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      data-testid="copy-button"
      className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border-default)] bg-[var(--color-elevated)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--color-txt-muted)] transition-all hover:border-[var(--color-muted-green)] hover:text-[var(--color-glow-green)] active:scale-95 ${className}`}
      aria-label={copied ? "Copied!" : `Copy ${text}`}
    >
      {copied ? (
        <span className="text-[var(--color-glow-green)]">copied!</span>
      ) : (
        <span>copy</span>
      )}
    </button>
  );
}
