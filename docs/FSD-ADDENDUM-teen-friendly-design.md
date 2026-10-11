# FSD Addendum — Teen-Friendly Lesson Design (REQ 8–10)

**Status:** Ready for implementation
**Methodology:** AICLP (AI Closed-Loop Programming)
**Date:** 2026-10-11
**Extends:** `linux-basics-for-youngsters-FSD.md` (REQ 1, 2b, 3, 7 stay in force unless amended below)
**Applies to:** this repo (LinuxYoung). Appendix A lists what differs for HackYoung.

---

## Why

A design review on 2026-10-11 measured the deployed site (linux4teens.vercel.app, Chromium, phone 390×844 and desktop 1440×900). The lessons are correct and stable, but they read like a textbook page: small grey text, a long scroll, no pictures, and nothing to do until the challenge at the bottom.

| Metric | Measured | Target (this addendum) |
|---|---|---|
| Reading text size | 14 px (70–82 % of lesson text) | 18 px |
| Smallest visible text | 10 px on the home page, 11 px in lessons (19–28 % of lesson text is 11–12 px) | 13 px |
| Words on one lesson page | 485–894 (average 690) | ≤ 90 words of step text per screen |
| Lesson length on a phone | 3.5–5.8 screens of scrolling | one step per screen |
| First command card / challenge input | screen 1.6 / screen 4.0 (average) | first command no later than step 2 |
| Pictures, diagrams, video | 0 | ≥ 1 diagram per lesson |
| Line length on desktop | 85–103 characters | ≤ 65 characters |
| `--color-txt-muted` on `--color-card-hover` | 3.61 : 1 | ≥ 4.5 : 1 |

## Decisions already made — do not reopen

- **Audience is 13–18** (FSD). Not younger children.
- **The dark theme stays.** A light theme is out of scope.
- **No in-browser terminal.** REQ 2b (guided real terminal) stands. `README.md` still describes a virtual terminal and xterm.js; that text is stale. Do not reintroduce it.
- **Curriculum, XP values, badges and challenge validation are unchanged.**
- **Lesson wording changes only where a sentence must move or split to form a step.** No new teaching content, no rewrites for style.

## Constraints

- Read `AGENTS.md` first: this is Next.js 16 and its APIs differ from older versions.
- Tailwind v4 turns every `--color-<name>` token into `text-<name>`, `bg-<name>` and so on. A token whose name matches a size or utility suffix (`base`, `sm`, `lg`, `xs`, `xl`) silently overrides that utility. This caused BUG-01. New token names must not collide.
- Keep every existing `data-testid`: `command-card`, `copy-button`, `safety-label`, `expected-output`, `troubleshooting`, `challenge-input`, `challenge-submit`, `challenge-correct`, `challenge-wrong`, `complete-button`, `completed-badge`, `prev-button`, `next-button`.
- No new runtime dependencies. No image files: diagrams are inline SVG or HTML/CSS.
- All existing tests stay green. Write the acceptance tests for a requirement before its implementation.
- One commit per requirement, in the order 8 → 9 → 10. Each requirement is shippable on its own.

---

## REQUIREMENT 8: Readable Typography and Contrast

**User Story:**
As a teenager reading on a phone or a Raspberry Pi screen, I want text that is large and bright enough to read without effort, so that I keep reading instead of giving up.

**Requirement:**
System SHALL render text at these sizes on every viewport:

| Role | Where | Size | Colour token |
|---|---|---|---|
| Reading text | step / explanation text, lesson objective, challenge question | 18 px (`text-lg`), line-height ≥ 1.6 | `--color-txt` |
| Supporting text | command description, troubleshooting tip, hint, fun fact, module description on home | 16 px (`text-base`) | `--color-txt-secondary` or brighter |
| Command | `<code>` in the command card | ≥ 16 px | unchanged |
| Expected output | `<pre data-testid="expected-output">` | ≥ 14 px | unchanged |
| Labels | badges, section labels, counters, safety label, button text, "Expected output" | ≥ 13 px | any text token |

System SHALL NOT render any visible text below 13 px. The classes `text-xs` and `text-[9px]` through `text-[12px]` SHALL NOT appear in `src/`.

