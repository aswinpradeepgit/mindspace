'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { SpendingChart } from '@/components/insights/SpendingChart';
import { CategoryDonut } from '@/components/insights/CategoryDonut';
import { NudgeAlert } from '@/components/insights/NudgeAlert';
import { EducationTip } from '@/components/insights/EducationTip';
import { AICoachCard } from '@/components/insights/AICoachCard';
import { ExplainMonthCard } from '@/components/insights/ExplainMonthCard';
import { ShareRecap } from '@/components/insights/ShareRecap';
import { AnomalyCard } from '@/components/insights/AnomalyCard';
import { ProactiveInsights } from '@/components/insights/ProactiveInsights';
import { buildWeeklySummary, buildMonthlySummary } from '@/lib/insights/summaries';
import { selectTip } from '@/lib/insights/education';
import { formatMoney, currencySymbol, CURRENCIES } from '@/lib/money';

const TRAJECTORY_ICONS = { improving: '📈', stable: '➡️', declining: '📉' };
const TRAJECTORY_COLORS = { improving: 'text-emerald-600', stable: 'text-slate-600', declining: 'text-red-500' };

export default function InsightsPage() {
  const { expenses, profile, updateProfile, setCurrency } = useExpenseStore();
  const [budgetInput, setBudgetInput] = useState(
    profile.monthlyBudget ? (profile.monthlyBudget / 100).toFixed(0) : ''
  );
  const [tab, setTab] = useState<'week' | 'month'>('week');

  const today = new Date().toISOString().split('T')[0];

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }, []);

  const month = today.slice(0, 7);

  const weekly = useMemo(
    () => buildWeeklySummary(expenses, weekStart, profile.monthlyBudget),
    [expenses, weekStart, profile.monthlyBudget]
  );

  const monthly = useMemo(
    () => buildMonthlySummary(expenses, month, profile.monthlyBudget),
    [expenses, month, profile.monthlyBudget]
  );

  const tip = useMemo(() => selectTip('always'), []);

  const handleBudgetSave = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      updateProfile({ monthlyBudget: Math.round(val * 100) });
    }
  };

  const summary = tab === 'week' ? weekly : monthly;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
        <p className="text-slate-600 text-sm">Your spending story, decoded.</p>
      </motion.div>

      {/* Anomalies — most actionable, surfaced first */}
      {expenses.length > 0 && <AnomalyCard />}

      {/* Forecast · goals · recurring · budget suggestions */}
      {expenses.length > 0 && <ProactiveInsights />}

      {/* Tabs */}
      <div className="glass flex p-1 gap-1">
        {(['week', 'month'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 space-y-1">
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-2xl font-bold text-slate-900">{formatMoney(summary.totalSpent, profile.currency)}</p>
        </div>
        <div className="glass p-4 space-y-1">
          <p className="text-xs text-slate-500">Avg Daily</p>
          <p className="text-2xl font-bold text-slate-900">{formatMoney(summary.avgDailySpend, profile.currency)}</p>
        </div>
        {profile.monthlyBudget && tab === 'month' && (
          <>
            <div className="glass p-4 space-y-1">
              <p className="text-xs text-slate-500">Budget Used</p>
              <p className={`text-2xl font-bold ${monthly.budgetUsed > 1 ? 'text-red-500' : 'text-emerald-600'}`}>
                {Math.round(monthly.budgetUsed * 100)}%
              </p>
            </div>
            <div className="glass p-4 space-y-1">
              <p className="text-xs text-slate-500">Trajectory</p>
              <p className={`text-xl font-bold flex items-center gap-1 ${TRAJECTORY_COLORS[monthly.savingsTrajectory]}`}>
                {TRAJECTORY_ICONS[monthly.savingsTrajectory]} {monthly.savingsTrajectory}
              </p>
            </div>
          </>
        )}
        <div className="glass p-4 space-y-1">
          <p className="text-xs text-slate-500">Regret Rate</p>
          <p className={`text-2xl font-bold ${summary.regretRate > 0.3 ? 'text-red-500' : 'text-emerald-600'}`}>
            {Math.round(summary.regretRate * 100)}%
          </p>
        </div>
        {tab === 'week' && weekly.bestDay && (
          <div className="glass p-4 space-y-1">
            <p className="text-xs text-slate-500">Best Day</p>
            <p className="text-sm font-bold text-emerald-600">
              {new Date(weekly.bestDay).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <SpendingChart expenses={expenses} days={tab === 'week' ? 7 : 30} />
      </motion.div>

      {/* Donut */}
      {expenses.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <CategoryDonut
            expenses={expenses.filter((e) => e.date.startsWith(tab === 'week' ? weekStart.slice(0, 7) : month))}
          />
        </motion.div>
      )}

      {/* AI Coach + Explain my month */}
      {expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          <ExplainMonthCard />
          <ShareRecap />
          <AICoachCard />
        </motion.div>
      )}

      {/* Nudges */}
      {summary.nudges.length > 0 && (
        <div className="space-y-2">
          {summary.nudges.map((n, i) => <NudgeAlert key={i} nudge={n} />)}
        </div>
      )}

      {/* Education Tip */}
      <EducationTip tip={tip} />

      {/* Budget setup */}
      <div className="glass p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Monthly Budget</h3>
        <p className="text-xs text-slate-500">Setting a budget unlocks savings rate, savings tracking and trajectory.</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 flex-1 glass px-3 rounded-xl border border-purple-100">
            <span className="text-slate-600 text-sm">{currencySymbol(profile.currency)}</span>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleBudgetSave}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            Save
          </button>
        </div>
        {profile.monthlyBudget && (
          <p className="text-xs text-emerald-600">
            ✓ Budget set: {formatMoney(profile.monthlyBudget, profile.currency, { whole: true })}/month
          </p>
        )}
      </div>

      {/* Currency selector */}
      <div className="glass p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Currency</h3>
        <p className="text-xs text-slate-500">Auto-detected from your location. Change it anytime.</p>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                profile.currency === c.code
                  ? 'bg-purple-600/20 border-purple-500/40 text-slate-900'
                  : 'bg-purple-50/50 border-purple-100/70 text-slate-600 hover:bg-purple-50'
              }`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
