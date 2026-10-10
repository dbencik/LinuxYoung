/**
 * Progress tracking tests
 * Note: These test the logic, not localStorage (which requires jsdom setup)
 */

// Simple progress logic test without browser dependencies
describe("Progress XP calculation", () => {
  function calculateXP(
    completedLessons: number[],
    completedChallenges: number[],
    completedModules: number[]
  ): number {
    return (
      completedLessons.length * 10 +
      completedChallenges.length * 25 +
      completedModules.length * 50
    );
  }

  const MODULE_LESSONS: Record<number, number[]> = {
    1: [1, 2, 3, 4],
    2: [5, 6, 7, 8],
    3: [9, 10, 11, 12],
    4: [13, 14, 15, 16],
    5: [17, 18, 19, 20],
  };

  function getCompletedModules(completedLessons: number[]): number[] {
    return Object.entries(MODULE_LESSONS)
      .filter(([, lessons]) => lessons.every((l) => completedLessons.includes(l)))
      .map(([mod]) => Number(mod));
  }

  test("no progress gives 0 XP", () => {
    expect(calculateXP([], [], [])).toBe(0);
  });

  test("completing a lesson gives 10 XP", () => {
    expect(calculateXP([1], [], [])).toBe(10);
  });

  test("completing a challenge gives 25 XP", () => {
    expect(calculateXP([], [1], [])).toBe(25);
  });

  test("completing lesson + challenge gives 35 XP", () => {
    expect(calculateXP([1], [1], [])).toBe(35);
  });

  test("completing a module gives 50 XP bonus", () => {
    expect(calculateXP([1, 2, 3, 4], [1, 2, 3, 4], [1])).toBe(
      4 * 10 + 4 * 25 + 50
    );
  });

  test("module 1 is complete when lessons 1-4 are done", () => {
    expect(getCompletedModules([1, 2, 3, 4])).toEqual([1]);
  });

  test("module 1 is not complete when lesson 3 is missing", () => {
    expect(getCompletedModules([1, 2, 4])).toEqual([]);
  });

  test("all modules complete gives 250 XP bonus", () => {
    const allLessons = Array.from({ length: 20 }, (_, i) => i + 1);
    const modules = getCompletedModules(allLessons);
    expect(modules).toEqual([1, 2, 3, 4, 5]);
    expect(calculateXP(allLessons, allLessons, modules)).toBe(
      20 * 10 + 20 * 25 + 5 * 50
    );
  });

  test("full completion XP is 950", () => {
    // 20 lessons × 10 = 200
    // 20 challenges × 25 = 500
    // 5 modules × 50 = 250
    // Total = 950
    const allLessons = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(calculateXP(allLessons, allLessons, [1, 2, 3, 4, 5])).toBe(950);
  });
});
