import fs from "fs";
import path from "path";

interface LessonCommand {
  command: string;
  description: string;
  expectedOutput: string;
}

interface Lesson {
  id: number;
  slug: string;
  title: string;
  module: number;
  moduleName: string;
  difficulty: string;
  objective: string;
  explanation: string;
  commands: LessonCommand[];
  challenge: {
    question: string;
    hint: string;
    answer: string;
  };
  funFact: string;
}

const LESSONS_DIR = path.join(__dirname, "../content/lessons");

function loadAllLessons(): Lesson[] {
  const files = fs
    .readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(LESSONS_DIR, f), "utf-8")));
}

describe("Lesson content validation", () => {
  const lessons = loadAllLessons();

  test("at least 20 lessons exist", () => {
    expect(lessons.length).toBeGreaterThanOrEqual(20);
  });

  test.each(lessons.map((l) => [l.id, l]))("lesson %i has required fields", (_id, lesson) => {
    const l = lesson as Lesson;
    expect(l.id).toBeGreaterThan(0);
    expect(l.slug).toBeTruthy();
    expect(l.title).toBeTruthy();
    expect(l.module).toBeGreaterThanOrEqual(1);
    expect(l.module).toBeLessThanOrEqual(5);
    expect(l.moduleName).toBeTruthy();
    expect(["Beginner", "Intermediate", "Advanced"]).toContain(l.difficulty);
    expect(l.objective).toBeTruthy();
  });

  test.each(lessons.map((l) => [l.id, l]))("lesson %i explanation is 200-500 words", (_id, lesson) => {
    const l = lesson as Lesson;
    const wordCount = l.explanation.split(/\s+/).length;
    expect(wordCount).toBeGreaterThanOrEqual(200);
    expect(wordCount).toBeLessThanOrEqual(500);
  });

  test.each(lessons.map((l) => [l.id, l]))("lesson %i has 3-8 commands", (_id, lesson) => {
    const l = lesson as Lesson;
    expect(l.commands.length).toBeGreaterThanOrEqual(3);
    expect(l.commands.length).toBeLessThanOrEqual(8);
  });

  test.each(lessons.map((l) => [l.id, l]))("lesson %i commands have required fields", (_id, lesson) => {
    const l = lesson as Lesson;
    l.commands.forEach((cmd) => {
      expect(cmd.command).toBeTruthy();
      expect(cmd.description).toBeTruthy();
      expect(cmd).toHaveProperty("expectedOutput");
    });
  });

  test.each(lessons.map((l) => [l.id, l]))("lesson %i has a challenge", (_id, lesson) => {
    const l = lesson as Lesson;
    expect(l.challenge.question).toBeTruthy();
    expect(l.challenge.hint).toBeTruthy();
    expect(l.challenge.answer).toBeTruthy();
  });

  test.each(lessons.map((l) => [l.id, l]))("lesson %i has a fun fact", (_id, lesson) => {
    const l = lesson as Lesson;
    expect(l.funFact).toBeTruthy();
    expect(l.funFact.length).toBeGreaterThan(20);
  });

  test("lessons cover all 5 modules", () => {
    const modules = new Set(lessons.map((l) => l.module));
    expect(modules.size).toBe(5);
    [1, 2, 3, 4, 5].forEach((m) => expect(modules.has(m)).toBe(true));
  });

  test("lesson IDs are unique and sequential", () => {
    const ids = lessons.map((l) => l.id).sort((a, b) => a - b);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(ids[0]).toBe(1);
    expect(ids[ids.length - 1]).toBe(ids.length);
  });

  test("lesson slugs are unique", () => {
    const slugs = lessons.map((l) => l.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });
});
