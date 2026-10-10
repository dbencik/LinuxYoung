# Linux Basics for Youngsters

An interactive web app that teaches teenagers Linux from zero — with a built-in virtual terminal, step-by-step lessons, and a print-ready PDF eBook.

## Features

- **20 step-by-step lessons** organized into 5 modules (First Steps to System & Beyond)
- **In-browser virtual terminal** — practice commands safely without a real Linux install
- **Progress tracking & gamification** — XP points, module badges, completion dashboard
- **PDF eBook export** — Amazon KDP-ready format (6x9 inches)
- **Animated video explainers** — Remotion compositions for tricky concepts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run test:ci` | Run tests with coverage |
| `npm run lint` | Lint code |
| `npm run validate:lessons` | Validate all lesson JSON files |
| `npm run export:pdf` | Generate KDP-ready PDF |

## Tech Stack

- **Framework:** Next.js, TypeScript
- **Styling:** Tailwind CSS
- **Terminal:** xterm.js with custom virtual filesystem
- **Videos:** Remotion
- **PDF:** Puppeteer
- **Testing:** Jest + Testing Library

## Project Structure

```
content/lessons/     # 20 lesson JSON files
src/app/             # Next.js App Router pages
src/components/      # React components (Terminal, LessonContent, etc.)
src/lib/             # Core logic (virtual-fs, command-parser, progress)
src/videos/          # Remotion video compositions
scripts/             # Build scripts (PDF export, lesson validator)
__tests__/           # Jest test suites
docs/                # Market research, architecture docs
```

## License

MIT
