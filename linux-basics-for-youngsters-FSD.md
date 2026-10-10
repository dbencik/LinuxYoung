# Linux Basics for Youngsters - Functional Specification Document

**Status:** Ready for implementation  
**Methodology:** AICLP (AI Closed-Loop Programming)  
**Generated:** 2026-10-10  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Remotion, Puppeteer (PDF)

---

## Executive Summary

A teenager gets a Raspberry Pi or Linux computer for Christmas. No parent knows Linux, the kid has never seen it. This project delivers:

1. **Interactive Web App** — step-by-step Linux lessons with a built-in virtual terminal emulator where users can paste and run commands, see expected output, and get instant feedback.
2. **PDF eBook** — exportable, print-ready content suitable for Amazon KDP and Gumroad sales.
3. **Remotion Video Explainers** — short animated videos explaining key concepts (filesystem tree, permissions, pipes).
4. **Self-paced learning** — no instructor needed; the app guides the learner through progressively harder challenges.

**Target audience:** Teenagers (13-18) with zero Linux experience.  
**Language:** English.

---

## REQUIREMENT 1: Interactive Lesson Engine

**User Story:**  
As a teenager, I want to follow step-by-step Linux lessons with clear explanations, so that I can learn Linux on my own without needing help from anyone.

**Requirement:**  
System SHALL render a sequence of lessons, each containing:
- A title and difficulty badge (Beginner / Intermediate / Advanced)
- Markdown-formatted explanation text with syntax-highlighted code blocks
- One-click "Copy to Terminal" buttons on every command block
- A progress tracker showing completed / total lessons
- Navigation (Previous / Next) with keyboard shortcuts (← →)

**Falsifiable Test:**
```
Given: User opens lesson 3 of 20
When: User reads the page
Then: Title, explanation, and at least 1 command block are visible
      Progress bar shows "3 / 20"
      Previous button navigates to lesson 2
      Next button navigates to lesson 4
```

**Success Criterion:**
- Lesson page renders in < 1s on a 4G connection
- All 20+ lessons load without errors
- Progress persists across browser sessions (localStorage)

**Acceptance Test (Pseudocode):**
```typescript
test("lesson page renders correctly", async () => {
  render(<LessonPage lessonId={3} />);
  expect(screen.getByRole("heading")).toHaveTextContent("Lesson 3");
  expect(screen.getByTestId("progress-bar")).toHaveTextContent("3 / 20");
  expect(screen.getAllByTestId("copy-button").length).toBeGreaterThan(0);
});
```

---

## REQUIREMENT 2b: Guided Real Terminal Experience

**User Story:**  
As a teenager with a Raspberry Pi, I want to see exactly what each command should output on my real terminal, with safety warnings and troubleshooting tips, so that I can follow along confidently without fear of breaking anything.

**Requirement:**  
System SHALL display for each command in every lesson:
- One-click "Copy" button to copy command to clipboard (for pasting into real terminal)
- Expected output block showing realistic Raspberry Pi OS output
- Safety label on each command: "safe" (read-only, no changes), "modifies" (creates/changes files), or "caution" (deletes files, needs sudo, system-level)
- Troubleshooting tip per command: "If you see X instead, try Y" (at least for commands where common errors occur)
- Visual diff hint: green highlight for expected output, so user can compare with their real terminal

Each lesson's commands array SHALL include:
- `command`: the command string
- `description`: what it does in plain English
- `expectedOutput`: realistic RPi OS output
- `safety`: one of "safe" | "modifies" | "caution"
- `troubleshooting`: optional string with common error + fix (null if not applicable)

**Falsifiable Test:**
```
Given: User opens lesson 5 (Creating Files and Folders)
When: User views the "mkdir projects" command
Then: Safety label shows "modifies" (orange badge)
      Expected output is displayed in a terminal-styled block
      Copy button copies "mkdir projects" to clipboard
      If troubleshooting exists, it is shown below the expected output
```

**Success Criterion:**
- Every command in every lesson has a safety label ("safe", "modifies", or "caution")
- At least 50% of commands have a troubleshooting tip
- Expected output renders in monospace with terminal styling
- Copy button works on all modern browsers (clipboard API with fallback)

**Acceptance Test (Pseudocode):**
```typescript
test("all commands have safety labels", () => {
  const lessons = loadAllLessons();
  lessons.forEach(lesson => {
    lesson.commands.forEach(cmd => {
      expect(["safe", "modifies", "caution"]).toContain(cmd.safety);
    });
  });
});

test("at least 50% of commands have troubleshooting tips", () => {
  const lessons = loadAllLessons();
  let total = 0;
  let withTips = 0;
  lessons.forEach(lesson => {
    lesson.commands.forEach(cmd => {
      total++;
      if (cmd.troubleshooting) withTips++;
    });
  });
  expect(withTips / total).toBeGreaterThanOrEqual(0.5);
});
```

---

