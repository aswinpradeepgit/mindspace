import { Category, Emotion, Expense, Recommendation, SpendIntent, UserProfile } from '@/types';
import { resolveCategory } from '@/lib/categories';
import { formatMoney } from '@/lib/money';

const EMOTION_LABELS: Record<Emotion, string> = {
  joyful: 'joyful', content: 'content', neutral: 'neutral', anxious: 'anxious',
  guilty: 'guilty', impulsive: 'impulsive', celebratory: 'celebratory', stressed: 'stressed',
};

const NEGATIVE_EMOTIONS: Emotion[] = ['anxious', 'guilty', 'impulsive', 'stressed'];

function lastNDays(expenses: Expense[], n: number): Expense[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n);
  return expenses.filter((e) => new Date(e.date) >= cutoff);
}

function sum(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

/**
 * The "AI Coach": analyzes the correlation between emotions, intent and spending
 * to produce specific, quantified, actionable recommendations.
 */
export function generateRecommendations(
  expenses: Expense[],
  profile: UserProfile
): Recommendation[] {
  const recs: Recommendation[] = [];
  const cur = profile.currency;
  const custom = profile.customCategories ?? [];
  const recent = lastNDays(expenses, 30);

  if (recent.length < 3) {
    recs.push({
      id: 'warmup',
      title: 'Keep logging — your coach is learning',
      body: `Log a few more expenses with the emotion check-in. After about 5 entries I can spot your personal patterns and tell you exactly where to save.`,
      icon: '🤖',
      severity: 'tip',
    });
    return recs;
  }

  const monthlyFactor = 30 / Math.min(30, daySpan(recent));

  // 1. Emotional spending correlation — strongest, most personal insight
  const byEmotion = groupBy(recent, (e) => e.checkIn.emotion);
  const emotionSpend = Object.entries(byEmotion)
    .map(([emo, list]) => ({ emo: emo as Emotion, total: sum(list), count: list.length }))
    .sort((a, b) => b.total - a.total);

  const topNegative = emotionSpend.find((e) => NEGATIVE_EMOTIONS.includes(e.emo) && e.count >= 2);
  if (topNegative) {
    const share = topNegative.total / sum(recent);
    if (share > 0.25) {
      const projectedSave = Math.round(topNegative.total * 0.5 * monthlyFactor);
      recs.push({
        id: 'emotion-spend',
        title: `You spend most when ${EMOTION_LABELS[topNegative.emo]}`,
        body: `${Math.round(share * 100)}% of your recent spending happened while feeling ${EMOTION_LABELS[topNegative.emo]}. That's emotional spending. Next time you feel this way, pause for 10 minutes before buying — even halving it could save you ${formatMoney(projectedSave, cur, { whole: true })}/month.`,
        icon: '🧠',
        estimatedMonthlySaving: projectedSave,
        severity: 'opportunity',
      });
    }
  }

  // 2. Regret-by-category — what specifically do you regret?
  const regretted = recent.filter((e) => e.checkIn.regret === true);
  if (regretted.length >= 2) {
    const byCat = groupBy(regretted, (e) => e.category);
    const worstCat = Object.entries(byCat)
      .map(([cat, list]) => ({ cat: cat as Category, total: sum(list) }))
      .sort((a, b) => b.total - a.total)[0];
    if (worstCat) {
      const cfg = resolveCategory(worstCat.cat, custom);
      const projectedSave = Math.round(worstCat.total * monthlyFactor);
      recs.push({
        id: 'regret-category',
        title: `${cfg.icon} ${cfg.label} brings the most regret`,
        body: `You've regretted ${formatMoney(worstCat.total, cur)} of ${cfg.label} spending recently. Try a simple rule: for this category, wait until tomorrow before buying. If you still want it, go ahead. You'd avoid roughly ${formatMoney(projectedSave, cur, { whole: true })}/month of regret.`,
        icon: '🎯',
        estimatedMonthlySaving: projectedSave,
        severity: 'opportunity',
      });
    }
  }

  // 3. Want vs Need balance
  const byIntent = groupBy(recent, (e) => e.checkIn.intent);
  const wantSpend = sum([...(byIntent['want'] ?? []), ...(byIntent['treat'] ?? [])]);
  const totalSpend = sum(recent);
  if (totalSpend > 0 && wantSpend / totalSpend > 0.45) {
    const projectedSave = Math.round(wantSpend * 0.2 * monthlyFactor);
    recs.push({
      id: 'want-need',
      title: 'Your "wants" are outpacing your "needs"',
      body: `${Math.round((wantSpend / totalSpend) * 100)}% of spending was on wants and treats. Treats are healthy — but trimming just 20% of them frees up about ${formatMoney(projectedSave, cur, { whole: true })}/month you could move toward a goal.`,
      icon: '⚖️',
      estimatedMonthlySaving: projectedSave,
      severity: 'opportunity',
    });
  }

  // 4. Impulse + social pressure timing
  const impulsive = recent.filter(
    (e) => e.checkIn.emotion === 'impulsive' || e.checkIn.intent === 'social_pressure'
  );
  if (impulsive.length >= 2) {
    const projectedSave = Math.round(sum(impulsive) * 0.6 * monthlyFactor);
    recs.push({
      id: 'impulse',
      title: 'Impulse & peer-driven buys detected',
      body: `${impulsive.length} purchases were impulsive or socially driven. A 24-hour cooling-off rule is the single most effective habit here — it could save you ${formatMoney(projectedSave, cur, { whole: true })}/month.`,
      icon: '⏳',
      estimatedMonthlySaving: projectedSave,
      severity: 'opportunity',
    });
  }

  // 5. A genuine win — reinforce good behavior (dopamine!)
  const noRegretShare = recent.filter((e) => e.checkIn.regret === false).length / recent.length;
  if (noRegretShare > 0.7) {
    recs.push({
      id: 'win-noregret',
      title: `${Math.round(noRegretShare * 100)}% of your spending feels worth it 🎉`,
      body: `You're spending with intention — most purchases bring no regret. This is exactly the mindset that builds wealth. Keep it up and your future self will thank you.`,
      icon: '🌟',
      severity: 'win',
    });
  }

  // Fallback positive nudge if nothing else fired
  if (recs.length === 0) {
    recs.push({
      id: 'steady',
      title: 'Your spending looks balanced',
      body: `No red flags in your recent patterns. Consider setting a savings goal to channel your discipline into something exciting.`,
      icon: '✅',
      severity: 'win',
    });
  }

  return recs.slice(0, 4);
}

/** Total potential monthly savings the coach has identified. */
export function totalOpportunity(recs: Recommendation[]): number {
  return recs.reduce((s, r) => s + (r.estimatedMonthlySaving ?? 0), 0);
}

// ── helpers ──
function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function daySpan(expenses: Expense[]): number {
  if (expenses.length === 0) return 1;
  const dates = expenses.map((e) => new Date(e.date).getTime());
  const span = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
  return Math.max(1, span);
}
