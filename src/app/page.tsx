'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { DailyQuests } from '@/components/gamification/DailyQuests';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { NudgeAlert } from '@/components/insights/NudgeAlert';
import { EducationTip } from '@/components/insights/EducationTip';
import { AICoachCard } from '@/components/insights/AICoachCard';
import { getLevelInfo } from '@/lib/gamification/levels';
import { buildDailySummary } from '@/lib/insights/summaries';
import { detectPatterns } from '@/lib/insights/patterns';
import { totalSaved } from '@/lib/insights/savings';
import { formatMoney } from '@/lib/money';

export default function DashboardPage() {
  const { expenses, profile } = useExpenseStore();
  const levelInfo = getLevelInfo(profile.level);

  const today = new Date().toISOString().split('T')[0];
  const todaySummary = useMemo(
    () => buildDailySummary(expenses, today, profile.monthlyBudget),
    [expenses, today, profile.monthlyBudget]
  );

  const nudges = useMemo(
    () => detectPatterns(expenses, profile.customCategories),
    [expenses, profile.customCategories]
  );
  const recentExpenses = expenses.slice(0, 10);

  const totalThisMonth = useMemo(() => {
    const month = today.slice(0, 7);
    return expenses
      .filter((e) => e.date.startsWith(month))
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses, today]);

  const saved = useMemo(() => totalSaved(expenses, profile), [expenses, profile]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-slate-600 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold gradient-text">{profile.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            aria-label="Account"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-all"
          >
            👤
          </Link>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: levelInfo.color + '30', color: levelInfo.color, border: `1px solid ${levelInfo.color}50` }}
          >
            {profile.level}
          </div>
        </div>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <XPBar />
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="glass p-3 text-center">
          <p className="text-xs text-slate-500">Today</p>
          <p className="text-lg font-bold text-slate-900">{formatMoney(todaySummary.totalSpent, profile.currency, { whole: true })}</p>
          <p className="text-[10px] text-slate-400">{todaySummary.expenseCount} items</p>
        </div>
        <div className="glass p-3 text-center">
          <p className="text-xs text-slate-500">This Month</p>
          <p className="text-lg font-bold text-slate-900">{formatMoney(totalThisMonth, profile.currency, { whole: true })}</p>
          {profile.monthlyBudget && (
            <p className="text-[10px] text-slate-400">
              of {formatMoney(profile.monthlyBudget, profile.currency, { whole: true })}
            </p>
          )}
        </div>
        <div className="glass p-3 text-center">
          <p className="text-xs text-slate-500">Total Logs</p>
          <p className="text-lg font-bold gradient-text">{expenses.length}</p>
          <p className="text-[10px] text-slate-400">expenses</p>
        </div>
      </motion.div>

      {/* Total Saved hero — the real result */}
      {saved > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          className="glass p-5 text-center relative overflow-hidden glow-cyan"
          style={{ border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 0%, #10b981, transparent 70%)' }} />
          <p className="text-xs text-emerald-600/80 relative z-10">💰 Money saved with MindSpend</p>
          <motion.p
            key={saved}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-emerald-600 relative z-10 mt-1"
          >
            {formatMoney(saved, profile.currency, { whole: true })}
          </motion.p>
          <p className="text-[10px] text-slate-500 relative z-10 mt-1">
            from staying under budget. Keep it growing! 📈
          </p>
        </motion.div>
      )}

      {/* Daily Quests — the dopamine loop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.13 }}>
        <DailyQuests />
      </motion.div>

      {/* Streak */}
      {profile.streakDays > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <StreakCounter />
        </motion.div>
      )}

      {/* AI Coach */}
      {expenses.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
          <AICoachCard />
        </motion.div>
      )}

      {/* Nudges */}
      {nudges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {nudges.slice(0, 2).map((n, i) => <NudgeAlert key={i} nudge={n} />)}
        </motion.div>
      )}

      {/* Tip */}
      {todaySummary.tip && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <EducationTip tip={todaySummary.tip} />
        </motion.div>
      )}

      {/* Recent Expenses */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent Expenses</h2>
          {expenses.length > 10 && (
            <Link href="/insights" className="text-xs text-purple-600 hover:text-purple-600">
              View all
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="glass p-8 text-center space-y-3">
            <span className="text-5xl block">💸</span>
            <p className="text-slate-600 text-sm">No expenses yet.</p>
            <Link
              href="/add"
              className="inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all"
            >
              Log your first expense →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((e, i) => (
              <ExpenseCard key={e.id} expense={e} index={i} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Budget setup prompt */}
      {!profile.monthlyBudget && expenses.length >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-4 border border-cyan-500/20 bg-cyan-500/5"
        >
          <p className="text-sm text-cyan-300 font-medium">💡 Set a monthly budget</p>
          <p className="text-xs text-slate-600 mt-1">
            Setting a budget unlocks savings rate tracking and deeper insights.
          </p>
          <Link
            href="/insights"
            className="inline-block mt-2 text-xs text-cyan-600 hover:text-cyan-300"
          >
            Go to Insights →
          </Link>
        </motion.div>
      )}
    </div>
  );
}
