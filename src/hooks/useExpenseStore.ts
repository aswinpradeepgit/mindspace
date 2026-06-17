'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Badge, CustomCategory, Expense, SavingsGoal, UserProfile } from '@/types';
import { detectCurrency } from '@/lib/money';
import {
  addExpenseToDB,
  updateExpenseInDB,
  deleteExpenseFromDB,
  getAllExpenses,
  getAllGoals,
  addGoalToDB,
  updateGoalInDB,
  deleteGoalFromDB,
} from '@/lib/db';
import { calculateXP } from '@/lib/gamification/xp';
import { getLevelFromXP } from '@/lib/gamification/levels';
import { evaluateBadges } from '@/lib/gamification/badges';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default',
  name: 'You',
  xp: 0,
  level: 1,
  streakDays: 0,
  lastLogDate: null,
  badges: [],
  currency: 'USD',
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

function updateStreak(profile: UserProfile, today: string): Partial<UserProfile> {
  if (!profile.lastLogDate) {
    return { streakDays: 1, lastLogDate: today };
  }
  const last = new Date(profile.lastLogDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor(
    (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return {}; // same day, no change
  if (diffDays === 1) return { streakDays: profile.streakDays + 1, lastLogDate: today };
  return { streakDays: 1, lastLogDate: today }; // streak broken
}

export const useExpenseStore = create<ExpenseStoreState>()(
  persist(
    (set, get) => ({
      expenses: [],
      goals: [],
      profile: DEFAULT_PROFILE,
      draftExpense: null,
      hydrated: false,
      newBadges: [],
      leveledUpTo: null,

      hydrate: async () => {
        if (get().hydrated) return;
        const [expenses, goals] = await Promise.all([getAllExpenses(), getAllGoals()]);
        const profile = get().profile;
        // Auto-detect currency the first time, unless the user has set one.
        const patch: Partial<UserProfile> = {};
        if (!profile.currencyLocked && profile.currency === 'USD') {
          patch.currency = detectCurrency();
        }
        if (!profile.customCategories) patch.customCategories = [];
        set({
          expenses,
          goals,
          hydrated: true,
          profile: { ...profile, ...patch },
        });
      },

      setCurrency: (code) => {
        set({ profile: { ...get().profile, currency: code, currencyLocked: true } });
      },

      addCustomCategory: (cat) => {
        const newCat: CustomCategory = { ...cat, id: `custom_${crypto.randomUUID().slice(0, 8)}` };
        const profile = get().profile;
        set({
          profile: {
            ...profile,
            customCategories: [...(profile.customCategories ?? []), newCat],
          },
        });
      },

      clearLevelUp: () => set({ leveledUpTo: null }),

      addExpense: async (raw) => {
        const { profile, expenses } = get();
        const today = raw.date;
        const streakUpdate = updateStreak(profile, today);
        const updatedProfile = { ...profile, ...streakUpdate };

        const xpAwarded = calculateXP(raw, updatedProfile, expenses);
        const expense: Expense = {
          ...raw,
          id: crypto.randomUUID(),
          xpAwarded,
          createdAt: new Date().toISOString(),
        };

        await addExpenseToDB(expense);

        const newExpenses = [expense, ...expenses];
        const prevLevel = updatedProfile.level;
        const newXP = updatedProfile.xp + xpAwarded;
        const newLevel = getLevelFromXP(newXP);
        const finalProfile: UserProfile = {
          ...updatedProfile,
          xp: newXP,
          level: newLevel,
        };

        const newBadges = evaluateBadges(newExpenses, finalProfile);
        const allBadges = [
          ...finalProfile.badges.filter((b) => !newBadges.find((nb) => nb.id === b.id)),
          ...newBadges,
        ];

        set({
          expenses: newExpenses,
          profile: { ...finalProfile, badges: allBadges },
          draftExpense: null,
          newBadges,
          leveledUpTo: newLevel > prevLevel ? newLevel : null,
        });

        return newBadges;
      },

      updateExpense: async (id, updates) => {
        const { expenses } = get();
        const existing = expenses.find((e) => e.id === id);
        if (!existing) return;
        const updated = { ...existing, ...updates };
        await updateExpenseInDB(updated);
        set({ expenses: expenses.map((e) => (e.id === id ? updated : e)) });
      },

      deleteExpense: async (id) => {
        await deleteExpenseFromDB(id);
        set({ expenses: get().expenses.filter((e) => e.id !== id) });
      },

      setDraft: (draft) => set({ draftExpense: draft }),

      addGoal: async (raw) => {
        const goal: SavingsGoal = {
          ...raw,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        await addGoalToDB(goal);
        set({ goals: [...get().goals, goal] });
      },

      updateGoal: async (id, updates) => {
        const { goals } = get();
        const existing = goals.find((g) => g.id === id);
        if (!existing) return;
        const updated = { ...existing, ...updates };
        await updateGoalInDB(updated);
        set({ goals: goals.map((g) => (g.id === id ? updated : g)) });
      },

      deleteGoal: async (id) => {
        await deleteGoalFromDB(id);
        set({ goals: get().goals.filter((g) => g.id !== id) });
      },

      updateProfile: (updates) => {
        set({ profile: { ...get().profile, ...updates } });
      },

      clearNewBadges: () => set({ newBadges: [] }),

      unlockBadge: (badgeId) => {
        const { profile } = get();
        const existing = profile.badges.find((b) => b.id === badgeId);
        if (existing?.unlockedAt) return;
        const updated = profile.badges.map((b) =>
          b.id === badgeId ? { ...b, unlockedAt: new Date().toISOString() } : b
        );
        set({ profile: { ...profile, badges: updated } });
      },
    }),
    {
      name: 'expense-tracker-profile',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (s) => ({ profile: s.profile }),
    }
  )
);
