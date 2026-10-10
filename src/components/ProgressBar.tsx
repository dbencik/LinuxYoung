"use client";

import { useState, useEffect } from "react";
import { getCompletedLessons, getXP } from "@/lib/progress";

const TOTAL_LESSONS = 20;

export default function ProgressBar() {
  const [completedCount, setCompletedCount] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setCompletedCount(getCompletedLessons().length);
    setXp(getXP());
  }, []);

  const percentage = Math.round((completedCount / TOTAL_LESSONS) * 100);

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Your Progress</h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
          {xp} XP
        </span>
      </div>

      {/* Bar progress */}
      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {completedCount}/{TOTAL_LESSONS} lessons completed
        </span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}
