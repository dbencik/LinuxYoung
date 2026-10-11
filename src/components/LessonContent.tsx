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
  Beginner: "text-[var(--color-glow-green)] bg-[var(--color-bg-green)] border-[var(--color-muted-green)]",
  Intermediate: "text-[var(--color-glow-amber)] bg-[var(--color-bg-amber)] border-[var(--color-dim-amber)]",
  Advanced: "text-[var(--color-glow-red)] bg-[var(--color-bg-red)] border-[var(--color-dim-red)]",
};

export default function LessonContent({ lesson, prevId, nextId }: LessonContentProps) {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);
  const [challengeInput, setChallengeInput] = useState("");
  const [challengeResult, setChallengeResult] = useState<"correct" | "wrong" | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  useEffect(() => {
    // Reset state on lesson change — reading localStorage on mount (SSR-safe)
    /* eslint-disable react-hooks/set-state-in-effect */
    setLessonCompleted(getCompletedLessons().includes(lesson.id));
    setChallengeCompleted(getCompletedChallenges().includes(lesson.id));
    setChallengeInput("");
    setChallengeResult(null);
    setShowHint(false);
    setShowCompletionAnimation(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [lesson.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat) return;
      if (e.key === "ArrowLeft" && prevId) router.push(`/lesson/${prevId}`);
      else if (e.key === "ArrowRight" && nextId) router.push(`/lesson/${nextId}`);
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
    if (!userAnswer) {
      setChallengeResult("wrong");
      return;
    }
    const expected = lesson.challenge.answer.trim().toLowerCase();
    // Normalize whitespace and check if user answer contains the expected command
    const normalize = (s: string) => s.replace(/\s+/g, " ");
    if (normalize(userAnswer).includes(normalize(expected))) {
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
      <div className="fade-up mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-elevated)] px-2.5 py-1 font-mono text-[13px] font-medium uppercase tracking-wider text-[var(--color-txt-muted)]">
            Module {lesson.module}
          </span>
          <span className={`rounded-md border px-2.5 py-1 font-mono text-[13px] font-bold uppercase tracking-wider ${difficultyColor[lesson.difficulty] || ""}`}>
            {lesson.difficulty}
          </span>
          {lessonCompleted && (
            <span className="rounded-md border border-[var(--color-muted-green)] bg-[var(--color-bg-green)] px-2.5 py-1 font-mono text-[13px] font-bold uppercase tracking-wider text-[var(--color-glow-green)]">
              Done
            </span>
          )}
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-txt)] sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="max-w-[65ch] text-lg leading-relaxed text-[var(--color-txt-secondary)]">{lesson.objective}</p>
      </div>

      {/* Explanation */}
      <section className="fade-up mb-10" style={{ animationDelay: "0.1s" }}>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          <h2 className="font-mono text-[13px] font-medium uppercase tracking-widest text-[var(--color-txt-muted)]">
            Explanation
          </h2>
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
        </div>
        <div className="max-w-[65ch] space-y-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 text-lg leading-relaxed text-[var(--color-txt)]">
          {lesson.explanation.split(/(?<=\.)\s+(?=[A-Z])/).reduce<string[]>((paras, sentence) => {
            const last = paras[paras.length - 1];
            if (last && last.split(/\s+/).length < 40) {
              paras[paras.length - 1] = last + " " + sentence;
            } else {
              paras.push(sentence);
            }
            return paras;
          }, []).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Commands */}
      <section className="fade-up mb-10" style={{ animationDelay: "0.15s" }}>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          <h2 className="font-mono text-[13px] font-medium uppercase tracking-widest text-[var(--color-txt-muted)]">
            Commands
          </h2>
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
        </div>
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
      <section className="fade-up mb-10" style={{ animationDelay: "0.2s" }}>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          <h2 className="font-mono text-[13px] font-medium uppercase tracking-widest text-[var(--color-txt-muted)]">
            Challenge
          </h2>
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
        </div>
        <div className="rounded-2xl border border-[var(--color-glow-blue)] bg-[var(--color-bg-blue)] p-6">
          <p className="mb-4 max-w-[65ch] text-lg font-medium leading-relaxed text-[var(--color-txt)]">{lesson.challenge.question}</p>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={challengeInput}
              onChange={(e) => { setChallengeInput(e.target.value); setChallengeResult(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleChallengeSubmit()}
              placeholder="$ type your answer..."
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-canvas)] px-4 py-2.5 font-mono text-base text-[var(--color-glow-green)] placeholder-[var(--color-txt-muted)] focus:border-[var(--color-muted-green)] focus:outline-none focus:ring-2 focus:ring-[var(--color-glow-green)]/30"
              aria-label="Challenge answer"
              data-testid="challenge-input"
            />
            <button
              onClick={handleChallengeSubmit}
              data-testid="challenge-submit"
              className="rounded-lg border border-[var(--color-muted-green)] bg-[var(--color-bg-green)] px-5 py-2.5 font-mono text-[13px] font-bold text-[var(--color-glow-green)] transition-all hover:bg-[var(--color-muted-green)] hover:text-[var(--color-canvas)]"
            >
              run
            </button>
          </div>

          {challengeResult === "correct" && !challengeCompleted && (
            <div data-testid="challenge-correct" className="mb-3 rounded-lg border border-[var(--color-muted-green)] bg-[var(--color-bg-green)] p-3 font-mono text-[13px] text-[var(--color-glow-green)]" role="alert">
              ✓ Correct! +25 XP
            </div>
          )}
          {challengeResult === "correct" && challengeCompleted && (
            <div className="mb-3 rounded-lg border border-[var(--color-muted-green)] bg-[var(--color-bg-green)] p-3 font-mono text-[13px] text-[var(--color-glow-green)]" role="alert">
              ✓ Correct!
            </div>
          )}
          {challengeResult === "wrong" && !challengeCompleted && (
            <div data-testid="challenge-wrong" className="mb-3 rounded-lg border border-[var(--color-dim-red)] bg-[var(--color-bg-red)] p-3 font-mono text-[13px] text-[var(--color-glow-red)]" role="alert">
              ✗ Not quite — try again or check the hint.
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="font-mono text-[13px] text-[var(--color-txt-muted)] transition-colors hover:text-[var(--color-txt-secondary)]"
            >
              {showHint ? "− hide hint" : "+ show hint"}
            </button>
            {challengeCompleted && (
              <span className="font-mono text-[13px] font-bold text-[var(--color-glow-green)]">solved</span>
            )}
          </div>
          {showHint && (
            <p className="mt-3 max-w-[65ch] rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 font-mono text-base text-[var(--color-txt-muted)]">
              {lesson.challenge.hint}
            </p>
          )}
        </div>
      </section>

      {/* Fun Fact */}
      <section className="fade-up mb-10" style={{ animationDelay: "0.25s" }}>
        <div className="rounded-2xl border border-[var(--color-dim-amber)] bg-[var(--color-bg-amber)] p-5">
          <p className="mb-1 font-mono text-[13px] font-bold uppercase tracking-wider text-[var(--color-dim-amber)]">
            Fun fact
          </p>
          <p className="max-w-[65ch] text-base text-[var(--color-glow-amber)]">{lesson.funFact}</p>
        </div>
      </section>

      {/* Complete Button */}
      <section className="fade-up mb-10" style={{ animationDelay: "0.3s" }}>
        {!lessonCompleted ? (
          <button
            onClick={handleMarkComplete}
            data-testid="complete-button"
            className="w-full rounded-xl border border-[var(--color-muted-green)] bg-gradient-to-r from-[var(--color-muted-green)] to-[var(--color-dim-green)] px-6 py-4 text-center font-mono text-sm font-bold text-[var(--color-canvas)] shadow-[var(--glow-green)] transition-all hover:shadow-[0_0_30px_rgba(57,255,133,0.3)] active:scale-[0.99]"
          >
            $ mark-complete --xp=10
          </button>
        ) : (
          <div
            data-testid="completed-badge"
            className={`flex items-center justify-center gap-2 rounded-xl border border-[var(--color-muted-green)] bg-[var(--color-bg-green)] px-6 py-4 font-mono text-sm font-bold text-[var(--color-glow-green)] ${
              showCompletionAnimation ? "glow-pulse" : ""
            }`}
          >
            ✓ lesson completed
          </div>
        )}
      </section>

      {/* Navigation */}
      <nav className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-6">
        {prevId ? (
          <Link
            href={`/lesson/${prevId}`}
            data-testid="prev-button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-2.5 font-mono text-[13px] font-medium text-[var(--color-txt-muted)] transition-all hover:border-[var(--color-border-strong)] hover:text-[var(--color-txt)]"
          >
            <span>←</span> prev
          </Link>
        ) : (
          <div />
        )}

        <span className="font-mono text-[13px] text-[var(--color-txt-muted)]">← → to navigate</span>

        {nextId ? (
          <Link
            href={`/lesson/${nextId}`}
            data-testid="next-button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-muted-green)] bg-[var(--color-bg-green)] px-4 py-2.5 font-mono text-[13px] font-medium text-[var(--color-glow-green)] transition-all hover:bg-[var(--color-muted-green)] hover:text-[var(--color-canvas)]"
          >
            next <span>→</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
