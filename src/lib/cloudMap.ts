'use client';

// Maps between the FastAPI backend payloads (snake_case, flattened) and the
// frontend domain types (camelCase, nested checkIn). Keeps the rest of the app
// unaware that data now comes from the cloud.

import type { Badge, CustomCategory, Expense, SavingsGoal, UserProfile } from '@/types';
import { BADGE_DEFINITIONS } from '@/lib/gamification/badges';

// ── API shapes ───────────────────────────────────────────────────────────────
export interface ApiExpense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  emotion: string | null;
  intent: string | null;
  regret: boolean | null;
  would_spend_less: boolean | null;
  xp_awarded: number;
  created_at: string;
}

export interface ApiBadge {
  badge_id: string;
  unlocked_at: string;
}

export interface ApiCustomCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface ApiProfile {
  id: string;
  name: string;
  currency: string;
  monthly_budget: number | null;
  xp: number;
  level: number;
  streak_days: number;
  last_log_date: string | null;
  badges: ApiBadge[];
  custom_categories: ApiCustomCategory[];
}

export interface ApiGoal {
  id: string;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  completed_at: string | null;
}

export interface ApiExpenseResult {
  expense: ApiExpense;
  profile: ApiProfile;
  new_badges: string[];
}

// ── API → frontend ───────────────────────────────────────────────────────────
export function toExpense(e: ApiExpense): Expense {
  return {
    id: e.id,
    amount: e.amount,
    currency: '', // display uses profile.currency; not tracked per-expense
    category: e.category,
    description: e.description,
    date: e.date,
    checkIn: {
      emotion: (e.emotion ?? 'neutral') as Expense['checkIn']['emotion'],
      intent: (e.intent ?? 'need') as Expense['checkIn']['intent'],
      regret: e.regret,
      wouldSpendLess: e.would_spend_less,
    },
    xpAwarded: e.xp_awarded,
    createdAt: e.created_at,
  };
}

export function toBadge(b: ApiBadge): Badge {
  const def = BADGE_DEFINITIONS.get(b.badge_id as Badge['id']);
  if (def) return { ...def, unlockedAt: b.unlocked_at };
  return {
    id: b.badge_id as Badge['id'],
    name: b.badge_id,
    description: '',
    emoji: '🏅',
    rarity: 'common',
    unlockedAt: b.unlocked_at,
  };
}

export function badgeIdToBadge(id: string): Badge {
  return toBadge({ badge_id: id, unlocked_at: new Date().toISOString() });
}

export function toCustomCategory(c: ApiCustomCategory): CustomCategory {
  return { id: c.id, label: c.label, icon: c.icon, color: c.color };
}

export function toProfile(p: ApiProfile): UserProfile {
  return {
    id: p.id,
    name: p.name,
    xp: p.xp,
    level: p.level,
    streakDays: p.streak_days,
    lastLogDate: p.last_log_date,
    badges: p.badges.map(toBadge),
    monthlyBudget: p.monthly_budget ?? undefined,
    currency: p.currency,
    currencyLocked: true,
    customCategories: p.custom_categories.map(toCustomCategory),
    createdAt: new Date().toISOString(),
  };
}

export function toGoal(g: ApiGoal): SavingsGoal {
  return {
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    targetAmount: g.target_amount,
    currentAmount: g.current_amount,
    targetDate: g.target_date ?? '',
    completedAt: g.completed_at ?? undefined,
    createdAt: new Date().toISOString(),
  };
}

// ── frontend → API ───────────────────────────────────────────────────────────
export function expenseDraftToBody(raw: Omit<Expense, 'id' | 'xpAwarded' | 'createdAt'>) {
  return {
    amount: raw.amount,
    category: raw.category,
    description: raw.description ?? '',
    date: raw.date,
    emotion: raw.checkIn.emotion,
    intent: raw.checkIn.intent,
    regret: raw.checkIn.regret,
    would_spend_less: raw.checkIn.wouldSpendLess,
  };
}

export function goalToBody(raw: Partial<SavingsGoal>) {
  const body: Record<string, unknown> = {};
  if (raw.name !== undefined) body.name = raw.name;
  if (raw.emoji !== undefined) body.emoji = raw.emoji;
  if (raw.targetAmount !== undefined) body.target_amount = raw.targetAmount;
  if (raw.currentAmount !== undefined) body.current_amount = raw.currentAmount;
  if (raw.targetDate !== undefined) body.target_date = raw.targetDate || null;
  if (raw.completedAt !== undefined && raw.completedAt) body.completed = true;
  return body;
}
