import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 font-mono text-6xl font-bold text-[var(--color-glow-red)]">404</p>
      <p className="mb-2 font-mono text-lg text-[var(--color-txt)]">
        bash: page: command not found
      </p>
      <p className="mb-8 text-sm text-[var(--color-txt-muted)]">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="rounded-xl border border-[var(--color-dim-green)] bg-[var(--color-bg-green)] px-6 py-3 font-mono text-sm font-medium text-[var(--color-glow-green)] transition-all hover:bg-[var(--color-muted-green)] hover:text-[var(--color-canvas)]"
      >
        cd ~
      </Link>
    </div>
  );
}
