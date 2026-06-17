'use client';

import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { XPBar } from '@/components/gamification/XPBar';
import { getLevelInfo, xpForLevel } from '@/lib/gamification/levels';

export default function LeaderboardPage() {
  const { profile, expenses } = useExpenseStore();
  const levelInfo = getLevelInfo(profile.level);

  const unlockedBadges = profile.badges.filter((b) => b.unlockedAt);

  const stats = [
    { label: 'Total XP', value: profile.xp.toLocaleString(), icon: '⚡' },
    { label: 'Level', value: profile.level, icon: '🏅' },
    { label: 'Streak', value: `${profile.streakDays}d`, icon: '🔥' },
    { label: 'Badges', value: unlockedBadges.length, icon: '🏆' },
    { label: 'Logged', value: expenses.length, icon: '📝' },
    {
      label: 'Regret Rate',
      value: (() => {
        const withRegret = expenses.filter((e) => e.checkIn.regret !== null);
        if (!withRegret.length) return 'N/A';
        const rate = withRegret.filter((e) => e.checkIn.regret).length / withRegret.length;
        return `${Math.round(rate * 100)}%`;
      })(),
      icon: '💭',
    },
  ];

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Your Progress</h1>
        <p className="text-slate-600 text-sm">Every badge tells a story about your growth.</p>
      </motion.div>

      {/* Level card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="glass p-6 text-center space-y-3"
        style={{ border: `1px solid ${levelInfo.color}40` }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold"
          style={{ background: `${levelInfo.color}20`, border: `3px solid ${levelInfo.color}`, color: levelInfo.color }}
        >
          {profile.level}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{levelInfo.title}</h2>
          <p className="text-sm text-slate-600">{profile.xp.toLocaleString()} XP total</p>
        </div>
        <p className="text-xs text-slate-500">
          {(xpForLevel(profile.level + 1) - profile.xp).toLocaleString()} XP to level {profile.level + 1}
        </p>
      </motion.div>

      {/* XP Bar */}
      <XPBar />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="glass p-3 text-center"
          >
            <span className="text-xl block">{stat.icon}</span>
            <p className="text-lg font-bold text-slate-900 mt-1">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Badge Collection</h2>
        <BadgeGrid />
      </motion.div>
    </div>
  );
}
