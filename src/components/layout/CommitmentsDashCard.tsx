'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney } from '@/lib/money';

/** Dashboard entry to the Commitments page — shows the monthly committed total. */
export function CommitmentsDashCard() {
  const currency = useExpenseStore((s) => s.profile.currency);
  const [total, setTotal] = useState<number | null>(null);
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ monthly_total_minor: number; percent_of_budget: number | null }>(
      '/api/v1/commitments/insights'
    )
      .then((r) => {
        setTotal(r.monthly_total_minor);
        setPct(r.percent_of_budget);
      })
      .catch(() => setTotal(0));
  }, []);

  return (
    <Link href="/commitments" className="glass p-4 flex items-center justify-between border border-purple-500/15">
      <div className="flex items-center gap-3">
        <span className="text-xl">💳</span>
        <div>
          <p className="text-sm font-semibold text-slate-900">EMIs &amp; Subscriptions</p>
          <p className="text-[11px] text-slate-500">
            {total && total > 0
              ? `${formatMoney(total, currency, { whole: true })}/mo committed${
                  pct ? ` · ${pct}% of budget` : ''
                }`
              : 'Add what you pay every month →'}
          </p>
        </div>
      </div>
      <span className="text-slate-400">›</span>
    </Link>
  );
}
