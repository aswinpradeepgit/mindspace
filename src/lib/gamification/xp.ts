import { Expense, UserProfile } from '@/types';

export function calculateXP(
  expense: Omit<Expense, 'id' | 'xpAwarded' | 'createdAt'>,
  profile: UserProfile,
  allExpenses: Expense[]
): number {
  let xp = 10; // base for logging

  // Completed emotional check-in
  if (expense.checkIn.emotion && expense.checkIn.intent) {
    xp += 15;
  }

  // No regret
  if (expense.checkIn.regret === false) {
    xp += 5;
  }

  // First expense in this category
  const usedCategories = new Set(allExpenses.map((e) => e.category));
  if (!usedCategories.has(expense.category)) {
    xp += 30;
  }

  // Streak multiplier (applies to streak bonus portion)
  const streakMultiplier = Math.min(1 + profile.streakDays * 0.05, 3.0);
  const streakBonus = Math.floor(20 * streakMultiplier);
  xp += streakBonus;

  // 7-day streak milestone
  if (profile.streakDays > 0 && (profile.streakDays + 1) % 7 === 0) {
    xp += 50;
  }

  return xp;
}

export function calculateGoalCompleteXP(): number {
  return 100;
}

export function calculateUnderBudgetXP(): number {
  return 25;
}
