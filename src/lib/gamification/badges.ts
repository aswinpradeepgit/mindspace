import { Badge, BadgeId, Expense, UserProfile } from '@/types';

const ALL_BADGES: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'first_expense',
    name: 'First Step',
    description: 'Logged your very first expense',
    emoji: '🌱',
    rarity: 'common',
  },
  {
    id: 'streak_3',
    name: 'Getting Into It',
    description: 'Logged expenses 3 days in a row',
    emoji: '🔥',
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    emoji: '⚡',
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    name: 'Iron Discipline',
    description: 'Maintained a 30-day streak',
    emoji: '💎',
    rarity: 'legendary',
  },
  {
    id: 'mindful_spender',
    name: 'Mindful Spender',
    description: 'Less than 10% regret rate over 30 expenses',
    emoji: '🧘',
    rarity: 'rare',
  },
  {
    id: 'saver_10pct',
    name: 'Saver Initiate',
    description: 'Achieved 10% savings rate in a month',
    emoji: '💰',
    rarity: 'rare',
  },
  {
    id: 'no_regret_week',
    name: 'Zero Regrets',
    description: 'No regretted expenses in the past 7 days',
    emoji: '✨',
    rarity: 'rare',
  },
  {
    id: 'goal_complete',
    name: 'Goal Getter',
    description: 'Completed your first savings goal',
    emoji: '🏆',
    rarity: 'epic',
  },
  {
    id: 'century_expenses',
    name: 'Century Club',
    description: 'Logged 100 expenses',
    emoji: '💯',
    rarity: 'epic',
  },
  {
    id: 'emotional_awareness',
    name: 'Emotionally Aware',
    description: 'Logged expenses with 6 different emotions',
    emoji: '🌈',
    rarity: 'rare',
  },
  {
    id: 'under_budget_month',
    name: 'Budget Boss',
    description: 'Stayed under budget for an entire month',
    emoji: '🎯',
    rarity: 'epic',
  },
  {
    id: 'variety_spender',
    name: 'Well Rounded',
    description: 'Logged expenses in all 8 categories',
    emoji: '🎪',
    rarity: 'rare',
  },
];

export const BADGE_DEFINITIONS = new Map(ALL_BADGES.map((b) => [b.id, b]));

type BadgeEvaluator = (expenses: Expense[], profile: UserProfile) => boolean;

function recentRegretRate(expenses: Expense[], count: number): number {
  const recent = expenses.slice(0, count);
  if (recent.length === 0) return 0;
  return recent.filter((e) => e.checkIn.regret === true).length / recent.length;
}

function weeklyRegretCount(expenses: Expense[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return expenses
    .filter((e) => new Date(e.date) >= weekAgo)
    .filter((e) => e.checkIn.regret === true).length;
}

function uniqueEmotions(expenses: Expense[]): number {
  return new Set(expenses.map((e) => e.checkIn.emotion)).size;
}

function uniqueCategories(expenses: Expense[]): number {
  return new Set(expenses.map((e) => e.category)).size;
}

const BADGE_EVALUATORS: Record<BadgeId, BadgeEvaluator> = {
  first_expense: (e) => e.length >= 1,
  streak_3: (_, p) => p.streakDays >= 3,
  streak_7: (_, p) => p.streakDays >= 7,
  streak_30: (_, p) => p.streakDays >= 30,
  mindful_spender: (e) => e.length >= 30 && recentRegretRate(e, 30) < 0.1,
  saver_10pct: (_, p) => (p.monthlyBudget ?? 0) > 0, // evaluated externally with savings rate
  no_regret_week: (e) => e.length >= 3 && weeklyRegretCount(e) === 0,
  goal_complete: (_, p) => p.badges.some((b) => b.id === 'goal_complete' && b.unlockedAt),
  century_expenses: (e) => e.length >= 100,
  emotional_awareness: (e) => uniqueEmotions(e) >= 6,
  under_budget_month: (_, p) => p.badges.some((b) => b.id === 'under_budget_month' && b.unlockedAt),
  variety_spender: (e) => uniqueCategories(e) >= 8,
};

export function evaluateBadges(expenses: Expense[], profile: UserProfile): Badge[] {
  const unlockedIds = new Set(
    profile.badges.filter((b) => b.unlockedAt).map((b) => b.id)
  );
  const newBadges: Badge[] = [];

  for (const [id, evaluator] of Object.entries(BADGE_EVALUATORS) as [BadgeId, BadgeEvaluator][]) {
    if (unlockedIds.has(id)) continue;
    if (evaluator(expenses, profile)) {
      const def = BADGE_DEFINITIONS.get(id);
      if (def) {
        newBadges.push({ ...def, unlockedAt: new Date().toISOString() });
      }
    }
  }

  return newBadges;
}

export function getAllBadgesWithStatus(profile: UserProfile): Badge[] {
  const profileBadgeMap = new Map(profile.badges.map((b) => [b.id, b]));
  return ALL_BADGES.map((def) => {
    const profileBadge = profileBadgeMap.get(def.id);
    return profileBadge ?? def;
  });
}
