'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { currencySymbol } from '@/lib/money';
import { toast } from 'sonner';

const GOAL_EMOJIS = ['🏠', '✈️', '💻', '🚗', '💍', '📚', '🎮', '💰', '🏖️', '🎓', '🏋️', '🎸'];

interface Props {
  onClose: () => void;
}

export function GoalForm({ onClose }: Props) {
  const addGoal = useExpenseStore((s) => s.addGoal);
  const currency = useExpenseStore((s) => s.profile.currency);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [emoji, setEmoji] = useState('💰');

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !targetDate) return;
    await addGoal({
      name,
      targetAmount: Math.round(parseFloat(amount) * 100),
      currentAmount: 0,
      targetDate,
      emoji,
    });
    toast.success('Goal created! 🎯');
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass p-5 space-y-4"
    >
      <h3 className="font-semibold text-slate-900">New Savings Goal</h3>

      {/* Emoji picker */}
      <div className="flex flex-wrap gap-2">
        {GOAL_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            className={`text-xl p-1.5 rounded-lg transition-all ${emoji === e ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'hover:bg-purple-50/70'}`}
          >
            {e}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Goal name (e.g. New Laptop)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full glass px-4 py-3 text-sm text-slate-900 outline-none rounded-xl border border-purple-100"
        required
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-slate-600 mb-1 block">Target Amount ({currencySymbol(currency)})</label>
          <input
            type="number"
            placeholder="0.00"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full glass px-4 py-3 text-sm text-slate-900 outline-none rounded-xl border border-purple-100"
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-600 mb-1 block">Target Date</label>
          <input
            type="date"
            min={minDateStr}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full glass px-4 py-3 text-sm text-slate-900 outline-none rounded-xl border border-purple-100"
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm text-slate-600 bg-purple-50/70 hover:bg-purple-100 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all"
        >
          Create Goal 🎯
        </button>
      </div>
    </motion.form>
  );
}