## REQUIREMENT 3: Lesson Content — Curriculum

**User Story:**  
As a teenager, I want lessons that go from absolute basics to useful real-world skills, so that I actually learn something practical.

**Requirement:**  
System SHALL include a minimum of 20 lessons organized into 5 modules:

| Module | Lessons | Topics |
|--------|---------|--------|
| 1. First Steps | 1-4 | What is Linux, opening terminal, pwd, ls, cd |
| 2. Files & Folders | 5-8 | touch, mkdir, cp, mv, rm, cat, nano basics |
| 3. Users & Permissions | 9-12 | whoami, chmod, chown, sudo, file permissions |
| 4. Finding & Filtering | 13-16 | grep, find, pipes, redirect, head/tail, wc |
| 5. System & Beyond | 17-20 | uname, df, du, ps, top, apt/package manager, SSH intro |

Each lesson SHALL contain:
- Objective (1 sentence)
- Explanation (200-500 words, age-appropriate English)
- 3-8 practice commands with expected output
- 1 mini-challenge ("Try it yourself") with a verifiable answer
- Fun fact or real-world context box

**Falsifiable Test:**
```
Given: All lesson JSON files in /content/lessons/
When: Validator script runs
Then: Each lesson has: title, module, objective, explanation (200-500 words),
      commands array (length 3-8), challenge object with question + answer,
      funFact string
      Total lesson count >= 20
```

**Success Criterion:**
- 20 lessons pass the validation schema
- Average Flesch-Kincaid readability score ≤ 8th grade level
- Every command in every lesson produces correct output in the virtual terminal

**Acceptance Test (Pseudocode):**
```typescript
test("all lessons pass schema validation", () => {
  const lessons = loadAllLessons();
  expect(lessons.length).toBeGreaterThanOrEqual(20);
  lessons.forEach(lesson => {
    expect(lesson.title).toBeTruthy();
    expect(lesson.explanation.split(" ").length).toBeGreaterThanOrEqual(200);
    expect(lesson.commands.length).toBeGreaterThanOrEqual(3);
    expect(lesson.challenge).toHaveProperty("question");
    expect(lesson.challenge).toHaveProperty("answer");
  });
});
```

---

## REQUIREMENT 4: PDF eBook Export

**User Story:**  
As a content creator, I want to export all lessons as a print-ready PDF, so that I can sell it on Amazon KDP and Gumroad.

**Requirement:**  
System SHALL generate a PDF eBook that:
- Includes all lesson content in print-friendly layout
- Has a cover page, table of contents, and page numbers
- Uses monospace font for command examples with syntax highlighting
- Follows Amazon KDP trim size 6"×9" with proper margins (0.75" inner, 0.5" outer)
- Generates via `npm run export:pdf` command using Puppeteer
- Output file < 20MB (KDP limit)
- Includes QR codes linking to the interactive web version of each lesson

**Falsifiable Test:**
```
Given: All 20 lessons exist in /content/lessons/
When: npm run export:pdf executes
Then: Output file /out/linux-basics-for-youngsters.pdf exists
      PDF has cover page + TOC + 20 lesson pages minimum
      File size < 20MB
      Each lesson page has at least 1 code block rendered in monospace
```

**Success Criterion:**
- PDF generates without errors in < 60s
- File size < 20MB
- All code blocks render with monospace font
- Page dimensions match 6"×9" KDP format

**Acceptance Test (Pseudocode):**
```typescript
test("PDF export generates valid file", async () => {
  await exec("npm run export:pdf");
  const stats = fs.statSync("out/linux-basics-for-youngsters.pdf");
  expect(stats.size).toBeLessThan(20 * 1024 * 1024);
  expect(stats.size).toBeGreaterThan(0);
});
```

---

## REQUIREMENT 5: Remotion Video Explainers

**User Story:**  
As a teenager, I want short animated videos explaining tricky concepts like file permissions or pipes, so that I can understand them visually.

**Requirement:**  
System SHALL include Remotion video compositions for at least 3 key concepts:
1. **Linux Filesystem Tree** — animated tree showing /, /home, /etc, /var, /usr with icons
2. **File Permissions** — rwx visualization with owner/group/other columns
3. **Pipes & Redirects** — animated data flow from command to command

Each video:
- Duration: 30-90 seconds
- Resolution: 1920×1080
- Renders via `npm run video:render`
- Embedded in corresponding lesson page as inline player
- Exportable as MP4 for YouTube / social media

**Falsifiable Test:**
```
Given: Remotion compositions exist in /src/videos/
When: npm run video:render executes
Then: 3 MP4 files generated in /out/videos/
      Each file duration is between 30s and 90s
      Each file resolution is 1920×1080
```

**Success Criterion:**
- 3 video compositions render without errors
- Each video is 30-90 seconds long
- Videos render in < 5 minutes total on CI

