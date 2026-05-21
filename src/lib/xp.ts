export interface XpResult {
  base: number;
  speedBonus: number;
  accuracyBonus: number;
  winBonus: number;
  streakBonus: number;
  total: number;
}

export const levelTitles = [
  { level: 1, title: "Шинэхэн" },
  { level: 10, title: "Хурдан гар" },
  { level: 25, title: "Төмөр хуруу" },
  { level: 50, title: "Keyboard Master" }
];

export function getLevelTitle(level: number) {
  return [...levelTitles].reverse().find((entry) => level >= entry.level)?.title ?? "Шинэхэн";
}

export function xpForLevel(level: number) {
  if (level <= 1) {
    return 0;
  }

  return Math.round(450 * Math.pow(level - 1, 1.42));
}

export function levelFromXp(xp: number) {
  let level = 1;

  while (xp >= xpForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

export function progressToNextLevel(xp: number) {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);

  return ((xp - current) / (next - current)) * 100;
}

export function calculateRaceXp({
  wpm,
  accuracy,
  won,
  streak
}: {
  wpm: number;
  accuracy: number;
  won: boolean;
  streak: number;
}): XpResult {
  const base = 75;
  const speedBonus = Math.round(Math.max(wpm - 25, 0) * 1.9);
  const accuracyBonus = Math.round(Math.max(accuracy - 80, 0) * 4.2);
  const winBonus = won ? 160 : 0;
  const streakBonus = Math.min(streak * 18, 180);

  return {
    base,
    speedBonus,
    accuracyBonus,
    winBonus,
    streakBonus,
    total: base + speedBonus + accuracyBonus + winBonus + streakBonus
  };
}
