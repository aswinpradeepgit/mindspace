import { Category, DailySummary, Emotion, Expense, MonthlySummary, Nudge, WeeklySummary } from '@/types';
import { detectPatterns } from './patterns';
import { selectTip } from './education';

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function topByCount<T extends string>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const item of items) counts[item] = (counts[item] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as T;
}

export function buildDailySummary(
  expenses: Expense[],
  date: string,
  monthlyBudget?: number
): DailySummary {
  const dayExpenses = expenses.filter((e) => e.date === date);
  const totalSpent = dayExpenses.reduce((s, e) => s + e.amount, 0);
  const dailyBudget = monthlyBudget ? monthlyBudget / 30 : 0;
  const savingsRate = dailyBudget > 0 ? Math.max(0, 1 - totalSpent / dailyBudget) : 0;

  const nudges: Nudge[] = [];
  if (dailyBudget > 0 && totalSpent > dailyBudget) {
    nudges.push({
      message: `You overspent your daily budget by $${((totalSpent - dailyBudget) / 100).toFixed(2)}.`,
      type: 'warning',
      trigger: 'over_daily_budget',
    });
  }

  const trigger = totalSpent > (dailyBudget * 1.5 || 5000) ? 'high_spend' : 'always';

  return {
    date,
    totalSpent,
    expenseCount: dayExpenses.length,
    topCategory: topByCount(dayExpenses.map((e) => e.category)) as Category | null,
    savingsRate,
    dominantEmotion: topByCount(dayExpenses.map((e) => e.checkIn.emotion)) as Emotion | null,
    tip: selectTip(trigger),
    nudges,
  };
}

export function buildWeeklySummary(
  expenses: Expense[],
  weekStart: string,
  monthlyBudget?: number
): WeeklySummary {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const weekExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });

  const totalSpent = weekExpenses.reduce((s, e) => s + e.amount, 0);
  const weeklyBudget = monthlyBudget ? (monthlyBudget / 30) * 7 : 0;
  const savingsRate = weeklyBudget > 0 ? Math.max(0, 1 - totalSpent / weeklyBudget) : 0;

  // Daily breakdown
  const dailyTotals: Record<string, number> = {};
  for (const e of weekExpenses) {
    dailyTotals[e.date] = (dailyTotals[e.date] ?? 0) + e.amount;
  }
  const days = Object.entries(dailyTotals);
  const bestDay = days.length > 0 ? days.sort((a, b) => a[1] - b[1])[0][0] : null;
  const worstDay = days.length > 0 ? days.sort((a, b) => b[1] - a[1])[0][0] : null;

  const categoryBreakdown: Partial<Record<Category, number>> = {};
  for (const e of weekExpenses) {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] ?? 0) + e.amount;
  }

  const withRegret = weekExpenses.filter((e) => e.checkIn.regret !== null);
  const regretRate = withRegret.length > 0
    ? withRegret.filter((e) => e.checkIn.regret === true).length / withRegret.length
    : 0;

  return {
    weekStart,
    weekEnd: isoDate(end),
    totalSpent,
    avgDailySpend: totalSpent / 7,
    savingsRate,
    bestDay,
    worstDay,
    categoryBreakdown,
    regretRate,
    nudges: detectPatterns(weekExpenses),
  };
}

export function buildMonthlySummary(
  expenses: Expense[],
  month: string, // YYYY-MM
  monthlyBudget?: number
): MonthlySummary {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const budgetUsed = monthlyBudget && monthlyBudget > 0 ? totalSpent / monthlyBudget : 0;
  const savingsRate = monthlyBudget && monthlyBudget > 0 ? Math.max(0, 1 - budgetUsed) : 0;

  // Trajectory: compare to prior 2 months
  const [year, mon] = month.split('-').map(Number);
  const prior1 = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === mon - 1;
  });
  const prior2 = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === mon - 2;
  });

  const totalPrior1 = prior1.reduce((s, e) => s + e.amount, 0);
  const totalPrior2 = prior2.reduce((s, e) => s + e.amount, 0);

  let savingsTrajectory: 'improving' | 'stable' | 'declining' = 'stable';
  if (totalPrior1 > 0 && totalPrior2 > 0) {
    if (totalSpent < totalPrior1 && totalPrior1 < totalPrior2) savingsTrajectory = 'improving';
    else if (totalSpent > totalPrior1 && totalPrior1 > totalPrior2) savingsTrajectory = 'declining';
  } else if (totalPrior1 > 0) {
    if (totalSpent < totalPrior1) savingsTrajectory = 'improving';
    else if (totalSpent > totalPrior1) savingsTrajectory = 'declining';
  }

  const categoryBreakdown: Partial<Record<Category, number>> = {};
  for (const e of monthExpenses) {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] ?? 0) + e.amount;
  }

  const withRegret = monthExpenses.filter((e) => e.checkIn.regret !== null);
  const regretRate = withRegret.length > 0
    ? withRegret.filter((e) => e.checkIn.regret === true).length / withRegret.length
    : 0;

  // Best week
  const weekTotals: Record<string, number> = {};
  for (const e of monthExpenses) {
    const d = new Date(e.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = isoDate(weekStart);
    weekTotals[key] = (weekTotals[key] ?? 0) + e.amount;
  }
  const bestWeek = Object.entries(weekTotals).sort((a, b) => a[1] - b[1])[0]?.[0] ?? null;

  return {
    month,
    totalSpent,
    avgDailySpend: totalSpent / 30,
    savingsRate,
    budgetUsed,
    savingsTrajectory,
    topEmotionalTrigger: topByCount(monthExpenses.map((e) => e.checkIn.emotion)) as Emotion | null,
    categoryBreakdown,
    regretRate,
    nudges: detectPatterns(monthExpenses),
    bestWeek,
  };
}
