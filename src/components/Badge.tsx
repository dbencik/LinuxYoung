"use client";

import { useState, useEffect } from "react";
import { getBadges } from "@/lib/progress";

const BADGE_CONFIG: Record<string, { icon: string; description: string }> = {
  "First Command": { icon: "🎯", description: "Complete your first lesson" },
  Navigator: { icon: "🧭", description: "Complete Module 1: First Steps" },
  "File Wrangler": { icon: "📂", description: "Complete Module 2: Files & Folders" },
  "Power User": { icon: "🔑", description: "Complete Module 3: Users & Permissions" },
  "Script Kiddo": { icon: "🔗", description: "Complete Module 4: Finding & Filtering" },
  "Linux Pro": { icon: "🏆", description: "Complete Module 5: System & Beyond" },
  "Challenge Accepted": { icon: "⚡", description: "Solve 5 challenges" },
  "Challenge Master": { icon: "🧠", description: "Solve all 20 challenges" },
  "XP Hunter": { icon: "💎", description: "Earn 200+ XP" },
  Completionist: { icon: "👑", description: "Complete all 20 lessons" },
};

const ALL_BADGE_NAMES = Object.keys(BADGE_CONFIG);

interface BadgeItemProps {
  name: string;
  unlocked: boolean;
  justUnlocked?: boolean;
}

function BadgeItem({ name, unlocked, justUnlocked }: BadgeItemProps) {
  const config = BADGE_CONFIG[name] || { icon: "🏅", description: "" };

  return (
    <div
      data-testid={`badge-${name.toLowerCase().replace(/\s+/g, "-")}`}
      className={`relative flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
        unlocked
          ? "border-indigo-200 bg-white shadow-sm"
          : "border-gray-100 bg-gray-50 opacity-40 grayscale"
      } ${justUnlocked ? "animate-bounce ring-2 ring-indigo-400 ring-offset-2" : ""}`}
    >
      <span className="mb-1 text-2xl">{config.icon}</span>
      <span className="text-xs font-semibold text-gray-800">{name}</span>
      <span className="mt-0.5 text-[10px] text-gray-500">{config.description}</span>
      {unlocked && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] text-white">
          ✓
        </span>
      )}
    </div>
  );
}

export default function BadgeGrid() {
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    const badges = getBadges();
    setUnlockedBadges(badges);
  }, []);

  // Called externally to refresh and detect new badges
  useEffect(() => {
    const handleBadgeRefresh = () => {
      const prev = unlockedBadges;
      const current = getBadges();
      const justNew = current.filter((b) => !prev.includes(b));
      setUnlockedBadges(current);
      if (justNew.length > 0) {
        setNewBadges(justNew);
        setTimeout(() => setNewBadges([]), 3000);
      }
    };

    window.addEventListener("badge-refresh", handleBadgeRefresh);
    return () => window.removeEventListener("badge-refresh", handleBadgeRefresh);
  }, [unlockedBadges]);

  return (
    <div data-testid="badge-grid">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Badges</h3>
      <div className="grid grid-cols-5 gap-2">
        {ALL_BADGE_NAMES.map((name) => (
          <BadgeItem
            key={name}
            name={name}
            unlocked={unlockedBadges.includes(name)}
            justUnlocked={newBadges.includes(name)}
          />
        ))}
      </div>
    </div>
  );
}
