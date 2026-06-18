'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Badge } from '@/types';
import { getAllBadgesWithStatus } from '@/lib/gamification/badges';
import { useExpenseStore } from '@/hooks/useExpenseStore';

const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#06b6d4',
  epic: '#7c3aed',
  legendary: '#f59e0b',
};

function BadgeCard({ badge }: { badge: Badge }) {
  const isUnlocked = !!badge.unlockedAt;
  const color = RARITY_COLORS[badge.rarity];
  // Unlocked badges glow in their rarity color; locked ones pulse in a soft
  // muted purple, slower — alive but dormant, enticing the user to earn them.
  const glow = isUnlocked ? color : '#a78bfa';

  const glowVars = {
    '--badge-glow-soft': `${glow}${isUnlocked ? '40' : '20'}`,
    '--badge-glow-strong': `${glow}${isUnlocked ? '99' : '45'}`,
    '--badge-border-soft': `${glow}${isUnlocked ? '55' : '30'}`,
    '--badge-border-strong': `${glow}${isUnlocked ? 'cc' : '66'}`,
    '--badge-speed': isUnlocked ? '2.4s' : '3.8s',
  } as CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`badge-alive relative flex flex-col items-center gap-2 p-4 rounded-2xl border ${
        isUnlocked ? 'bg-purple-50/70' : 'bg-purple-50/40 opacity-80'
      }`}
      style={glowVars}
    >
      {isUnlocked && (
        <div
          className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
        />
      )}
      <span className={`text-3xl relative z-10 ${isUnlocked ? 'float-anim' : 'grayscale opacity-50'}`}>
        {isUnlocked ? badge.emoji : '🔒'}
      </span>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-800 leading-tight">{badge.name}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{badge.description}</p>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
        style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}
      >
        {badge.rarity}
      </span>
      {isUnlocked && badge.unlockedAt && (
        <p className="text-[9px] text-slate-400">
          {new Date(badge.unlockedAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

export function BadgeGrid() {
  const profile = useExpenseStore((s) => s.profile);
  const allBadges = getAllBadgesWithStatus(profile);
  const unlocked = allBadges.filter((b) => b.unlockedAt);
  const locked = allBadges.filter((b) => !b.unlockedAt);

  return (
    <div className="space-y-6">
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3">Unlocked ({unlocked.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {unlocked.map((b) => <BadgeCard key={b.id} badge={b} />)}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Locked ({locked.length})</h3>
        <div className="grid grid-cols-2 gap-3">
          {locked.map((b) => <BadgeCard key={b.id} badge={b} />)}
        </div>
      </div>
    </div>
  );
}
