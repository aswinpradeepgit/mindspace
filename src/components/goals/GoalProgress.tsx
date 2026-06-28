'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SavingsGoal } from '@/types';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney, currencySymbol } from '@/lib/money';
import { hapticSuccess } from '@/lib/native';

const CIRCLE_R = 40;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

interface Props {
  goal: SavingsGoal;
}

export function GoalCard({ goal }: Props) {
  const deleteGoal = useExpenseStore((s) => s.deleteGoal);
  const updateGoal = useExpenseStore((s) => s.updateGoal);
  const currency = useExpenseStore((s) => s.profile.currency);
  const [add, setAdd] = useState('');

  const contribute = () => {
    const v = parseFloat(add);
    if (!v || v <= 0) return;
    const next = goal.currentAmount + Math.round(v * 100);
    hapticSuccess();
    if (next >= goal.targetAmount) {
      updateGoal(goal.id, { currentAmount: goal.targetAmount, completedAt: new Date().toISOString() });
      toast.success(`🎉 ${goal.name} reached!`);
    } else {
      updateGoal(goal.id, { currentAmount: next });
      toast.success(`Added ${formatMoney(Math.round(v * 100), currency)} to ${goal.name}`);
    }
    setAdd('');
  };

  const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const isCompleted = progress >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass p-5 space-y-4 ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg width="96" height="96" className="-rotate-90">
            <circle
              cx="48" cy="48" r={CIRCLE_R}
              fill="none"
              stroke="rgba(124,92,255,0.15)"
              strokeWidth="8"
            />
            <motion.circle
              cx="48" cy="48" r={CIRCLE_R}
              fill="none"
              stroke={isCompleted ? '#10b981' : '#7c3aed'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl">{goal.emoji}</span>
            <span className="text-xs font-bold text-slate-900">{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{goal.name}</h3>
          {isCompleted ? (
            <p className="text-sm text-emerald-600 font-medium mt-1">🎉 Goal completed!</p>
          ) : (
            <>
              <p className="text-sm text-slate-600 mt-1">
                {formatMoney(remaining, currency)} left to save
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{daysLeft} days remaining</p>
            </>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>{formatMoney(goal.currentAmount, currency)} saved</span>
            <span>/</span>
            <span>{formatMoney(goal.targetAmount, currency)} goal</span>
          </div>
        </div>
      </div>

      {!isCompleted && (
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && contribute()}
            placeholder={`Add savings (${currencySymbol(currency)})`}
            className="flex-1 bg-white px-3 py-2 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
          />
          <button
            onClick={contribute}
            disabled={!add || parseFloat(add) <= 0}
            className="px-4 rounded-xl text-sm font-semibold bg-purple-600 text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
        <button
          onClick={() => deleteGoal(goal.id)}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          remove
        </button>
      </div>
    </motion.div>
  );
}
