import { BuiltInCategory, Category, CustomCategory } from '@/types';

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;       // CSS var or hex
  bgClass: string;     // Tailwind bg
  textClass: string;   // Tailwind text
  borderClass: string;
}

export const CATEGORIES: Record<BuiltInCategory, CategoryConfig> = {
  food: {
    label: 'Food & Drink',
    icon: '🍔',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/20',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-500/30',
  },
  transport: {
    label: 'Transport',
    icon: '🚗',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/20',
    textClass: 'text-cyan-600',
    borderClass: 'border-cyan-500/30',
  },
  entertainment: {
    label: 'Entertainment',
    icon: '🎮',
    color: '#ec4899',
    bgClass: 'bg-pink-500/20',
    textClass: 'text-pink-600',
    borderClass: 'border-pink-500/30',
  },
  health: {
    label: 'Health',
    icon: '💊',
    color: '#10b981',
    bgClass: 'bg-emerald-500/20',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-500/30',
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: '#8b5cf6',
    bgClass: 'bg-violet-500/20',
    textClass: 'text-violet-600',
    borderClass: 'border-violet-500/30',
  },
  bills: {
    label: 'Bills',
    icon: '📄',
    color: '#64748b',
    bgClass: 'bg-slate-500/20',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-500/30',
  },
  education: {
    label: 'Education',
    icon: '📚',
    color: '#7c3aed',
    bgClass: 'bg-purple-500/20',
    textClass: 'text-purple-600',
    borderClass: 'border-purple-500/30',
  },
  other: {
    label: 'Other',
    icon: '✨',
    color: '#94a3b8',
    bgClass: 'bg-slate-400/20',
    textClass: 'text-slate-500',
    borderClass: 'border-slate-400/30',
  },
};

export const CATEGORY_LIST = Object.entries(CATEGORIES).map(([id, config]) => ({
  id: id as Category,
  ...config,
}));

const FALLBACK: CategoryConfig = {
  label: 'Other',
  icon: '✨',
  color: '#94a3b8',
  bgClass: 'bg-slate-400/20',
  textClass: 'text-slate-500',
  borderClass: 'border-slate-400/30',
};

/** Convert a hex color into inline-style based config (for custom categories). */
function customConfig(c: CustomCategory): CategoryConfig {
  return {
    label: c.label,
    icon: c.icon,
    color: c.color,
    bgClass: '',
    textClass: '',
    borderClass: '',
  };
}

/** Resolve any category id (built-in or custom) into a display config. */
export function resolveCategory(id: Category, custom: CustomCategory[] = []): CategoryConfig {
  if (id in CATEGORIES) return CATEGORIES[id as BuiltInCategory];
  const found = custom.find((c) => c.id === id);
  if (found) return customConfig(found);
  return FALLBACK;
}

export const CUSTOM_CATEGORY_COLORS = [
  '#f59e0b', '#06b6d4', '#ec4899', '#10b981',
  '#8b5cf6', '#ef4444', '#3b82f6', '#14b8a6',
];

export const CUSTOM_CATEGORY_ICONS = [
  '🎯', '🐶', '🎁', '☕', '🏋️', '✈️', '🎵', '💅',
  '🌱', '🔧', '👶', '🎨', '📱', '🍷', '⛽', '💊',
];
