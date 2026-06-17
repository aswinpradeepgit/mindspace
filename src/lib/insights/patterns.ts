import { Expense, Nudge } from '@/types';

export function detectPatterns(expenses: Expense[]): Nudge[] {
  const nudges: Nudge[] = [];
  const now = new Date();

  // Last 7 days expenses
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7 = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);

  // Impulse spike
  if (recent7.length >= 5) {
    const impulsiveCount = recent7.filter(
      (e) => (e.checkIn.intent === 'habit' || e.checkIn.intent === 'want') &&
        e.checkIn.emotion === 'impulsive'
    ).length;
    if (impulsiveCount / recent7.length > 0.4) {
      nudges.push({
        message: `${impulsiveCount} of your recent purchases were impulsive. Try the 24-hour rule before non-essential buys.`,
        type: 'warning',
        trigger: 'impulse_spike',
      });
    }
  }

  // Evening spend cluster
  if (recent7.length >= 5) {
    const eveningCount = recent7.filter((e) => {
      const hour = new Date(e.createdAt).getHours();
      return hour >= 18 && hour <= 23;
    }).length;
    if (eveningCount / recent7.length > 0.6) {
      nudges.push({
        message: 'Most of your spending happens in the evenings. Consider setting a personal wind-down budget.',
        type: 'insight',
        trigger: 'evening_cluster',
      });
    }
  }

  // Category dominance (30 days)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent30 = expenses.filter((e) => new Date(e.date) >= thirtyDaysAgo);

  if (recent30.length >= 5) {
    const categoryTotals: Record<string, number> = {};
    let total = 0;
    for (const e of recent30) {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
      total += e.amount;
    }
    const dominated = Object.entries(categoryTotals).find(
      ([, amt]) => total > 0 && amt / total > 0.5
    );
    if (dominated) {
      const pct = Math.round((dominated[1] / total) * 100);
      nudges.push({
        message: `${dominated[0].charAt(0).toUpperCase() + dominated[0].slice(1)} is taking ${pct}% of your monthly spend. Consider diversifying your budget.`,
        type: 'insight',
        trigger: 'category_dominance',
      });
    }
  }

  // Regret accumulation (14 days)
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const recent14 = expenses.filter((e) => new Date(e.date) >= fourteenDaysAgo && e.checkIn.regret !== null);

  if (recent14.length >= 5) {
    const regretCount = recent14.filter((e) => e.checkIn.regret === true).length;
    const regretRate = regretCount / recent14.length;
    if (regretRate > 0.3) {
      nudges.push({
        message: `You've regretted ${Math.round(regretRate * 100)}% of your recent purchases. Let's work on more intentional spending.`,
        type: 'warning',
        trigger: 'regret_accumulation',
      });
    }
  }

  // Positive: under-budget encouragement
  if (recent7.length >= 3 && nudges.filter((n) => n.type === 'warning').length === 0) {
    nudges.push({
      message: 'Your spending patterns look healthy this week. Keep up the great discipline!',
      type: 'encouragement',
      trigger: 'positive_week',
    });
  }

  return nudges;
}
