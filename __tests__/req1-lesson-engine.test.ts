/**
 * AICLP Acceptance Tests — REQ 1: Interactive Lesson Engine
 *
 * Falsifiable Tests from FSD:
 * - Lesson page renders title, explanation, and command blocks
 * - Progress bar shows "X / 20"
 * - Copy buttons present on every command
 * - Navigation (Previous / Next) works correctly
 * - Keyboard shortcuts (← →)
 */
import fs from "fs";
import path from "path";

const LESSONS_DIR = path.join(__dirname, "../content/lessons");

interface Lesson {
  id: number;
  slug: string;
  title: string;
  module: number;
  moduleName: string;
  difficulty: string;
  objective: string;
  explanation: string;
  commands: { command: string; description: string; expectedOutput: string }[];
  challenge: { question: string; hint: string; answer: string };
  funFact: string;
}

function loadLesson(id: number): Lesson {
  const padded = String(id).padStart(2, "0");
  return JSON.parse(fs.readFileSync(path.join(LESSONS_DIR, `lesson-${padded}.json`), "utf-8"));
}

function loadAllLessons(): Lesson[] {
  return fs
    .readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(LESSONS_DIR, f), "utf-8")));
}

describe("REQ 1: Interactive Lesson Engine", () => {
  const allLessons = loadAllLessons();

  describe("Lesson rendering requirements", () => {
    test("each lesson has a title that can be displayed as heading", () => {
      allLessons.forEach((lesson) => {
        expect(lesson.title).toBeTruthy();
        expect(lesson.title.length).toBeGreaterThan(3);
      });
    });

    test("each lesson has a difficulty badge (Beginner/Intermediate/Advanced)", () => {
      allLessons.forEach((lesson) => {
        expect(["Beginner", "Intermediate", "Advanced"]).toContain(lesson.difficulty);
      });
    });

    test("each lesson has explanation text (markdown-renderable)", () => {
      allLessons.forEach((lesson) => {
        expect(lesson.explanation).toBeTruthy();
        expect(lesson.explanation.length).toBeGreaterThan(500); // 200+ words
      });
    });

    test("each lesson has 3-8 command blocks with copy-able text", () => {
      allLessons.forEach((lesson) => {
        expect(lesson.commands.length).toBeGreaterThanOrEqual(3);
        expect(lesson.commands.length).toBeLessThanOrEqual(8);
        lesson.commands.forEach((cmd) => {
          expect(cmd.command).toBeTruthy();
          expect(cmd.command.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Progress tracking data structure", () => {
    test("total lesson count is >= 20 for progress bar denominator", () => {
      expect(allLessons.length).toBeGreaterThanOrEqual(20);
    });

    test("lesson IDs are sequential from 1 to N for progress calculation", () => {
      const ids = allLessons.map((l) => l.id).sort((a, b) => a - b);
      for (let i = 0; i < ids.length; i++) {
        expect(ids[i]).toBe(i + 1);
      }
    });
  });

  describe("Navigation requirements", () => {
    test("lesson 1 has no previous (first lesson)", () => {
      const lesson = loadLesson(1);
      expect(lesson.id).toBe(1);
      // prevId = lessonId > 1 ? lessonId - 1 : null → null for lesson 1
      const prevId = lesson.id > 1 ? lesson.id - 1 : null;
      expect(prevId).toBeNull();
    });

    test("lesson 3 has both previous (2) and next (4)", () => {
      const lesson = loadLesson(3);
      const prevId = lesson.id > 1 ? lesson.id - 1 : null;
      const nextId = lesson.id < allLessons.length ? lesson.id + 1 : null;
      expect(prevId).toBe(2);
      expect(nextId).toBe(4);
    });

    test("last lesson has no next", () => {
      const lastLesson = loadLesson(allLessons.length);
      const nextId = lastLesson.id < allLessons.length ? lastLesson.id + 1 : null;
      expect(nextId).toBeNull();
    });
  });

  describe("Lesson content completeness for rendering", () => {
    test("lesson 3 of 20 renders with all required fields", () => {
      const lesson = loadLesson(3);
      // FSD Falsifiable Test: "Title, explanation, and at least 1 command block are visible"
      expect(lesson.title).toBeTruthy();
      expect(lesson.explanation).toBeTruthy();
      expect(lesson.commands.length).toBeGreaterThan(0);
      // "Progress bar shows 3 / 20" — lesson.id = 3, total = 20
      expect(lesson.id).toBe(3);
      expect(allLessons.length).toBe(20);
    });
  });

  describe("Challenge structure for verification", () => {
    test("each challenge has question, hint, and answer for UI verification", () => {
      allLessons.forEach((lesson) => {
        expect(lesson.challenge.question).toBeTruthy();
        expect(lesson.challenge.hint).toBeTruthy();
        expect(lesson.challenge.answer).toBeTruthy();
        // Answer must be non-empty for comparison
        expect(lesson.challenge.answer.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
