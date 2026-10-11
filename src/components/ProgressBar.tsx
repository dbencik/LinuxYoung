"use client";

import { useState, useEffect } from "react";
import { getCompletedLessons, getXP } from "@/lib/progress";

const TOTAL_LESSONS = 20;

export default function ProgressBar() {
  const [completedCount, setCompletedCount] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reading localStorage on mount */
    setCompletedCount(getCompletedLessons().length);
    setXp(getXP());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const percentage = Math.round((completedCount / TOTAL_LESSONS) * 100);

  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bg-green)] border border-[var(--color-muted-green)]">
            <span className="font-mono text-sm font-bold text-[var(--color-glow-green)]">%</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-txt)]">Progress</h2>
            <p className="font-mono text-[13px] text-[var(--color-txt-muted)]">
              {completedCount}/{TOTAL_LESSONS} lessons
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-dim-amber)] bg-[var(--color-bg-amber)] px-3 py-1.5">
          <span className="font-mono text-[13px] font-bold text-[var(--color-glow-amber)]">{xp}</span>
          <span className="font-mono text-[13px] text-[var(--color-dim-amber)]">XP</span>
        </div>
      </div>

      {/* Bar */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-elevated)]"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${completedCount} of ${TOTAL_LESSONS} lessons completed`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, var(--color-muted-green), var(--color-glow-green))`,
            boxShadow: percentage > 0 ? "0 0 12px rgba(57, 255, 133, 0.4)" : "none",
          }}
        />
      </div>

      <div className="mt-2 text-right">
        <span className="font-mono text-[13px] text-[var(--color-txt-muted)]">{percentage}%</span>
      </div>
    </div>
  );
}
