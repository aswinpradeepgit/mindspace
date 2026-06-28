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
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ds = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

interface DayInfo {
  dominant: Emotion | null;
  total: number;
  regret: boolean;
  count: number;
}

export default function JournalPage() {
  const { expenses, profile } = useExpenseStore();
  const [offset, setOffset] = useState(0); // months back from current
  const [selected, setSelected] = useState<string | null>(null);
  const [persona, setPersona] = useState<{ archetype: string; emoji: string; why: string } | null>(null);

  useEffect(() => {
    apiFetch<{ archetype: string; emoji: string; why: string }>('/api/v1/insights/personality')
      .then(setPersona)
      .catch(() => setPersona(null));
  }, []);

  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const y = view.getFullYear();
  const m = view.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const todayStr = ds(now.getFullYear(), now.getMonth(), now.getDate());

  const dayMap = useMemo(() => {
    const map: Record<string, DayInfo> = {};
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
    for (const e of expenses) {
      if (!e.date.startsWith(prefix)) continue;
      const info = (map[e.date] ||= { dominant: null, total: 0, regret: false, count: 0 });
      info.total += e.amount;
      info.count += 1;
      if (e.checkIn?.regret) info.regret = true;
    }
    // dominant emotion per day
    for (const date of Object.keys(map)) {
      const counts: Partial<Record<Emotion, number>> = {};
      for (const e of expenses) {
        if (e.date === date && e.checkIn?.emotion) {
          counts[e.checkIn.emotion] = (counts[e.checkIn.emotion] ?? 0) + 1;
        }
      }
      const top = Object.entries(counts).sort((a, b) => b[1]! - a[1]!)[0];
      map[date].dominant = (top?.[0] as Emotion) ?? null;
    }
    return map;
  }, [expenses, y, m]);

  const monthMood = useMemo(() => {
    let calm = 0;
    let tense = 0;
    for (const info of Object.values(dayMap)) {
      if (!info.dominant) continue;
      if (['joyful', 'celebratory', 'content'].includes(info.dominant)) calm += 1;
      else if (['anxious', 'stressed', 'guilty', 'impulsive'].includes(info.dominant)) tense += 1;
    }
    return { calm, tense };
  }, [dayMap]);

  const selectedExpenses: Expense[] = selected
    ? expenses.filter((e) => e.date === selected).sort((a, b) => b.amount - a.amount)
    : [];

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Journal</h1>
        <p className="text-slate-600 text-sm">Your month in moods. Tap a day to revisit it.</p>
      </motion.div>

      {/* Money Personality — evolving AI archetype */}
      {persona && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 text-white shadow-lg shadow-purple-500/20"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)' }}
        >
          <p className="text-[11px] uppercase tracking-wide text-white/80">Your money personality</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-4xl">{persona.emoji}</span>
            <h2 className="text-xl font-extrabold">{persona.archetype}</h2>
          </div>
          {persona.why && <p className="text-[13px] text-white/90 mt-2 leading-relaxed">{persona.why}</p>}
          <p className="text-[10px] text-white/70 mt-2">✨ Evolves as your habits change</p>
        </motion.div>
      )}

      <div className="glass p-4 space-y-3">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => { setOffset((o) => o - 1); setSelected(null); }} className="w-8 h-8 rounded-lg text-slate-600 hover:bg-purple-50">‹</button>
          <h3 className="text-sm font-bold text-slate-900">
            {view.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => { if (offset < 0) { setOffset((o) => o + 1); setSelected(null); } }}
            disabled={offset >= 0}
            className="w-8 h-8 rounded-lg text-slate-600 hover:bg-purple-50 disabled:opacity-30"
          >›</button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="text-[10px] font-medium text-slate-400">{w}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const date = ds(y, m, d);
            const info = dayMap[date];
            const emo = info?.dominant ? EMO[info.dominant] : null;
            const isToday = date === todayStr;
            const isSel = date === selected;
            return (
              <button
                key={date}
                onClick={() => info && setSelected(isSel ? null : date)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs relative transition-all ${
                  isSel ? 'ring-2 ring-purple-500' : ''
                } ${isToday ? 'font-extrabold text-purple-700' : 'text-slate-600'}`}
                style={{
                  background: emo ? emo.color + '33' : 'rgba(124,92,255,0.05)',
                  cursor: info ? 'pointer' : 'default',
                }}
              >
                {emo ? emo.emoji : <span>{d}</span>}
                {info?.regret && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          {monthMood.calm > 0 || monthMood.tense > 0
            ? `🟢 ${monthMood.calm} calm · 🟠 ${monthMood.tense} tense days · 🔴 dot = a regret`
            : 'Log expenses with the check-in to paint your month.'}
        </p>
      </div>

      {/* Selected day detail */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900">
              {new Date(selected + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h2>
            <span className="text-xs text-slate-500">{formatMoney(dayMap[selected]?.total ?? 0, profile.currency, { whole: true })}</span>
          </div>
          {selectedExpenses.map((e) => {
            const cat = resolveCategory(e.category, profile.customCategories);
            const em = e.checkIn?.emotion ? EMO[e.checkIn.emotion] : null;
            return (
              <div key={e.id} className="glass p-3 flex items-center gap-3 border-l-4" style={{ borderLeftColor: em?.color ?? '#cbd5e1' }}>
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{e.description || cat.label}</p>
                  <p className="text-[11px] text-slate-500">
                    {em && <span style={{ color: em.color }}>{em.emoji} {em.label}</span>}
                    {e.checkIn?.regret && <span className="text-red-500"> · regretted</span>}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{formatMoney(e.amount, profile.currency, { whole: true })}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
