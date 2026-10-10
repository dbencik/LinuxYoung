"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/lib/lessons";
import CommandCard from "./CommandCard";
import {
  completeLesson,
  completeChallenge,
  getCompletedLessons,
  getCompletedChallenges,
} from "@/lib/progress";

interface LessonContentProps {
  lesson: Lesson;
  prevId: number | null;
  nextId: number | null;
}

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function LessonContent({ lesson, prevId, nextId }: LessonContentProps) {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);
  const [challengeInput, setChallengeInput] = useState("");
  const [challengeResult, setChallengeResult] = useState<"correct" | "wrong" | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  // Load completion state from localStorage
  useEffect(() => {
    setLessonCompleted(getCompletedLessons().includes(lesson.id));
    setChallengeCompleted(getCompletedChallenges().includes(lesson.id));
    setChallengeInput("");
    setChallengeResult(null);
    setShowHint(false);
    setShowCompletionAnimation(false);
  }, [lesson.id]);

  // Keyboard navigation (← →)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevId) {
        router.push(`/lesson/${prevId}`);
      } else if (e.key === "ArrowRight" && nextId) {
        router.push(`/lesson/${nextId}`);
      }
    },
    [prevId, nextId, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleMarkComplete() {
    completeLesson(lesson.id);
    setLessonCompleted(true);
    setShowCompletionAnimation(true);
    window.dispatchEvent(new Event("badge-refresh"));
    setTimeout(() => setShowCompletionAnimation(false), 2000);
  }

  function handleChallengeSubmit() {
    const userAnswer = challengeInput.trim().toLowerCase();
    const expected = lesson.challenge.answer.trim().toLowerCase();
    if (userAnswer.includes(expected) || expected.includes(userAnswer)) {
      setChallengeResult("correct");
      if (!challengeCompleted) {
        completeChallenge(lesson.id);
        setChallengeCompleted(true);
        window.dispatchEvent(new Event("badge-refresh"));
      }
    } else {
      setChallengeResult("wrong");
    }
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
            Module {lesson.module}: {lesson.moduleName}
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${difficultyColor[lesson.difficulty] || ""}`}
          >
            {lesson.difficulty}
          </span>
          {lessonCompleted && (
            <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
              Completed
            </span>
          )}
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Lesson {lesson.id}: {lesson.title}
        </h1>
        <p className="text-base text-gray-600">{lesson.objective}</p>
      </div>

      {/* Explanation */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Explanation</h2>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          {lesson.explanation}
        </div>
      </section>

      {/* Commands */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Commands to Try</h2>
        <div className="space-y-3">
          {lesson.commands.map((cmd, idx) => (
            <CommandCard
              key={idx}
              command={cmd.command}
              description={cmd.description}
              expectedOutput={cmd.expectedOutput}
              safety={cmd.safety || "safe"}
              troubleshooting={cmd.troubleshooting || null}
            />
          ))}
        </div>
      </section>

      {/* Challenge */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Challenge</h2>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <p className="mb-3 text-sm font-medium text-indigo-900">{lesson.challenge.question}</p>

          {/* Challenge input */}
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={challengeInput}
              onChange={(e) => {
                setChallengeInput(e.target.value);
                setChallengeResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleChallengeSubmit()}
              placeholder="Type your answer..."
              className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              data-testid="challenge-input"
            />
            <button
              onClick={handleChallengeSubmit}
              data-testid="challenge-submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Check
            </button>
          </div>

          {/* Challenge result */}
          {challengeResult === "correct" && (
            <div
              data-testid="challenge-correct"
              className="mb-3 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700"
            >
              Correct! +25 XP
            </div>
          )}
          {challengeResult === "wrong" && (
            <div
              data-testid="challenge-wrong"
              className="mb-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
            >
              Not quite — try again or check the hint.
            </div>
          )}

          {/* Hint toggle */}
          <button
            onClick={() => setShowHint(!showHint)}
            className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200"
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>
          {showHint && (
            <p className="mt-3 rounded-lg bg-white p-3 text-sm text-indigo-700">
              {lesson.challenge.hint}
            </p>
          )}
          {challengeCompleted && (
            <span className="ml-2 text-xs font-semibold text-green-600">Solved!</span>
          )}
        </div>
      </section>

      {/* Fun Fact */}
      <section className="mb-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-1 text-sm font-semibold text-amber-800">Fun Fact</h3>
          <p className="text-sm text-amber-700">{lesson.funFact}</p>
        </div>
      </section>

      {/* Mark as Complete */}
      <section className="mb-10">
        {!lessonCompleted ? (
          <button
            onClick={handleMarkComplete}
            data-testid="complete-button"
            className="w-full rounded-xl bg-green-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 active:scale-[0.98]"
          >
            Mark Lesson as Complete (+10 XP)
          </button>
        ) : (
          <div
            data-testid="completed-badge"
            className={`flex items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-6 py-3.5 text-sm font-semibold text-green-700 ${
              showCompletionAnimation ? "animate-pulse" : ""
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Lesson Completed!
          </div>
        )}
      </section>

      {/* Navigation */}
      <nav className="flex items-center justify-between border-t border-gray-200 pt-6">
        {prevId ? (
          <Link
            href={`/lesson/${prevId}`}
            data-testid="prev-button"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Link>
        ) : (
          <div />
        )}

        <span className="text-xs text-gray-400">Use ← → to navigate</span>

        {nextId ? (
          <Link
            href={`/lesson/${nextId}`}
            data-testid="next-button"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
