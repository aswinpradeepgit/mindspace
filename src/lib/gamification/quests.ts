import { Expense, Quest, UserProfile } from '@/types';

/**
 * Daily quests refresh each day and give a small dopamine loop:
 * concrete, achievable goals with XP rewards.
 */
export function getDailyQuests(expenses: Expense[], profile: UserProfile): Quest[] {
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter((e) => e.date === today);

  const loggedToday = todayExpenses.length > 0;
  const checkedInToday = todayExpenses.some(
    (e) => e.checkIn.emotion && e.checkIn.intent
  );
  const reflectedToday = todayExpenses.some((e) => e.checkIn.regret !== null);

  // Under daily budget quest
  const dailyBudget = profile.monthlyBudget ? profile.monthlyBudget / 30 : 0;
  const spentToday = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const underBudget = dailyBudget > 0 && spentToday <= dailyBudget;

  const quests: Quest[] = [
    {
      id: 'log',
      label: 'Log an expense',
      description: 'Track at least one purchase today',
      icon: '✍️',
      xp: 10,
      done: loggedToday,
      progress: loggedToday ? 1 : 0,
    },
    {
      id: 'checkin',
      label: 'Complete a check-in',
      description: 'Connect a purchase to your emotion',
      icon: '💭',
      xp: 15,
      done: checkedInToday,
      progress: checkedInToday ? 1 : 0,
    },
    {
      id: 'reflect',
      label: 'Reflect honestly',
      description: 'Answer the regret reflection',
      icon: '🪞',
      xp: 5,
      done: reflectedToday,
      progress: reflectedToday ? 1 : 0,
    },
  ];

  if (dailyBudget > 0) {
    quests.push({
      id: 'budget',
      label: 'Stay under budget',
      description: 'Keep today within your daily budget',
      icon: '🎯',
      xp: 25,
      done: underBudget && loggedToday,
      progress: dailyBudget > 0 ? Math.min(spentToday / dailyBudget, 1) : 0,
    });
  }

  return quests;
}

export function questsComplete(quests: Quest[]): boolean {
  return quests.length > 0 && quests.every((q) => q.done);
}
