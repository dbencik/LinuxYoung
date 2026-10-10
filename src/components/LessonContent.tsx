"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import CopyButton from "./CopyButton";

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
  const [showHint, setShowHint] = useState(false);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
            Module {lesson.module}: {lesson.moduleName}
          </span>
          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${difficultyColor[lesson.difficulty] || ""}`}>
            {lesson.difficulty}
          </span>
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
            <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <code className="rounded bg-gray-900 px-3 py-1.5 font-mono text-sm text-green-400">
                  $ {cmd.command}
                </code>
                <CopyButton text={cmd.command} />
              </div>
              <p className="mb-1 text-sm text-gray-600">{cmd.description}</p>
              <p className="text-xs text-gray-400">
                Expected output: <code className="text-gray-500">{cmd.expectedOutput}</code>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Challenge</h2>
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <p className="mb-3 text-sm font-medium text-indigo-900">{lesson.challenge.question}</p>
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
        </div>
      </section>

      {/* Fun Fact */}
      <section className="mb-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-1 text-sm font-semibold text-amber-800">Fun Fact</h3>
          <p className="text-sm text-amber-700">{lesson.funFact}</p>
        </div>
      </section>

      {/* Navigation */}
      <nav className="flex items-center justify-between border-t border-gray-200 pt-6">
        {prevId ? (
          <Link
            href={`/lesson/${prevId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous Lesson
          </Link>
        ) : (
          <div />
        )}
        {nextId ? (
          <Link
            href={`/lesson/${nextId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Next Lesson
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
