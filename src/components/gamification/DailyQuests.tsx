'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { getDailyQuests, questsComplete } from '@/lib/gamification/quests';

export function DailyQuests() {
  const { expenses, profile } = useExpenseStore();
  const quests = useMemo(() => getDailyQuests(expenses, profile), [expenses, profile]);
  const allDone = questsComplete(quests);
  const doneCount = quests.filter((q) => q.done).length;
  const totalXP = quests.reduce((s, q) => s + (q.done ? q.xp : 0), 0);
  const maxXP = quests.reduce((s, q) => s + q.xp, 0);

  return (
    <div className={`glass p-4 space-y-3 ${allDone ? 'border border-emerald-500/30 bg-emerald-500/5' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{allDone ? '🎉' : '⚔️'}</span>
          <h3 className="text-sm font-bold text-slate-900">Daily Quests</h3>
        </div>
        <span className="text-xs text-slate-500">{doneCount}/{quests.length} · {totalXP}/{maxXP} XP</span>
      </div>

      {allDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-emerald-600 font-medium"
        >
          All quests complete — you earned every XP today! 🔥
        </motion.p>
      )}

      <div className="space-y-2">
        {quests.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                q.done ? 'bg-emerald-500/20' : 'bg-purple-50/70'
              }`}
            >
              {q.done ? '✅' : q.icon}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium ${q.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {q.label}
              </p>
              {!q.done && q.progress > 0 && q.progress < 1 && (
                <div className="h-1 rounded-full bg-purple-50/70 mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${q.progress * 100}%` }}
                  />
                </div>
              )}
            </div>
            <span className={`text-[10px] font-bold ${q.done ? 'text-emerald-600' : 'text-purple-600'}`}>
              +{q.xp}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