**Acceptance Test (Pseudocode):**
```typescript
test("video compositions exist and are valid", () => {
  const compositions = getCompositions();
  expect(compositions.length).toBeGreaterThanOrEqual(3);
  compositions.forEach(comp => {
    expect(comp.durationInFrames / comp.fps).toBeGreaterThanOrEqual(30);
    expect(comp.durationInFrames / comp.fps).toBeLessThanOrEqual(90);
    expect(comp.width).toBe(1920);
    expect(comp.height).toBe(1080);
  });
});
```

---

## REQUIREMENT 6: Market Validation & Positioning

**User Story:**  
As a content creator, I want to know if similar Linux-for-kids books exist on Amazon and what demand looks like, so that I can position my product correctly.

**Requirement:**  
Project SHALL include a market research document (`docs/market-research.md`) covering:
- Top 5 competing titles on Amazon (title, author, price, rating, review count)
- Amazon BSR (Best Sellers Rank) in relevant categories
- Keyword search volume estimates for "linux for kids", "linux for beginners teenager", "raspberry pi for kids"
- Identified gaps in existing offerings
- Recommended pricing strategy ($9.99-$14.99 eBook, $19.99-$24.99 paperback)
- Recommended KDP categories and keywords

**Falsifiable Test:**
```
Given: docs/market-research.md exists
When: Reviewer reads the document
Then: Document contains 5 competitor entries with title, price, rating
      Document contains keyword analysis section
      Document contains pricing recommendation
      Document contains category recommendations
```

**Success Criterion:**
- Market research document exists and is complete
- At least 5 competitor products analyzed
- Pricing recommendation backed by competitor data

---

## REQUIREMENT 7: Progress & Gamification

**User Story:**  
As a teenager, I want to earn badges and see my progress, so that I stay motivated to keep learning.

**Requirement:**  
System SHALL implement:
- Per-lesson completion tracking (stored in localStorage)
- Module completion badges (5 badges, one per module)
- "Linux Master" badge when all 20 lessons are completed
- XP points: +10 per lesson, +25 per challenge solved, +50 per module badge
- Leaderboard-ready score (exportable, not shared)
- Visual progress dashboard on home page

**Falsifiable Test:**
```
Given: User has completed lessons 1-4
When: User views the home page
Then: Progress shows 4/20 lessons (20%)
      Module 1 badge is unlocked and visible
      XP shows: 40 (lessons) + challenge bonuses
      Modules 2-5 badges are locked/greyed out
```

**Success Criterion:**
- Progress persists after browser refresh
- Badge unlocks trigger a congratulation animation
- XP calculation is always accurate: sum of (completed_lessons × 10) + (challenges × 25) + (modules × 50)

**Acceptance Test (Pseudocode):**
```typescript
test("progress tracking works correctly", () => {
  const progress = new ProgressTracker();
  progress.completeLesson(1);
  progress.completeLesson(2);
  expect(progress.completedCount).toBe(2);
  expect(progress.xp).toBe(20);
  
  progress.completeChallenge(1);
  expect(progress.xp).toBe(45); // 20 + 25
});
```

---

## Architecture Overview

```
LinuxYoung/
├── public/                  # Static assets
├── content/
│   └── lessons/             # Lesson JSON files (lesson-01.json ... lesson-20.json)
├── docs/
│   ├── market-research.md   # REQ 6
│   └── architecture.md      # System design
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home / dashboard
│   │   ├── lesson/[id]/     # Lesson pages
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── LessonContent.tsx # Lesson renderer (REQ 1, REQ 2b)
│   │   ├── CommandCard.tsx   # Command with safety label + troubleshooting (REQ 2b)
│   │   ├── ProgressBar.tsx   # Progress tracker (REQ 7)
│   │   ├── CopyButton.tsx    # Copy to clipboard (REQ 1)
│   │   ├── Badge.tsx         # Gamification badges (REQ 7)
│   │   └── VideoPlayer.tsx   # Remotion player embed (REQ 5)
│   ├── lib/
│   │   ├── progress.ts      # Progress & XP tracking (REQ 7)
│   │   └── lessons.ts       # Lesson loader & validator (REQ 3)
│   ├── videos/              # Remotion compositions (REQ 5)
│   │   ├── FilesystemTree.tsx
│   │   ├── FilePermissions.tsx
│   │   └── PipesRedirects.tsx
│   └── styles/
│       └── globals.css       # Tailwind + custom styles
├── scripts/
│   └── export-pdf.ts        # PDF generation script (REQ 4)
├── __tests__/               # Jest test suites
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.ts
├── package.json
└── README.md
```

---

## Notes

- Each requirement is independent and testable
- No vague language ("should", "might", "maybe")
- All assertions are specific (not "works correctly", but "count == 5")
- Timeline: 3-4 weeks for MVP (lessons + terminal + PDF)
- Phase 2: Remotion videos, gamification polish, KDP submission
- Tech stack: Next.js 14, TypeScript, Tailwind CSS, xterm.js, Remotion, Puppeteer
