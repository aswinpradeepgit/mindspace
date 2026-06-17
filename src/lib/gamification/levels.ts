export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  nextLevelXP: number;
  color: string;
}

const LEVEL_TITLES = [
  'Apprentice',
  'Aware Spender',
  'Budget Beginner',
  'Mindful Tracker',
  'Conscious Buyer',
  'Smart Saver',
  'Focused Spender',
  'Frugal Thinker',
  'Money Mentor',
  'Financial Sage',
  'Wealth Builder',
  'Savings Champion',
  'Budget Master',
  'Investment Expert',
  'Wealth Architect',
];

const LEVEL_COLORS = [
  '#7c5cff', // purple - levels 1-3
  '#2dd4a7', // emerald - levels 4-6
  '#00c2d1', // cyan - levels 7-9
  '#ff5fa2', // pink - levels 10-12
  '#ffb020', // amber - levels 13+
];

export function xpForLevel(n: number): number {
  if (n <= 1) return 0;
  return Math.floor(100 * Math.pow(n - 1, 1.6));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) {
    level++;
    if (level >= 50) break;
  }
  return level;
}

export function getLevelInfo(level: number): LevelInfo {
  const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
  const colorIndex = Math.floor((level - 1) / 3);
  const colorKey = Math.min(colorIndex, LEVEL_COLORS.length - 1);

  return {
    level,
    title: LEVEL_TITLES[titleIndex],
    minXP: xpForLevel(level),
    nextLevelXP: xpForLevel(level + 1),
    color: LEVEL_COLORS[colorKey],
  };
}

export function getXPProgress(xp: number): { current: number; min: number; max: number; percent: number } {
  const level = getLevelFromXP(xp);
  const min = xpForLevel(level);
  const max = xpForLevel(level + 1);
  return {
    current: xp - min,
    min,
    max: max - min,
    percent: ((xp - min) / (max - min)) * 100,
  };
}
