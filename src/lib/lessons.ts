import fs from "fs";
import path from "path";

export interface LessonCommand {
  command: string;
  description: string;
  expectedOutput: string;
  safety: "safe" | "modifies" | "caution";
  troubleshooting: string | null;
}

export interface LessonChallenge {
  question: string;
  hint: string;
  answer: string;
}

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  module: number;
  moduleName: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  objective: string;
  explanation: string;
  commands: LessonCommand[];
  challenge: LessonChallenge;
  funFact: string;
}

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

function loadLessonFile(filename: string): Lesson {
  const filePath = path.join(LESSONS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Lesson;
}

export function getAllLessons(): Lesson[] {
  const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".json"));
  files.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });
  return files.map(loadLessonFile);
}

export function getLessonById(id: number): Lesson | undefined {
  const padded = String(id).padStart(2, "0");
  const filename = `lesson-${padded}.json`;
  const filePath = path.join(LESSONS_DIR, filename);
  if (!fs.existsSync(filePath)) return undefined;
  return loadLessonFile(filename);
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  const lessons = getAllLessons();
  return lessons.find((l) => l.slug === slug);
}
