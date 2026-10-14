# Handoff — LinuxYoung

**Last session:** 2026-10-14  
**Repo:** https://github.com/dbencik/LinuxYoung  
**Live:** https://linux4teens.vercel.app  
**Methodology:** AICLP (AI Closed-Loop Programming) — write acceptance tests first, then make them pass.

---

## Goal

Two learning platforms for teenagers:

1. **LinuxYoung** (`/Users/dodo/LinuxYoung`) — "Linux Basics for Youngsters" — teaches teens Linux on a Raspberry Pi. 20 lessons, 5 modules. Deployed at linux4teens.vercel.app.
2. **HackYoung** (`/Users/dodo/HackYoung`) — "Ethical Hacking for Youngsters" — teaches teens cybersecurity ethically. 24 lessons, 6 modules. Deployed at hack4teens.vercel.app. Built overnight as a second product.

Both are Next.js 14 + TypeScript + Tailwind v4 apps with dark terminal-themed UI, gamification (XP/badges), and Amazon KDP ebook export planned.

---

## Current Progress — LinuxYoung

### Completed AICLP loops (tests pass, build green, deployed)

| REQ | Description | Status |
|-----|-------------|--------|
| REQ 1 | Interactive Lesson Engine — lesson pages, navigation, keyboard shortcuts, challenge verification | **DONE** |
| REQ 2b | Guided Real Terminal Experience — safety labels (safe/modifies/caution), troubleshooting tips, expected output blocks. Replaced original REQ 2 (virtual terminal) because target user already has a Raspberry Pi. | **DONE** |
| REQ 3 | Curriculum — 20 lessons in 5 modules, validated by schema | **DONE** |
| REQ 6 | Market Research — competitor analysis with real Amazon data | **DONE** |
| REQ 7 | Progress & Gamification — XP (950 max), 10 badges, localStorage persistence | **DONE** |
| REQ 8 | Readable Typography & Contrast — min 13px, reading text 18px, max-w-[65ch], all token pairs ≥ 4.5:1 contrast | **DONE** |

### Not started

| REQ | Description | Notes |
|-----|-------------|-------|
| REQ 4 | PDF eBook Export (Puppeteer, KDP 6"x9") | Script skeleton exists at `scripts/export-pdf.ts` |
| REQ 5 | Remotion Video Explainers (3 animations) | Empty `src/videos/` directory |
| REQ 9 | Step-by-Step Lesson Flow — break lessons into steps, one screen per step, resume position | FSD written in `docs/FSD-ADDENDUM-teen-friendly-design.md`. Tests not written yet. Requires adding `steps` array to all 20 lesson JSONs. |
| REQ 10 | Visuals & Module Identity — inline SVG diagrams, module colours, lesson titles on home page | FSD written. Appendix B has diagram type per lesson. |

### Test counts
- **231 tests** across 6 suites, all passing
- Suites: `lessons.test.ts`, `progress.test.ts`, `req1-lesson-engine.test.ts`, `req2b-guided-terminal.test.ts`, `req7-gamification.test.ts`, `req8-typography.test.ts`

### QA
- Full QA report: `docs/QA-REPORT-linux4teens-2026-10-10.md` (14 bugs found)
- Retest report: `docs/QA-RETEST-linux4teens-2026-10-10.md` (13 PASS, 1 PARTIAL → fixed)
- All 14 bugs fixed and deployed

---

## Current Progress — HackYoung

| Item | Status |
|------|--------|
| FSD | Written at `ethical-hacking-for-youngsters-FSD.md` |
| 24 lessons | Done — modules: Hacker Mindset, Network Fundamentals, Scanning & Recon, WiFi & Wireless, Web & App Security, Defense & Privacy |
| Source code | Full app with LegalBanner component, safety labels (safe/active/restricted), legal notes on restricted commands |
| Tests | 14 passing |
| Build | 30 static pages |
| Deploy | hack4teens.vercel.app |
| QA | Not done yet |
| REQ 8-10 equivalent | Not applied yet (FSD Appendix A describes adjustments for HackYoung) |

---

## What Worked

