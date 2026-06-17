'use client';

import { motion } from 'framer-motion';
import { Expense } from '@/types';
import { resolveCategory } from '@/lib/categories';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney } from '@/lib/money';

const EMOTION_EMOJI: Record<string, string> = {
  joyful: '😄', content: '😊', neutral: '😐', anxious: '😰',
  guilty: '😔', impulsive: '⚡', celebratory: '🎉', stressed: '😤',
};

interface Props {
  expense: Expense;
  index?: number;
}

export function ExpenseCard({ expense, index = 0 }: Props) {
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const currency = useExpenseStore((s) => s.profile.currency);
  const custom = useExpenseStore((s) => s.profile.customCategories ?? []);
  const cat = resolveCategory(expense.category, custom);
  const isBuiltIn = !!cat.bgClass;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass flex items-center gap-3 p-4"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bgClass}`}
        style={isBuiltIn ? undefined : { background: `${cat.color}25` }}
      >
        <span className="text-xl">{cat.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-900 truncate">{expense.description}</p>
          <span className="text-base">{EMOTION_EMOJI[expense.checkIn.emotion]}</span>
          {expense.checkIn.regret === true && (
            <span title="Regretted" className="text-xs">😟</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-[10px] font-medium ${cat.textClass}`}
            style={isBuiltIn ? undefined : { color: cat.color }}
          >{cat.label}</span>
          <span className="text-[10px] text-slate-400">•</span>
          <span className="text-[10px] text-slate-500">{expense.date}</span>
          <span className="text-[10px] text-purple-600">+{expense.xpAwarded} XP</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-900">
          {formatMoney(expense.amount, currency)}
        </p>
        <button
          onClick={() => deleteExpense(expense.id)}
          className="text-[10px] text-slate-400 hover:text-red-500 transition-colors mt-0.5"
        >
          remove
        </button>
      </div>
    </motion.div>
  );
}
