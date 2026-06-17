'use client';

import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { getLevelInfo, getXPProgress } from '@/lib/gamification/levels';

export function XPBar() {
  const { xp, level } = useExpenseStore((s) => s.profile);
  const levelInfo = getLevelInfo(level);
  const progress = getXPProgress(xp);

  return (
    <div className="glass p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: levelInfo.color + '30', color: levelInfo.color, border: `1px solid ${levelInfo.color}50` }}
          >
            LVL {level}
          </span>
          <span className="text-sm font-semibold text-slate-800">{levelInfo.title}</span>
        </div>
        <span className="text-xs text-slate-500">{xp.toLocaleString()} XP</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-purple-50/70">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}aa)` }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress.percent, 100)}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{
            width: `${Math.min(progress.percent, 100)}%`,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{progress.current.toLocaleString()} / {progress.max.toLocaleString()} XP to next level</span>
        <span>{Math.round(progress.percent)}%</span>
      </div>
    </div>
  );
}
