import { Expense, UserProfile } from '@/types';

/**
 * Cumulative money saved: for every day the user logged, how far they came
 * in *under* their daily budget. Sums only positive days. This is the tangible
 * "you actually saved this" number that makes results feel real.
 */
export function totalSaved(expenses: Expense[], profile: UserProfile): number {
  if (!profile.monthlyBudget || profile.monthlyBudget <= 0) return 0;
  const dailyBudget = profile.monthlyBudget / 30;

  const byDay: Record<string, number> = {};
  for (const e of expenses) {
    byDay[e.date] = (byDay[e.date] ?? 0) + e.amount;
  }

  let saved = 0;
  for (const spent of Object.values(byDay)) {
    if (spent < dailyBudget) saved += dailyBudget - spent;
  }
  return Math.round(saved);
}

/** Projected yearly savings if current daily pace continues. */
export function projectedYearlySavings(expenses: Expense[], profile: UserProfile): number {
  if (!profile.monthlyBudget || profile.monthlyBudget <= 0) return 0;
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((s, e) => s + e.amount, 0);
  const monthlySaving = Math.max(0, profile.monthlyBudget - thisMonth);
  return monthlySaving * 12;
}
