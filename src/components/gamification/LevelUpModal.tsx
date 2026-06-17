'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { getLevelInfo } from '@/lib/gamification/levels';

export function LevelUpModal() {
  const leveledUpTo = useExpenseStore((s) => s.leveledUpTo);
  const clearLevelUp = useExpenseStore((s) => s.clearLevelUp);

  useEffect(() => {
    if (leveledUpTo) {
      import('canvas-confetti').then(({ default: confetti }) => {
        const burst = () =>
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'],
          });
        burst();
        setTimeout(burst, 250);
      });
      const t = setTimeout(clearLevelUp, 5000);
      return () => clearTimeout(t);
    }
  }, [leveledUpTo, clearLevelUp]);

  if (!leveledUpTo) return null;
  const info = getLevelInfo(leveledUpTo);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={clearLevelUp}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
      >
        <motion.div
          initial={{ scale: 0.6, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="glass p-8 text-center space-y-4 max-w-xs w-full"
          style={{ border: `1px solid ${info.color}60`, boxShadow: `0 0 60px ${info.color}40` }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600">Level Up!</p>
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl font-bold"
            style={{ background: `${info.color}25`, border: `4px solid ${info.color}`, color: info.color }}
          >
            {leveledUpTo}
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">{info.title}</h2>
            <p className="text-sm text-slate-600 mt-1">You reached Level {leveledUpTo}!</p>
          </div>
          <p className="text-xs text-slate-500">Your discipline is paying off. Keep going! 💪</p>
          <button
            onClick={clearLevelUp}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
