// Built-in category ids; custom categories are arbitrary strings too.
export type BuiltInCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'bills'
  | 'education'
  | 'other';

export type Category = BuiltInCategory | string;

export interface CustomCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export type Emotion =
  | 'joyful'
  | 'content'
  | 'neutral'
  | 'anxious'
  | 'guilty'
  | 'impulsive'
  | 'celebratory'
  | 'stressed';

export type SpendIntent =
  | 'need'
  | 'want'
  | 'treat'
  | 'social_pressure'
  | 'habit'
  | 'investment'
  | 'emergency';

export interface EmotionalCheckIn {
  emotion: Emotion;
  intent: SpendIntent;
  regret: boolean | null;
  wouldSpendLess: boolean | null;
  note?: string;
}

export interface Expense {
  id: string;
  amount: number; // in cents
  currency: string;
  category: Category;
  description: string;
  date: string; // ISO 8601 date string YYYY-MM-DD
  checkIn: EmotionalCheckIn;
  xpAwarded: number;
  tags?: string[];
  createdAt: string;
}

export type BadgeId =
  | 'first_expense'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'mindful_spender'
  | 'saver_10pct'
  | 'no_regret_week'
  | 'goal_complete'
  | 'century_expenses'
  | 'emotional_awareness'
  | 'under_budget_month'
  | 'variety_spender';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  xp: number;
  level: number;
  streakDays: number;
  lastLogDate: string | null;
  badges: Badge[];
  monthlyBudget?: number; // in cents
  currency: string;
  currencyLocked?: boolean; // user manually picked a currency
  customCategories: CustomCategory[];
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  icon: string;
  estimatedMonthlySaving?: number; // in cents
  severity: 'tip' | 'opportunity' | 'win';
}

export interface Quest {
  id: string;
  label: string;
  description: string;
  icon: string;
  xp: number;
  done: boolean;
  progress: number; // 0..1
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number; // in cents
  currentAmount: number;
  targetDate: string;
  category?: Category;
  emoji: string;
  createdAt: string;
  completedAt?: string;
}

export interface FinancialTip {
  id: string;
  title: string;
  body: string;
  category?: Category;
  trigger: 'always' | 'high_spend' | 'impulse_detected' | 'regret_high' | 'streak_broken' | 'under_budget';
}

export interface Nudge {
  message: string;
  type: 'warning' | 'encouragement' | 'insight';
  trigger: string;
}

export interface DailySummary {
  date: string;
  totalSpent: number;
  expenseCount: number;
  topCategory: Category | null;
  savingsRate: number;
  dominantEmotion: Emotion | null;
  tip?: FinancialTip;
  nudges: Nudge[];
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalSpent: number;
  avgDailySpend: number;
  savingsRate: number;
  bestDay: string | null;
  worstDay: string | null;
  categoryBreakdown: Partial<Record<Category, number>>;
  regretRate: number;
  nudges: Nudge[];
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalSpent: number;
  avgDailySpend: number;
  savingsRate: number;
  budgetUsed: number;
  savingsTrajectory: 'improving' | 'stable' | 'declining';
  topEmotionalTrigger: Emotion | null;
  categoryBreakdown: Partial<Record<Category, number>>;
  regretRate: number;
  nudges: Nudge[];
  bestWeek: string | null;
}
