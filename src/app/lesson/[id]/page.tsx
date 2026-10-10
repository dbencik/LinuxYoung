import { notFound } from "next/navigation";
import { getAllLessons, getLessonById } from "@/lib/lessons";
import LessonContent from "@/components/LessonContent";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const lessons = getAllLessons();
  return lessons.map((lesson) => ({
    id: String(lesson.id),
  }));
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = getLessonById(Number(id));
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `Lesson ${lesson.id}: ${lesson.title} — LinuxYoung`,
    description: lesson.objective,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lessonId = Number(id);
  const lesson = getLessonById(lessonId);

  if (!lesson) notFound();

  const allLessons = getAllLessons();
  const totalLessons = allLessons.length;

  const prevId = lessonId > 1 ? lessonId - 1 : null;
  const nextId = lessonId < totalLessons ? lessonId + 1 : null;

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav aria-label="Site navigation" className="sticky top-0 z-10 border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas)]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <a href="/" className="flex items-center gap-2 px-2 py-1 font-mono text-xs font-medium text-[var(--color-txt-muted)] transition-colors hover:text-[var(--color-glow-green)]">
            <span className="text-[var(--color-glow-green)]">~</span>
            LinuxYoung
          </a>
          <span className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)] px-3 py-1 font-mono text-xs font-medium text-[var(--color-txt-muted)]">
            {lesson.id}/{totalLessons}
          </span>
        </div>
      </nav>

      <main>
        <LessonContent lesson={lesson} prevId={prevId} nextId={nextId} />
      </main>
    </div>
  );
}
