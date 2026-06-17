'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { generateRecommendations, totalOpportunity } from '@/lib/insights/coach';
import { formatMoney } from '@/lib/money';
import { Recommendation } from '@/types';

const SEVERITY_STYLE = {
  tip: { border: 'border-cyan-500/20', dot: '#06b6d4' },
  opportunity: { border: 'border-amber-500/20', dot: '#f59e0b' },
  win: { border: 'border-emerald-500/20', dot: '#10b981' },
};

function RecItem({ rec, currency }: { rec: Recommendation; currency: string }) {
  const [open, setOpen] = useState(false);
  const style = SEVERITY_STYLE[rec.severity];

  return (
    <motion.div
      layout
      onClick={() => setOpen((o) => !o)}
      className={`rounded-xl border ${style.border} bg-purple-50/40 p-3 cursor-pointer`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{rec.icon}</span>
        <p className="text-sm font-medium text-slate-800 flex-1 leading-tight">{rec.title}</p>
        {rec.estimatedMonthlySaving ? (
          <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">
            +{formatMoney(rec.estimatedMonthlySaving, currency, { whole: true })}/mo
          </span>
        ) : null}
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-slate-600 mt-2 leading-relaxed pl-7"
          >
            {rec.body}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AICoachCard() {
  const { expenses, profile } = useExpenseStore();
  const recs = useMemo(() => generateRecommendations(expenses, profile), [expenses, profile]);
  const opportunity = totalOpportunity(recs);

  return (
    <div className="glass p-4 space-y-3 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl spin-slow">🤖</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Money Coach</h3>
            <p className="text-[10px] text-slate-500">Personalized from your patterns & emotions</p>
          </div>
        </div>
        {opportunity > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-slate-500">Potential savings</p>
            <p className="text-sm font-bold gradient-text">
              {formatMoney(opportunity, profile.currency, { whole: true })}/mo
            </p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {recs.map((rec) => (
          <RecItem key={rec.id} rec={rec} currency={profile.currency} />
        ))}
      </div>
      <p className="text-[10px] text-slate-400 text-center">Tap any insight to expand</p>
    </div>
  );
}