System SHALL limit reading text and supporting text to a measure of 65 characters (`max-w-[65ch]` on the text container).

System SHALL keep these contrast ratios (WCAG 2.1 relative luminance):
- `--color-txt`, `--color-txt-secondary`, `--color-txt-muted` ≥ 4.5 : 1 on each of `--color-canvas`, `--color-surface`, `--color-elevated`, `--color-card`, `--color-card-hover`, `--color-terminal`.
- `--color-glow-green`, `--color-glow-amber`, `--color-glow-red`, `--color-glow-blue`, `--color-dim-amber` ≥ 4.5 : 1 on `--color-canvas`, `--color-surface`, `--color-elevated`, `--color-terminal`.

Today only `--color-txt-muted` (#8891a5) fails: 4.21 : 1 on card, 3.61 : 1 on card-hover. `#a3abbd` passes all six surfaces (lowest 4.95 : 1).

**Falsifiable Test:**
```
Given: the source tree under src/
When: every .tsx file is scanned for font-size classes
Then: 0 matches for text-xs, text-[9px], text-[10px], text-[11px], text-[12px]
      the element holding step/explanation text has class text-lg
      the challenge question and lesson objective have class text-lg

Given: the colour tokens in src/app/globals.css
When: contrast is computed for the token pairs listed above
Then: every ratio is >= 4.5
```

**Success Criterion:**
- 0 banned font-size classes in `src/`
- 0 failing token pairs
- Measured in the browser after deploy: smallest visible text ≥ 13 px, reading text = 18 px, longest reading line ≤ 65 characters at 1440 px width

**Acceptance Test (Pseudocode):**
```typescript
test("no text below 13px in source", () => {
  const banned = /\btext-(xs|\[(9|10|11|12)px\])(?![\w-])/;
  for (const file of glob("src/**/*.tsx")) {
    expect(read(file)).not.toMatch(banned);
  }
});

test("text tokens pass 4.5:1 on every surface", () => {
  const t = parseThemeTokens("src/app/globals.css");
  const surfaces = ["canvas", "surface", "elevated", "card", "card-hover", "terminal"];
  for (const text of ["txt", "txt-secondary", "txt-muted"]) {
    for (const s of surfaces) {
      expect(contrast(t[`--color-${text}`], t[`--color-${s}`])).toBeGreaterThanOrEqual(4.5);
    }
  }
});
```

---

## REQUIREMENT 9: Step-by-Step Lesson Flow

**User Story:**
As a teenager, I want each lesson to give me one idea and one thing to try at a time, so that I am doing something within the first screen instead of reading a wall of text.

**Requirement — data:**
Each lesson JSON SHALL gain a `steps` array. `explanation` stays in the file (REQ 3 and the PDF export in REQ 4 read it).

```json
"steps": [
  { "title": "Meet cat", "text": "You have created files and directories. Now it is time to read what is inside them. …", "commands": [0, 1] },
  { "title": "Just the top: head", "text": "…", "commands": [3, 4] }
]
```

- 4 to 8 steps per lesson.
- `title`: 2 to 6 words.
- `text`: 20 to 90 words.
- `commands`: 0 to 2 indexes into the lesson's `commands` array.
- Every command index appears in exactly one step, in ascending order across steps.
- The first command appears no later than step 2.
- `steps.map(s => s.text).join(" ")` equals `explanation` after collapsing whitespace. The steps are the single source of the wording; if a sentence moves or changes, change `explanation` to match.

`scripts/validate-lessons.ts` and the `Lesson` type in `src/lib/lessons.ts` SHALL enforce the same rules.

**Requirement — screens:**
The lesson page SHALL present a lesson as a sequence of screens: Step 1 … Step N, then Challenge, then Finish. Total screens = N + 2.

- **Step view is the default.** Exactly one screen is visible. The other screens stay in the DOM with the `hidden` attribute, so the server-rendered HTML contains the full lesson text.
- The lesson header (module badge, difficulty badge, title) and a step indicator are visible on every screen. The indicator shows the text "Step 2 of 8" and a bar with `role="progressbar"`, `aria-valuemin="1"`, `aria-valuemax` = total screens, `aria-valuenow` = current screen. `data-testid="step-indicator"`.
- The lesson objective is shown on Step 1 only.
- A step screen shows: the step title as `<h2 data-testid="step-title">`, the step text, then the command cards listed in `commands`.
- The Challenge screen holds the existing challenge block, unchanged in behaviour.
- The Finish screen holds the fun fact, the existing complete button / completed badge, and the existing previous / next lesson links (`prev-button`, `next-button`).
- Every screen has a Back button (`data-testid="step-back"`, absent on Step 1) and a Next button (`data-testid="step-next"`, absent on Finish). Both are at least 44 px tall. Next is never disabled: nothing gates progress.
- On a screen change, focus moves to the new screen's heading (`tabindex="-1"`) and the page scrolls to the top of the article.
- **Keyboard:** → goes to the next screen, ← to the previous screen. On Step 1, ← opens the previous lesson; on Finish, → opens the next lesson. The existing guards stay: ignore the key when focus is in an input or textarea, when Alt, Ctrl, Meta or Shift is held, and on `event.repeat`.
- **Resume:** the current screen index per lesson is stored in `localStorage` under `linuxyoung_lesson_pos` as `{ "<lessonId>": <index> }`, read and written inside try/catch like `src/lib/progress.ts`. Opening a lesson resumes at the stored screen. A completed lesson opens at Step 1.
- **Whole-lesson view:** a toggle (`data-testid="lesson-view-toggle"`, labels "Show whole lesson" / "Show step by step") renders all screens in one scroll with no `hidden` attribute. The choice is stored in `localStorage` under `linuxyoung_lesson_view`.

**Requirement — command card (amends REQ 2b):**
Each command card SHALL show two buttons below the expected output: "It worked" (`data-testid="cmd-worked"`) and "I got something else" (`data-testid="cmd-different"`).

- "It worked" marks the card as done with a visible ✓ and `aria-pressed="true"`. The state is not persisted and does not affect XP.
- The troubleshooting tip is hidden by default and revealed by "I got something else", below the expected output, inside the existing `data-testid="troubleshooting"` element. This replaces the REQ 2b rule that the tip is always visible.
- When `troubleshooting` is `null`, "I got something else" reveals: "Check the command for typos, run it again, and compare with the expected output."

Progress, XP, badges and challenge validation (REQ 7) are unchanged.

**Falsifiable Test:**
```
Given: Lesson 6 has N steps and the user opens it for the first time
When: The page loads
Then: Indicator reads "Step 1 of N+2"
      Exactly 1 screen has no hidden attribute
      The lesson objective is visible
      A Next button is visible and no Back button exists

When: User activates Next
Then: Indicator reads "Step 2 of N+2", focus is on the step title
      localStorage linuxyoung_lesson_pos is {"6":1}

When: User activates "I got something else" on a command card
Then: The troubleshooting element for that card is visible

When: User reloads the page
Then: Indicator reads "Step 2 of N+2"
```

**Success Criterion:**
- 20 of 20 lessons have valid `steps`; `npm run validate:lessons` exits 0
- In step view exactly 1 screen is visible at any time
- The first command card is on Step 1 or Step 2 in all 20 lessons
- Measured in the browser after deploy on 390×844: every step screen is at most 2 viewport heights tall

**Acceptance Test (Pseudocode):**
```typescript
test("steps partition the explanation and the commands", () => {
  for (const lesson of loadAllLessons()) {
    const { steps, commands, explanation } = lesson;
    expect(steps.length).toBeGreaterThanOrEqual(4);
    expect(steps.length).toBeLessThanOrEqual(8);
    const norm = (s: string) => s.replace(/\s+/g, " ").trim();
    expect(norm(steps.map(s => s.text).join(" "))).toBe(norm(explanation));
    for (const s of steps) {
      expect(words(s.title)).toBeGreaterThanOrEqual(2);
      expect(words(s.title)).toBeLessThanOrEqual(6);
      expect(words(s.text)).toBeGreaterThanOrEqual(20);
      expect(words(s.text)).toBeLessThanOrEqual(90);
      expect(s.commands.length).toBeLessThanOrEqual(2);
    }
    const used = steps.flatMap(s => s.commands);
    expect(used).toEqual(commands.map((_, i) => i));          // each once, ascending
    expect(steps[0].commands.length + steps[1].commands.length).toBeGreaterThan(0);
  }
});

test("screen sequence and navigation", () => {
  const screens = buildScreens(lesson6);                      // src/lib/steps.ts
  expect(screens.map(s => s.kind)).toEqual([...Array(lesson6.steps.length).fill("step"), "challenge", "finish"]);
  expect(nextIndex(0, screens.length)).toBe(1);
  expect(prevIndex(0)).toBe(null);                            // caller opens previous lesson
  expect(nextIndex(screens.length - 1, screens.length)).toBe(null);
});
```

Put the pure logic (`buildScreens`, `nextIndex`, `prevIndex`, position storage) in `src/lib/steps.ts` so it is testable without rendering.

---

## REQUIREMENT 10: Visuals and Module Identity

**User Story:**
As a teenager, I want to see how a concept looks (a folder tree, permission bits, data flowing through a pipe), and I want modules to look different from each other, so that the course does not feel like one long grey page.

**Requirement — diagrams:**
Exactly one step in every lesson SHALL carry a `visual`:

```json
"visual": { "type": "file-tree", "caption": "Where cd Pictures takes you", "data": { } }
```

- `type` is one of: `annotated-line`, `file-tree`, `permission-bits`, `flow`, `file-window`, `meter`.
- Each type is a React component in `src/components/visuals/`, driven by `data`. Define `visual` in `src/lib/lessons.ts` as a discriminated union on `type`.
- Components render inline SVG or HTML/CSS, use only colour tokens, have `role="img"` and `aria-label` equal to `caption`, and show the caption as visible text below the diagram.
- Text inside a diagram is ≥ 13 px at 390 px viewport width. The diagram is at most 320 px tall and never causes horizontal page scroll.
- At least 5 of the 6 types are used across the 20 lessons. Appendix B gives the default type per lesson.
- The step renders the visual between the step text and the command cards.

These diagrams are static. They do not replace the Remotion videos in REQ 5.

**Requirement — module colours:**
System SHALL define five tokens and use them for the module icon tile and module label on the home page, the module badge in the lesson header, and the fill of the step progress bar:

| Token | Default | Module |
|---|---|---|
| `--color-module-1` | `#39ff85` | First Steps |
| `--color-module-2` | `#5c9aff` | Files & Folders |
| `--color-module-3` | `#ffb347` | Users & Permissions |
| `--color-module-4` | `#c58bff` | Finding & Filtering |
| `--color-module-5` | `#4fd8e6` | System & Beyond |

Each token SHALL have ≥ 4.5 : 1 contrast on `--color-canvas`, `--color-surface` and `--color-elevated` (the defaults pass; lowest is 5.32 : 1). Safety labels and correct / wrong feedback keep their current semantic colours.

**Requirement — lesson titles on the home page:**
Each row in a module's lesson list SHALL show the lesson number and title, for example "6 · Reading Files". Today it shows "Lesson 6" only. Titles SHALL come from the lesson JSON through a server component; do not copy them into `page.tsx`.

**Falsifiable Test:**
```
Given: All lesson JSON files
When: Validator runs
Then: Every lesson has exactly 1 step with a visual
      Every visual.type is one of the 6 allowed values
      Every caption has at least 3 words
      At least 5 distinct types are used

Given: User opens the home page
When: Module 2 is visible
Then: Its lesson list contains the text "Reading Files"
      Its icon tile uses --color-module-2
```

**Success Criterion:**
- 20 of 20 lessons render a diagram with `role="img"` and a non-empty `aria-label`
- ≥ 5 diagram types in use
- 5 module tokens defined, all passing 4.5 : 1 on the three surfaces
- Home page lists 20 lesson titles

**Acceptance Test (Pseudocode):**
```typescript
test("every lesson has one valid visual", () => {
  const types = new Set<string>();
  for (const lesson of loadAllLessons()) {
    const visuals = lesson.steps.filter(s => s.visual).map(s => s.visual);
    expect(visuals.length).toBe(1);
    expect(VISUAL_TYPES).toContain(visuals[0].type);
    expect(words(visuals[0].caption)).toBeGreaterThanOrEqual(3);
    types.add(visuals[0].type);
  }
  expect(types.size).toBeGreaterThanOrEqual(5);
});

test("each visual component is labelled", () => {
  for (const sample of SAMPLE_VISUALS) {                       // one per type
    render(<Visual {...sample} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(sample.caption);
  }
});
```

---

## Verification

Run before each commit:

```bash
npm run lint
npm test
npm run build
npm run validate:lessons
```

After deploy, QA re-measures the table in "Why" in a browser (390×844 and 1440×900) and re-runs the retest checklist in `docs/QA-REPORT-linux4teens-2026-10-10.md`.

## Out of scope

- Light theme and theme toggle
- Mascot or illustrated characters (needs a design decision and an illustrator)
- In-browser terminal
- Changes to curriculum, XP, badges or challenge validation
- Remotion videos (REQ 5) and PDF export (REQ 4)
- Testing with real teenagers. This addendum is expert judgement backed by measurement. Before or after shipping, watch two or three 13–18 year olds work through one lesson for ten minutes and note where they stop reading.

---

## Appendix A — HackYoung (hack4teens.vercel.app)

HackYoung is a separate repo with the same page structure. It was measured from the outside only; its source was not reviewed. Apply REQ 8–10 there with these differences:

| Item | HackYoung measured | Adjustment |
|---|---|---|
| Lessons | 24 in 6 modules | six module tokens; add `--color-module-6` |
| Words per lesson | 702–2 050 (average 1 254) | allow 4 to 10 steps per lesson |
| Lesson length on a phone | 4.2–10.8 screens | same one-step-per-screen rule |
| Home page text below 4.5 : 1 | 63 % of characters | the muted text colour `#6b7590` is 4.26 : 1 on the page background; raise it until REQ 8 passes |
| Red LEGAL WARNING block above the lesson title | on 16 of 24 lessons (5–20), first thing on the page | keep the text and the "understood" acknowledgement, but show it as its own first screen in step view |

## Appendix B — Default diagram per lesson

Change a type if another fits the lesson's content better; keep at least 5 types in use.

| Lesson | Diagram | Type |
|---|---|---|
| 1 What is Linux? | The parts of the prompt `youngster@pi:~ $` | `annotated-line` |
| 2 Where Am I? | Folder tree with the current directory marked | `file-tree` |
| 3 Listing Files Like a Pro | One `ls -l` line with each column named | `annotated-line` |
| 4 The Home Directory | Tree showing an absolute and a relative path to the same folder | `file-tree` |
| 5 Creating Files and Folders | Tree before and after `mkdir -p` | `file-tree` |
| 6 Reading Files | A 12-line file with the `head` and `tail` ranges marked | `file-window` |
| 7 Copying and Moving | Tree before and after `cp` and `mv` | `file-tree` |
| 8 Deleting Files and Folders | Tree before and after `rm -r` | `file-tree` |
| 9 Who Are You? | The `id` output with uid, gid and groups named | `annotated-line` |
| 10 Understanding File Permissions | `-rwxr-x---` split into type, owner, group, other | `permission-bits` |
| 11 Changing Permissions | The same bits before and after `chmod 600`, with the octal digits | `permission-bits` |
| 12 Sudo — The Superpower | You → sudo → root → command | `flow` |
| 13 Finding Text with Grep | A file with the matching lines highlighted | `file-window` |
| 14 Finding Files | Tree with the files `find` returns highlighted | `file-tree` |
| 15 Pipes — Connecting Commands | `cat` → `grep` → `wc -l` with the data shrinking at each stage | `flow` |
| 16 Redirecting Output | Command output going to a file with `>` and `>>` | `flow` |
| 17 Your System Info | Disk used and free as bars | `meter` |
| 18 Processes | One `ps aux` line with PID, CPU and command named | `annotated-line` |
| 19 Installing Software | Package repository → `apt` → your Pi | `flow` |
| 20 SSH — Remote Access | Your computer and the Pi with an encrypted link between them | `flow` |