- **AICLP methodology**: write tests first, then make them pass. Catches regressions immediately.
- **Parallel agents**: launching 3-4 agents to create lessons/code simultaneously saves massive time.
- **Learning from QA**: BUG-01 (Tailwind `--color-base` colliding with `text-base`) taught us to never name a colour token after a Tailwind utility suffix. Use `--color-canvas` not `--color-base`.
- **Dark theme**: teens liked the hacker terminal aesthetic much more than the original white worksheet look.
- **REQ 2b replacing REQ 2**: removing the virtual terminal (800+ lines of code) and replacing with guided real terminal (70 lines) was the right call — the user already has a real terminal.
- **Safety labels + legal warnings**: critical for HackYoung, also useful for LinuxYoung (rm, chmod are marked "caution").

## What Didn't Work

- **CSS `@import url()` after `@import "tailwindcss"`**: Tailwind v4 processes the file and the Google Fonts import ends up after generated CSS. Fix: use `next/font` instead.
- **`--color-base` as a token name**: Tailwind v4 generates `text-base { color: var(--color-base) }` which overrides `font-size: 1rem`. Renamed to `--color-canvas`.
- **`text-xs` and `text-[9-12px]`**: too small for teens, especially on phones. Minimum is 13px.
- **Hover-only tooltips**: useless on mobile. Show info inline instead.
- **`truncate` on command text**: cuts off commands on mobile with no way to read them. Use `break-all` instead.
- **Challenge validation `t.includes(r)`**: accepts empty string. Always reject empty input first.
- **Scan-line overlay**: reduces readability for no real benefit. Removed.

---

## Next Steps

### LinuxYoung — implement in order:

1. **REQ 9: Step-by-Step Lesson Flow** (biggest remaining change)
   - Read `docs/FSD-ADDENDUM-teen-friendly-design.md` for full spec
   - Write acceptance tests first (`__tests__/req9-steps.test.ts`)
   - Add `steps` array to all 20 lesson JSONs (4-8 steps each, text = explanation split)
   - Create `src/lib/steps.ts` with pure logic (buildScreens, nextIndex, prevIndex)
   - Refactor LessonContent.tsx into step-by-step view with screens
   - Add "It worked" / "I got something else" buttons to CommandCard
   - Update `scripts/validate-lessons.ts` and `src/lib/lessons.ts`
   - Run: `npm run lint && npm test && npm run build && npm run validate:lessons`
   - One commit

2. **REQ 10: Visuals & Module Identity**
   - Read FSD Appendix B for diagram types per lesson
   - Create 6 visual components in `src/components/visuals/`
   - Add `visual` to one step per lesson in all 20 JSONs
   - Add 5 module colour tokens to CSS
   - Show lesson titles (from JSON) on home page
   - Run verification, one commit

3. **REQ 4: PDF Export** — implement Puppeteer script

4. **REQ 5: Remotion Videos** — create 3+ animated compositions

### HackYoung:

5. Apply REQ 8 equivalent (font sizes, contrast)
6. Run QA (Tina agent)
7. Apply REQ 9-10 equivalent (with adjustments from Appendix A)

---

## Key Files

| File | Purpose |
|------|---------|
| `linux-basics-for-youngsters-FSD.md` | Original FSD with REQ 1-7 |
| `docs/FSD-ADDENDUM-teen-friendly-design.md` | REQ 8-10 spec |
| `docs/market-research.md` | Amazon competitor analysis |
| `docs/QA-REPORT-linux4teens-2026-10-10.md` | Original QA (14 bugs) |
| `docs/QA-RETEST-linux4teens-2026-10-10.md` | Retest (all fixed) |
| `content/lessons/lesson-*.json` | 20 lesson data files |
| `src/lib/lessons.ts` | Lesson type + loader |
| `src/lib/progress.ts` | XP, badges, localStorage |
| `src/components/LessonContent.tsx` | Main lesson renderer |
| `src/components/CommandCard.tsx` | Command with safety/troubleshooting |
| `src/app/globals.css` | Theme tokens (use --color-canvas not --color-base!) |
| `AGENTS.md` | Next.js 16 agent rules — read before writing code |

## Verification Command

```bash
npm run lint && npm test && npm run build && npx ts-node scripts/validate-lessons.ts
```

Expected: 0 lint errors, 231+ tests pass, build succeeds, 20/20 lessons valid.
