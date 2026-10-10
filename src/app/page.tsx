import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import BadgeGrid from "@/components/Badge";

const modules = [
  { num: 1, name: "First Steps", description: "Open the terminal, learn who you are, and explore your first commands.", lessons: [1, 2, 3, 4], icon: "🐣" },
  { num: 2, name: "Files & Folders", description: "Navigate the filesystem, create files, and organize your directories.", lessons: [5, 6, 7, 8], icon: "📁" },
  { num: 3, name: "Users & Permissions", description: "Understand who can do what, and manage file permissions.", lessons: [9, 10, 11, 12], icon: "🔐" },
  { num: 4, name: "Finding & Filtering", description: "Search for text, find files, and connect commands with pipes.", lessons: [13, 14, 15, 16], icon: "🔍" },
  { num: 5, name: "System & Beyond", description: "System info, processes, package managers, and SSH.", lessons: [17, 18, 19, 20], icon: "⚡" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 text-5xl">🐧</div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Linux Basics for Youngsters
          </h1>
          <p className="mb-8 text-lg text-indigo-200">
            Learn Linux step by step — no experience needed
          </p>
          <Link
            href="/lesson/1"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl active:scale-95"
          >
            Start Learning
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Progress Overview */}
        <section className="mb-8">
          <ProgressBar />
        </section>

        {/* Badges */}
        <section className="mb-12 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <BadgeGrid />
        </section>

        {/* Module Cards */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Modules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <div
                key={mod.num}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{mod.icon}</div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  Module {mod.num}: {mod.name}
                </h3>
                <p className="mb-4 text-sm text-gray-500">{mod.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{mod.lessons.length} lessons</span>
                  <Link
                    href={`/lesson/${mod.lessons[0]}`}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors group-hover:bg-indigo-100"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        LinuxYoung — Learn Linux the fun way
      </footer>
    </div>
  );
}
