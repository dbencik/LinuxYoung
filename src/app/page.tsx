import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import BadgeGrid from "@/components/Badge";

const modules = [
  { num: 1, name: "First Steps", description: "Terminal, pwd, ls, cd — your first commands.", lessons: [1, 2, 3, 4], icon: ">" },
  { num: 2, name: "Files & Folders", description: "Create, read, copy, move, delete — own the filesystem.", lessons: [5, 6, 7, 8], icon: "~" },
  { num: 3, name: "Users & Permissions", description: "Who you are, what you can do, chmod & sudo.", lessons: [9, 10, 11, 12], icon: "#" },
  { num: 4, name: "Finding & Filtering", description: "grep, find, pipes — connect commands like a pro.", lessons: [13, 14, 15, 16], icon: "|" },
  { num: 5, name: "System & Beyond", description: "Processes, packages, SSH — real sysadmin skills.", lessons: [17, 18, 19, 20], icon: "$" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-[var(--color-border-subtle)] px-4 pb-16 pt-20">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--color-txt-muted) 1px, transparent 1px), linear-gradient(90deg, var(--color-txt-muted) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orb */}
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-glow-green)] opacity-[0.04] blur-[120px]" />

        <div className="relative mx-auto max-w-4xl">
          {/* Terminal prompt */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-2">
            <span className="font-mono text-xs text-[var(--color-glow-green)]">youngster@pi</span>
            <span className="font-mono text-xs text-[var(--color-txt-muted)]">:</span>
            <span className="font-mono text-xs text-[var(--color-glow-blue)]">~</span>
            <span className="font-mono text-xs text-[var(--color-txt-muted)]">$</span>
            <span className="font-mono text-xs text-[var(--color-txt)]">./learn-linux</span>
            <span className="inline-block h-4 w-[2px] bg-[var(--color-glow-green)] cursor-blink" />
          </div>

          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-[var(--color-txt)] sm:text-6xl lg:text-7xl">
            Linux Basics
            <br />
            <span className="bg-gradient-to-r from-[var(--color-glow-green)] to-[var(--color-dim-green)] bg-clip-text text-transparent">
              for Youngsters
            </span>
          </h1>

          <p className="mb-10 max-w-lg text-lg font-light text-[var(--color-txt-secondary)]">
            20 hands-on lessons. Your Raspberry Pi. No experience needed.
            <br />
            <span className="text-[var(--color-txt-muted)]">Master the terminal one command at a time.</span>
          </p>

          <Link
            href="/lesson/1"
            className="group inline-flex items-center gap-3 rounded-xl border border-[var(--color-dim-green)] bg-gradient-to-b from-[var(--color-dim-green)] to-[var(--color-muted-green)] px-8 py-4 font-semibold text-[var(--color-canvas)] shadow-[var(--glow-green)] transition-all hover:shadow-[0_0_30px_rgba(57,255,133,0.3)] active:scale-[0.98]"
          >
            <span className="font-mono text-sm opacity-60">$</span>
            Start Learning
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Progress */}
        <section className="fade-up mb-8" style={{ animationDelay: "0.1s" }}>
          <ProgressBar />
        </section>

        {/* Badges */}
        <section className="fade-up mb-12 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6" style={{ animationDelay: "0.2s" }}>
          <BadgeGrid />
        </section>

        {/* Modules */}
        <section className="fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
            <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-[var(--color-txt-muted)]">
              Modules
            </h2>
            <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          </div>

          <div className="grid gap-3">
            {modules.map((mod, i) => (
              <Link
                key={mod.num}
                href={`/lesson/${mod.lessons[0]}`}
                className="fade-up group flex items-center gap-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-card)]"
                style={{ animationDelay: `${0.35 + i * 0.08}s` }}
              >
                {/* Module number */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-elevated)] font-mono text-lg font-bold text-[var(--color-glow-green)] transition-all group-hover:border-[var(--color-muted-green)] group-hover:shadow-[var(--glow-green)]">
                  {mod.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--color-txt-muted)]">
                      Module {mod.num}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-txt)] group-hover:text-[var(--color-glow-green)] transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-sm text-[var(--color-txt-muted)]">{mod.description}</p>
                </div>

                {/* Lesson count + arrow */}
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-xs text-[var(--color-txt-muted)]">{mod.lessons.length} lessons</span>
                  <svg className="h-4 w-4 text-[var(--color-txt-muted)] transition-all group-hover:translate-x-1 group-hover:text-[var(--color-glow-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] px-4 py-8 text-center">
        <p className="font-mono text-xs text-[var(--color-txt-muted)]">
          youngster@pi:~$ <span className="text-[var(--color-dim-green)]">echo</span> &quot;Made for curious minds&quot;
        </p>
      </footer>
    </div>
  );
}
