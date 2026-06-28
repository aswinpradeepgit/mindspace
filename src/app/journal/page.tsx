'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { apiFetch } from '@/lib/api';
import { formatMoney } from '@/lib/money';
import { resolveCategory } from '@/lib/categories';
import type { Emotion, Expense } from '@/types';

const EMO: Record<Emotion, { emoji: string; color: string; label: string }> = {
  joyful: { emoji: '😄', color: '#f59e0b', label: 'Joyful' },
  celebratory: { emoji: '🎉', color: '#ec4899', label: 'Celebratory' },
  content: { emoji: '😊', color: '#10b981', label: 'Content' },
  neutral: { emoji: '😐', color: '#64748b', label: 'Neutral' },
  anxious: { emoji: '😰', color: '#06b6d4', label: 'Anxious' },
  stressed: { emoji: '😤', color: '#f97316', label: 'Stressed' },
  guilty: { emoji: '😔', color: '#8b5cf6', label: 'Guilty' },
  impulsive: { emoji: '⚡', color: '#ef4444', label: 'Impulsive' },
};

function dayLabel(date: string) {
  const d = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function JournalPage() {
  const { expenses, profile } = useExpenseStore();
  const [reflection, setReflection] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ reflection: string }>('/api/v1/insights/reflection')
      .then((r) => setReflection(r.reflection))
      .catch(() => setReflection(null));
  }, []);

  const byDay = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    [...expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((e) => {
        (map[e.date] ||= []).push(e);
      });
    return Object.entries(map);
  }, [expenses]);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Journal</h1>
        <p className="text-slate-600 text-sm">Your spending, and how it felt.</p>
      </motion.div>

      {/* AI emotional reflection */}
      <div className="glass p-4 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">💭</span>
          <h3 className="text-sm font-bold text-slate-900">This week, reflected</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {reflection ?? 'Reading your week…'}
        </p>
      </div>

      {byDay.length === 0 ? (
        <div className="glass p-8 text-center">
          <div className="text-4xl mb-2">📖</div>
          <p className="text-sm text-slate-500">
            Your emotional spending story will appear here. Log an expense with the check-in to begin.
          </p>
        </div>
      ) : (
        byDay.map(([date, items]) => {
          const total = items.reduce((s, e) => s + e.amount, 0);
          const counts: Partial<Record<Emotion, number>> = {};
          for (const e of items) {
            const em = e.checkIn?.emotion;
            if (em) counts[em] = (counts[em] ?? 0) + 1;
          }
          const dominant = (Object.entries(counts).sort((a, b) => b[1]! - a[1]!)[0]?.[0]) as
            | Emotion
            | undefined;

          return (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-slate-900">
                  {dayLabel(date)} {dominant ? EMO[dominant].emoji : ''}
                </h2>
                <span className="text-xs text-slate-500">{formatMoney(total, profile.currency, { whole: true })}</span>
              </div>

              {items.map((e) => {
                const cat = resolveCategory(e.category, profile.customCategories);
                const em = e.checkIn?.emotion ? EMO[e.checkIn.emotion] : null;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-3 flex items-center gap-3 border-l-4"
                    style={{ borderLeftColor: em?.color ?? '#cbd5e1' }}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {e.description || cat.label}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        {em && (
                          <span style={{ color: em.color }}>
                            {em.emoji} {em.label}
                          </span>
                        )}
                        {e.checkIn?.regret && <span className="text-red-500">· regretted</span>}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatMoney(e.amount, profile.currency, { whole: true })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
