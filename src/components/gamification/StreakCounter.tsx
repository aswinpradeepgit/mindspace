'use client';

import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';

export function StreakCounter() {
  const streakDays = useExpenseStore((s) => s.profile.streakDays);

  if (streakDays === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 glass px-4 py-2 pulse-amber"
    >
      <span className="text-2xl float-anim">🔥</span>
      <div>
        <p className="text-xs text-slate-600">Current streak</p>
        <p className="text-lg font-bold text-amber-600">{streakDays} days</p>
      </div>
    </motion.div>
  );
}
