const STORAGE_KEY_LESSONS = "linuxyoung_completed_lessons";
const STORAGE_KEY_CHALLENGES = "linuxyoung_completed_challenges";

const XP_PER_LESSON = 10;
const XP_PER_CHALLENGE = 25;
const XP_PER_MODULE = 50;
const LESSONS_PER_MODULE = 4;
const TOTAL_MODULES = 5;

function getSet(key: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function completeLesson(id: number): void {
  const set = getSet(STORAGE_KEY_LESSONS);
  set.add(id);
  saveSet(STORAGE_KEY_LESSONS, set);
}

export function completeChallenge(id: number): void {
  const set = getSet(STORAGE_KEY_CHALLENGES);
  set.add(id);
  saveSet(STORAGE_KEY_CHALLENGES, set);
}

export function getCompletedLessons(): number[] {
  return [...getSet(STORAGE_KEY_LESSONS)].sort((a, b) => a - b);
}

export function getCompletedChallenges(): number[] {
  return [...getSet(STORAGE_KEY_CHALLENGES)].sort((a, b) => a - b);
}

function getLessonsForModule(moduleNum: number): number[] {
  const start = (moduleNum - 1) * LESSONS_PER_MODULE + 1;
  return Array.from({ length: LESSONS_PER_MODULE }, (_, i) => start + i);
}

export function isModuleComplete(moduleNum: number): boolean {
  const completed = getSet(STORAGE_KEY_LESSONS);
  const moduleLessons = getLessonsForModule(moduleNum);
  return moduleLessons.every((id) => completed.has(id));
}

export function getXP(): number {
  const completedLessons = getSet(STORAGE_KEY_LESSONS);
  const completedChallenges = getSet(STORAGE_KEY_CHALLENGES);

  let xp = completedLessons.size * XP_PER_LESSON;
  xp += completedChallenges.size * XP_PER_CHALLENGE;

  for (let m = 1; m <= TOTAL_MODULES; m++) {
    if (isModuleComplete(m)) {
      xp += XP_PER_MODULE;
    }
  }

  return xp;
}

const BADGES: { name: string; check: () => boolean }[] = [
  {
    name: "First Command",
    check: () => getSet(STORAGE_KEY_LESSONS).size >= 1,
  },
  {
    name: "Navigator",
    check: () => isModuleComplete(1),
  },
  {
    name: "File Wrangler",
    check: () => isModuleComplete(2),
  },
  {
    name: "Power User",
    check: () => isModuleComplete(3),
  },
  {
    name: "Script Kiddo",
    check: () => isModuleComplete(4),
  },
  {
    name: "Linux Pro",
    check: () => isModuleComplete(5),
  },
  {
    name: "Challenge Accepted",
    check: () => getSet(STORAGE_KEY_CHALLENGES).size >= 5,
  },
  {
    name: "Challenge Master",
    check: () => getSet(STORAGE_KEY_CHALLENGES).size >= 20,
  },
  {
    name: "XP Hunter",
    check: () => getXP() >= 200,
  },
  {
    name: "Completionist",
    check: () => getSet(STORAGE_KEY_LESSONS).size >= 20,
  },
];

export function getBadges(): string[] {
  return BADGES.filter((b) => b.check()).map((b) => b.name);
}
