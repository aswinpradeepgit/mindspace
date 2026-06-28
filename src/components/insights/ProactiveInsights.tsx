'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney } from '@/lib/money';

interface Forecast {
  status: string;
  headline: string;
  detail: string;
}
interface GoalItem {
  name: string;
  emoji: string;
  percent: number;
  remaining_minor: number;
  message: string;
}
interface Recurring {
  name: string;
  amount_minor: number;
  months: number;
  last_date: string;
}
interface BudgetSug {
  category: string;
  label: string;
  monthly_avg_minor: number;
  suggested_minor: number;
}
interface Proactive {
  forecast: Forecast | null;
  goals: GoalItem[];
  recurring: Recurring[];
  budget_suggestions: BudgetSug[];
}

const FC_STYLE: Record<string, string> = {
  under: 'border-emerald-400/40 bg-emerald-50/70',
  close: 'border-amber-400/40 bg-amber-50/70',
  over: 'border-red-400/40 bg-red-50/70',
  no_budget: 'border-purple-400/30 bg-purple-50/60',
};

export function ProactiveInsights() {
  const currency = useExpenseStore((s) => s.profile.currency);
  const [d, setD] = useState<Proactive | null>(null);

  useEffect(() => {
    apiFetch<Proactive>('/api/v1/insights/proactive').then(setD).catch(() => setD(null));
  }, []);

  if (!d) return null;
  const fmt = (m: number) => formatMoney(m, currency, { whole: true });

  return (
    <div className="space-y-4">
      {/* Goal motivation */}
      {d.goals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">🎯 Your goals</h3>
          {d.goals.map((g, i) => (
            <div key={i} className="glass p-3 border border-purple-500/15">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">
                  {g.emoji} {g.name}
                </span>
                <span className="text-purple-600 font-bold">{g.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-purple-100 mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.percent}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{g.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Forecast */}
      {d.forecast && (
        <div className={`rounded-xl border p-3 ${FC_STYLE[d.forecast.status] ?? FC_STYLE.no_budget}`}>
          <p className="text-sm font-semibold text-slate-800">🔮 {d.forecast.headline}</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.forecast.detail}</p>
        </div>
      )}

      {/* Recurring / subscriptions */}
      {d.recurring.length > 0 && (
        <div className="glass p-3 border border-purple-500/15">
          <h3 className="text-sm font-bold text-slate-900 mb-2">🔁 Recurring &amp; subscriptions</h3>
          <div className="space-y-1.5">
            {d.recurring.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{r.name}</span>
                <span className="text-slate-500 text-xs">
                  {fmt(r.amount_minor)} · {r.months} mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested budgets */}
      {d.budget_suggestions.length > 0 && (
        <details className="glass p-3 border border-purple-500/15">
          <summary className="text-sm font-bold text-slate-900 cursor-pointer">
            💡 Suggested monthly budgets
          </summary>
          <div className="space-y-1.5 mt-2">
            {d.budget_suggestions.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{b.label}</span>
                <span className="text-slate-500 text-xs">
                  ~{fmt(b.suggested_minor)}/mo{' '}
                  <span className="text-slate-400">(avg {fmt(b.monthly_avg_minor)})</span>
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
