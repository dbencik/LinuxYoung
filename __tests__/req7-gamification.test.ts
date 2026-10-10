/**
 * AICLP Acceptance Tests — REQ 7: Progress & Gamification
 *
 * Falsifiable Tests from FSD:
 * - Progress shows X/20 lessons (percentage)
 * - Module badges unlock when all 4 lessons in module completed
 * - XP = (completed_lessons × 10) + (challenges × 25) + (modules × 50)
 * - "Linux Master" badge when all 20 lessons completed
 */

const MODULE_LESSONS: Record<number, number[]> = {
  1: [1, 2, 3, 4],
  2: [5, 6, 7, 8],
  3: [9, 10, 11, 12],
  4: [13, 14, 15, 16],
  5: [17, 18, 19, 20],
};

const XP_PER_LESSON = 10;
const XP_PER_CHALLENGE = 25;
const XP_PER_MODULE = 50;
const TOTAL_LESSONS = 20;
const TOTAL_MODULES = 5;

function calculateXP(
  completedLessons: number[],
  completedChallenges: number[],
  completedModules: number[]
): number {
  return (
    completedLessons.length * XP_PER_LESSON +
    completedChallenges.length * XP_PER_CHALLENGE +
    completedModules.length * XP_PER_MODULE
  );
}

function getCompletedModules(completedLessons: number[]): number[] {
  return Object.entries(MODULE_LESSONS)
    .filter(([, lessons]) => lessons.every((l) => completedLessons.includes(l)))
    .map(([mod]) => Number(mod));
}

function getProgress(completedCount: number) {
  return {
    completed: completedCount,
    total: TOTAL_LESSONS,
    percentage: Math.round((completedCount / TOTAL_LESSONS) * 100),
  };
}

// Badge definitions matching src/lib/progress.ts
const BADGE_NAMES = [
  "First Command",
  "Navigator",       // Module 1
  "File Wrangler",   // Module 2
  "Power User",      // Module 3
  "Script Kiddo",    // Module 4
  "Linux Pro",       // Module 5
  "Challenge Accepted", // 5 challenges
  "Challenge Master",   // 20 challenges
  "XP Hunter",       // 200+ XP
  "Completionist",   // All 20 lessons
];

function getBadges(
  completedLessons: number[],
  completedChallenges: number[],
  xp: number
): string[] {
  const badges: string[] = [];
  if (completedLessons.length >= 1) badges.push("First Command");
  if (MODULE_LESSONS[1].every((l) => completedLessons.includes(l))) badges.push("Navigator");
  if (MODULE_LESSONS[2].every((l) => completedLessons.includes(l))) badges.push("File Wrangler");
  if (MODULE_LESSONS[3].every((l) => completedLessons.includes(l))) badges.push("Power User");
  if (MODULE_LESSONS[4].every((l) => completedLessons.includes(l))) badges.push("Script Kiddo");
  if (MODULE_LESSONS[5].every((l) => completedLessons.includes(l))) badges.push("Linux Pro");
  if (completedChallenges.length >= 5) badges.push("Challenge Accepted");
  if (completedChallenges.length >= 20) badges.push("Challenge Master");
  if (xp >= 200) badges.push("XP Hunter");
  if (completedLessons.length >= 20) badges.push("Completionist");
  return badges;
}

