'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { apiFetch } from '@/lib/api';
import { generateRecommendations } from '@/lib/insights/coach';
import { formatMoney } from '@/lib/money';

interface ApiRec {
  title: string;
  body: string;
  severity: 'tip' | 'opportunity' | 'win';
  estimated_monthly_saving: number;
}
interface CoachResponse {
  summary?: string;
  recommendations: ApiRec[];
}

const SEVERITY_BORDER = {
  tip: 'border-cyan-500/20',
  opportunity: 'border-amber-500/20',
  win: 'border-emerald-500/20',
} as const;

function RecItem({ rec, currency }: { rec: ApiRec; currency: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      onClick={() => setOpen((o) => !o)}
      className={`rounded-xl border ${SEVERITY_BORDER[rec.severity]} bg-purple-50/40 p-3 cursor-pointer`}
    >
      <div className="flex items-center gap-2.5">
        <p className="text-sm font-medium text-slate-800 flex-1 leading-tight">{rec.title}</p>
        {rec.estimated_monthly_saving > 0 && (
          <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">
            +{formatMoney(rec.estimated_monthly_saving, currency, { whole: true })}/mo
          </span>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-slate-600 mt-2 leading-relaxed"
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
  const [data, setData] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Local rules-based result used as an instant placeholder / offline fallback.
  const fallback = useMemo<CoachResponse>(() => {
    const recs = generateRecommendations(expenses, profile);
    return {
      recommendations: recs.map((r) => ({
        title: r.title,
        body: r.body,
        severity: r.severity,
        estimated_monthly_saving: r.estimatedMonthlySaving ?? 0,
      })),
    };
  }, [expenses, profile]);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const res = await apiFetch<CoachResponse>(
        `/api/v1/coach?period=weekly${refresh ? '&refresh=true' : ''}`
      );
      setData(res);
    } catch {
      setData(null); // show fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = data ?? fallback;
  const opportunity = shown.recommendations.reduce(
    (s, r) => s + (r.estimated_monthly_saving || 0),
    0
  );

  return (
    <div className="glass p-4 space-y-3 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl spin-slow">🤖</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Money Coach</h3>
            <p className="text-[10px] text-slate-500">
              {loading ? 'Thinking…' : 'Personalized from your patterns & emotions'}
            </p>
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

      {shown.summary && (
        <p className="text-xs text-slate-700 leading-relaxed bg-purple-50/50 rounded-xl p-3">
          {shown.summary}
        </p>
      )}

      <div className="space-y-2">
        {shown.recommendations.map((rec, i) => (
          <RecItem key={i} rec={rec} currency={profile.currency} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/coach"
          className="flex-1 text-center text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl py-2 transition-all"
        >
          💬 Ask your coach
        </Link>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="text-[11px] text-purple-600 font-medium px-3 py-2 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>
    </div>
  );
}
