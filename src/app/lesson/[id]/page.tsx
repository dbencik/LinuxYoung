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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="text-lg">🐧</span>
            LinuxYoung
          </a>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            Lesson {lesson.id} of {totalLessons}
          </span>
        </div>
      </nav>

      <LessonContent lesson={lesson} prevId={prevId} nextId={nextId} />
    </div>
  );
}