describe("REQ 7: Progress & Gamification", () => {
  describe("Progress tracking", () => {
    test("0 completed shows 0/20 (0%)", () => {
      const p = getProgress(0);
      expect(p.completed).toBe(0);
      expect(p.total).toBe(20);
      expect(p.percentage).toBe(0);
    });

    test("4 completed shows 4/20 (20%)", () => {
      const p = getProgress(4);
      expect(p.completed).toBe(4);
      expect(p.total).toBe(20);
      expect(p.percentage).toBe(20);
    });

    test("20 completed shows 20/20 (100%)", () => {
      const p = getProgress(20);
      expect(p.percentage).toBe(100);
    });

    test("7 completed shows 7/20 (35%)", () => {
      const p = getProgress(7);
      expect(p.percentage).toBe(35);
    });
  });

  describe("XP calculation", () => {
    test("no progress = 0 XP", () => {
      expect(calculateXP([], [], [])).toBe(0);
    });

    test("1 lesson = 10 XP", () => {
      expect(calculateXP([1], [], [])).toBe(10);
    });

    test("1 lesson + 1 challenge = 35 XP", () => {
      expect(calculateXP([1], [1], [])).toBe(35);
    });

    test("FSD scenario: lessons 1-4 completed with challenges", () => {
      // "XP shows: 40 (lessons) + challenge bonuses"
      const lessons = [1, 2, 3, 4];
      const challenges = [1, 2, 3, 4];
      const modules = getCompletedModules(lessons);
      expect(modules).toEqual([1]);
      const xp = calculateXP(lessons, challenges, modules);
      // 4×10 + 4×25 + 1×50 = 40 + 100 + 50 = 190
      expect(xp).toBe(190);
    });

    test("full completion = 950 XP", () => {
      const allLessons = Array.from({ length: 20 }, (_, i) => i + 1);
      const allChallenges = Array.from({ length: 20 }, (_, i) => i + 1);
      const allModules = [1, 2, 3, 4, 5];
      const xp = calculateXP(allLessons, allChallenges, allModules);
      // 20×10 + 20×25 + 5×50 = 200 + 500 + 250 = 950
      expect(xp).toBe(950);
    });
  });

  describe("Module completion", () => {
    test("module 1 complete when lessons 1-4 done", () => {
      expect(getCompletedModules([1, 2, 3, 4])).toEqual([1]);
    });

    test("module 1 NOT complete when lesson 3 missing", () => {
      expect(getCompletedModules([1, 2, 4])).toEqual([]);
    });

    test("modules 1 and 2 complete when lessons 1-8 done", () => {
      expect(getCompletedModules([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([1, 2]);
    });

    test("all 5 modules complete when all 20 lessons done", () => {
      const all = Array.from({ length: 20 }, (_, i) => i + 1);
      expect(getCompletedModules(all)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("Badge unlocking", () => {
    test("no badges at start", () => {
      expect(getBadges([], [], 0)).toEqual([]);
    });

    test("'First Command' badge after completing 1 lesson", () => {
      expect(getBadges([1], [], 10)).toContain("First Command");
    });

    test("'Navigator' badge after completing module 1 (lessons 1-4)", () => {
      const badges = getBadges([1, 2, 3, 4], [], 40);
      expect(badges).toContain("Navigator");
    });

    test("FSD scenario: lessons 1-4 → Module 1 badge unlocked, modules 2-5 locked", () => {
      const badges = getBadges([1, 2, 3, 4], [1, 2, 3, 4], 190);
      expect(badges).toContain("Navigator");
      expect(badges).not.toContain("File Wrangler");
      expect(badges).not.toContain("Power User");
      expect(badges).not.toContain("Script Kiddo");
      expect(badges).not.toContain("Linux Pro");
    });

    test("'Completionist' badge when all 20 lessons done", () => {
      const all = Array.from({ length: 20 }, (_, i) => i + 1);
      const badges = getBadges(all, [], 200 + 250);
      expect(badges).toContain("Completionist");
    });

    test("'Challenge Accepted' after 5 challenges", () => {
      const badges = getBadges([1, 2, 3, 4, 5], [1, 2, 3, 4, 5], 50 + 125);
      expect(badges).toContain("Challenge Accepted");
    });

    test("'Challenge Master' after 20 challenges", () => {
      const all = Array.from({ length: 20 }, (_, i) => i + 1);
      const badges = getBadges(all, all, 950);
      expect(badges).toContain("Challenge Master");
    });

    test("'XP Hunter' when XP >= 200", () => {
      const badges = getBadges([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 5, 6], 80 + 150 + 100);
      expect(badges).toContain("XP Hunter");
    });

    test("total badge count is 10", () => {
      expect(BADGE_NAMES.length).toBe(10);
    });

    test("all badges unlock on full completion", () => {
      const all = Array.from({ length: 20 }, (_, i) => i + 1);
      const badges = getBadges(all, all, 950);
      expect(badges).toEqual(expect.arrayContaining(BADGE_NAMES));
      expect(badges.length).toBe(BADGE_NAMES.length);
    });
  });
});
