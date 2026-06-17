'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/types';
import { useExpenseStore } from '@/hooks/useExpenseStore';

const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#06b6d4',
  epic: '#7c3aed',
  legendary: '#f59e0b',
};

export function AchievementToast() {
  const newBadges = useExpenseStore((s) => s.newBadges);
  const clearNewBadges = useExpenseStore((s) => s.clearNewBadges);
  const [showing, setShowing] = useState<Badge | null>(null);
  const [queue, setQueue] = useState<Badge[]>([]);

  useEffect(() => {
    if (newBadges.length > 0) {
      setQueue((q) => [...q, ...newBadges]);
      clearNewBadges();
    }
  }, [newBadges, clearNewBadges]);

  useEffect(() => {
    if (!showing && queue.length > 0) {
      const [next, ...rest] = queue;
      setShowing(next);
      setQueue(rest);
      const timer = setTimeout(() => setShowing(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [showing, queue]);

  useEffect(() => {
    if (showing) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.3 },
          colors: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899'],
        });
      });
    }
  }, [showing]);

  const color = showing ? RARITY_COLORS[showing.rarity] : '#7c3aed';

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          key={showing.id}
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-80"
        >
          <div
            className="glass p-6 flex flex-col items-center gap-3 text-center"
            style={{ border: `1px solid ${color}50`, boxShadow: `0 0 40px ${color}30` }}
          >
            <div
              className="absolute inset-0 rounded-[var(--radius)] opacity-10 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
            />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 relative z-10">
              🎉 Badge Unlocked!
            </p>
            <span className="text-6xl float-anim relative z-10">{showing.emoji}</span>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-slate-900">{showing.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{showing.description}</p>
            </div>
            <span
              className="relative z-10 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}
            >
              {showing.rarity}
            </span>
            <button
              onClick={() => setShowing(null)}
              className="relative z-10 text-xs text-slate-500 hover:text-slate-700 mt-1"
            >
              tap to dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
