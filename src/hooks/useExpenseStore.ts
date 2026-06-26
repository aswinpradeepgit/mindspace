'use client';

import { create } from 'zustand';
import { Badge, CustomCategory, Expense, SavingsGoal, UserProfile } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  ApiExpense,
  ApiExpenseResult,
  ApiGoal,
  ApiProfile,
  badgeIdToBadge,
  expenseDraftToBody,
  goalToBody,
  toExpense,
  toGoal,
  toProfile,
} from '@/lib/cloudMap';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default',
  name: 'You',
  xp: 0,
  level: 1,
  streakDays: 0,
  lastLogDate: null,
  badges: [],
  currency: 'INR',
  currencyLocked: false,
  customCategories: [],
  createdAt: new Date().toISOString(),
};

interface ExpenseStoreState {
  expenses: Expense[];
  goals: SavingsGoal[];
  profile: UserProfile;
  draftExpense: Partial<Expense> | null;
  hydrated: boolean;
  newBadges: Badge[];
  leveledUpTo: number | null;
  // actions
  hydrate: () => Promise<void>;
  reset: () => void;
  setCurrency: (code: string) => void;
  addCustomCategory: (cat: Omit<CustomCategory, 'id'>) => void;
  clearLevelUp: () => void;
  addExpense: (raw: Omit<Expense, 'id' | 'xpAwarded' | 'createdAt'>) => Promise<Badge[]>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setDraft: (draft: Partial<Expense> | null) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearNewBadges: () => void;
  unlockBadge: (badgeId: string) => void;
}

export const useExpenseStore = create<ExpenseStoreState>()((set, get) => ({
  expenses: [],
  goals: [],
  profile: DEFAULT_PROFILE,
  draftExpense: null,
  hydrated: false,
  newBadges: [],
  leveledUpTo: null,

  hydrate: async () => {
    // Load everything for the signed-in user from the cloud.
    const [profile, expenses, goals] = await Promise.all([
      apiFetch<ApiProfile>('/api/v1/profile'),
      apiFetch<ApiExpense[]>('/api/v1/expenses'),
      apiFetch<ApiGoal[]>('/api/v1/goals'),
    ]);
    set({
      profile: toProfile(profile),
      expenses: expenses.map(toExpense),
      goals: goals.map(toGoal),
      hydrated: true,
    });
  },

  reset: () =>
    set({
      expenses: [],
      goals: [],
      profile: DEFAULT_PROFILE,
      hydrated: false,
      newBadges: [],
      leveledUpTo: null,
      draftExpense: null,
    }),

  setCurrency: (code) => {
    const profile = get().profile;
    set({ profile: { ...profile, currency: code, currencyLocked: true } });
    apiFetch('/api/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify({ currency: code }),
    }).catch(() => {});
  },

  addCustomCategory: (cat) => {
    // Optimistic insert; reconcile id from the server response.
    const tempId = `tmp_${crypto.randomUUID().slice(0, 8)}`;
    const profile = get().profile;
    set({
      profile: {
        ...profile,
        customCategories: [...(profile.customCategories ?? []), { ...cat, id: tempId }],
      },
    });
    apiFetch<{ id: string }>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    })
      .then((res) => {
        const p = get().profile;
        set({
          profile: {
            ...p,
            customCategories: (p.customCategories ?? []).map((c) =>
              c.id === tempId ? { ...c, id: res.id } : c
            ),
          },
        });
      })
      .catch(() => {});
  },

  clearLevelUp: () => set({ leveledUpTo: null }),

  addExpense: async (raw) => {
    const prevLevel = get().profile.level;
    const result = await apiFetch<ApiExpenseResult>('/api/v1/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseDraftToBody(raw)),
    });

    const profile = toProfile(result.profile);
    const newBadges = result.new_badges.map(badgeIdToBadge);

    set({
      expenses: [toExpense(result.expense), ...get().expenses],
      profile,
      draftExpense: null,
      newBadges,
      leveledUpTo: profile.level > prevLevel ? profile.level : null,
    });

    return newBadges;
  },

  updateExpense: async (id, updates) => {
    // No backend PATCH yet — update locally (used by the deferred-regret banner).
    const { expenses } = get();
    set({ expenses: expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)) });
  },

  deleteExpense: async (id) => {
    set({ expenses: get().expenses.filter((e) => e.id !== id) });
    await apiFetch(`/api/v1/expenses/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  setDraft: (draft) => set({ draftExpense: draft }),

  addGoal: async (raw) => {
    const created = await apiFetch<ApiGoal>('/api/v1/goals', {
      method: 'POST',
      body: JSON.stringify(goalToBody(raw)),
    });
    set({ goals: [toGoal(created), ...get().goals] });
  },

  updateGoal: async (id, updates) => {
    const updated = await apiFetch<ApiGoal>(`/api/v1/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(goalToBody(updates)),
    });
    set({ goals: get().goals.map((g) => (g.id === id ? toGoal(updated) : g)) });
    // Completing a goal awards XP server-side — refresh the profile to reflect it.
    if (updated.completed_at) {
      apiFetch<ApiProfile>('/api/v1/profile')
        .then((p) => set({ profile: toProfile(p) }))
        .catch(() => {});
    }
  },

  deleteGoal: async (id) => {
    set({ goals: get().goals.filter((g) => g.id !== id) });
    await apiFetch(`/api/v1/goals/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  updateProfile: (updates) => {
    const profile = { ...get().profile, ...updates };
    set({ profile });
    const body: Record<string, unknown> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.currency !== undefined) body.currency = updates.currency;
    if (updates.monthlyBudget !== undefined) body.monthly_budget = updates.monthlyBudget;
    if (Object.keys(body).length) {
      apiFetch('/api/v1/profile', { method: 'PATCH', body: JSON.stringify(body) }).catch(
        () => {}
      );
    }
  },

  clearNewBadges: () => set({ newBadges: [] }),

  unlockBadge: (badgeId) => {
    const { profile } = get();
    if (profile.badges.find((b) => b.id === badgeId)?.unlockedAt) return;
    set({
      profile: { ...profile, badges: [...profile.badges, badgeIdToBadge(badgeId)] },
    });
  },
}));
