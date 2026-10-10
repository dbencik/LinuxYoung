"use client";

import CopyButton from "./CopyButton";

interface CommandCardProps {
  command: string;
  description: string;
  expectedOutput: string;
  safety: "safe" | "modifies" | "caution";
  troubleshooting: string | null;
}

const safetyConfig: Record<string, { label: string; color: string; icon: string }> = {
  safe: { label: "Safe", color: "bg-green-100 text-green-700", icon: "🟢" },
  modifies: { label: "Modifies files", color: "bg-orange-100 text-orange-700", icon: "🟠" },
  caution: { label: "Caution", color: "bg-red-100 text-red-700", icon: "🔴" },
};

export default function CommandCard({
  command,
  description,
  expectedOutput,
  safety,
  troubleshooting,
}: CommandCardProps) {
  const badge = safetyConfig[safety] || safetyConfig.safe;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm" data-testid="command-card">
      {/* Command + Copy + Safety */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <code
          data-testid="copy-button"
          className="rounded bg-gray-900 px-3 py-1.5 font-mono text-sm text-green-400"
        >
          $ {command}
        </code>
        <div className="flex items-center gap-2">
          <span
            data-testid="safety-label"
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}
          >
            {badge.icon} {badge.label}
          </span>
          <CopyButton text={command} />
        </div>
      </div>

      {/* Description */}
      <p className="mb-2 text-sm text-gray-600">{description}</p>

      {/* Expected Output */}
      {expectedOutput && (
        <div className="mb-2 rounded-lg border border-gray-100 bg-gray-950 p-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Expected output
          </p>
          <pre
            data-testid="expected-output"
            className="whitespace-pre-wrap font-mono text-xs text-green-400"
          >
            {expectedOutput}
          </pre>
        </div>
      )}

      {/* Troubleshooting */}
      {troubleshooting && (
        <div
          data-testid="troubleshooting"
          className="rounded-lg border border-amber-100 bg-amber-50 p-2.5"
        >
          <p className="text-xs text-amber-800">
            <span className="mr-1 font-semibold">Troubleshooting:</span>
            {troubleshooting}
          </p>
        </div>
      )}
    </div>
  );
}
