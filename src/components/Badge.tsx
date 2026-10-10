"use client";

import { useState, useEffect } from "react";
import { getBadges } from "@/lib/progress";

const BADGE_CONFIG: Record<string, { icon: string; description: string }> = {
  "First Command": { icon: ">_", description: "Complete your first lesson" },
  Navigator: { icon: "cd", description: "Complete Module 1" },
  "File Wrangler": { icon: "mv", description: "Complete Module 2" },
  "Power User": { icon: "su", description: "Complete Module 3" },
  "Script Kiddo": { icon: "sh", description: "Complete Module 4" },
  "Linux Pro": { icon: "##", description: "Complete Module 5" },
  "Challenge Accepted": { icon: "x5", description: "Solve 5 challenges" },
  "Challenge Master": { icon: "**", description: "Solve all 20 challenges" },
  "XP Hunter": { icon: "++", description: "Earn 200+ XP" },
  Completionist: { icon: "OK", description: "Complete all 20 lessons" },
};

const ALL_BADGE_NAMES = Object.keys(BADGE_CONFIG);

export default function BadgeGrid() {
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    setUnlockedBadges(getBadges());
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      const prev = unlockedBadges;
      const current = getBadges();
      const justNew = current.filter((b) => !prev.includes(b));
      setUnlockedBadges(current);
      if (justNew.length > 0) {
        setNewBadges(justNew);
        setTimeout(() => setNewBadges([]), 3000);
      }
    };
    window.addEventListener("badge-refresh", handleRefresh);
    return () => window.removeEventListener("badge-refresh", handleRefresh);
  }, [unlockedBadges]);

  return (
    <div data-testid="badge-grid" className="overflow-x-clip">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-dim-amber)] bg-[var(--color-bg-amber)]">
          <span className="font-mono text-sm font-bold text-[var(--color-glow-amber)]">*</span>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-txt)]">Badges</h2>
          <p className="font-mono text-xs text-[var(--color-txt-muted)]">
            {unlockedBadges.length}/{ALL_BADGE_NAMES.length} unlocked
          </p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {ALL_BADGE_NAMES.map((name) => {
          const config = BADGE_CONFIG[name];
          const unlocked = unlockedBadges.includes(name);
          const isNew = newBadges.includes(name);

          return (
            <div
              key={name}
              data-testid={`badge-${name.toLowerCase().replace(/\s+/g, "-")}`}
              className={`group relative flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                unlocked
                  ? "border-[var(--color-muted-green)] bg-[var(--color-bg-green)]"
                  : "border-[var(--color-border-default)] bg-[var(--color-elevated)] opacity-60"
              } ${isNew ? "glow-pulse" : ""}`}
            >
              <span
                className={`mb-1.5 font-mono text-lg font-bold ${
                  unlocked ? "text-[var(--color-glow-green)]" : "text-[var(--color-txt-muted)]"
                }`}
              >
                {config.icon}
              </span>
              <span className="text-[11px] font-medium leading-tight text-[var(--color-txt-secondary)]">
                {name}
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-[var(--color-txt-muted)]">
                {config.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
