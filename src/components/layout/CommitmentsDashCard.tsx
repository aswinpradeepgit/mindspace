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

  const hasData = total != null && total > 0;
  return (
    <Link
      href="/commitments"
      className="flex items-center justify-between rounded-2xl p-4 text-white shadow-lg shadow-purple-500/20"
      style={{ background: 'linear-gradient(120deg, #7c3aed 0%, #a855f7 55%, #ec4899 100%)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">💳</span>
        <div>
          <p className="text-sm font-bold">EMIs &amp; Subscriptions</p>
          {hasData ? (
            <p className="text-[12px] text-white/90">
              <span className="font-semibold">{formatMoney(total, currency, { whole: true })}/mo</span>{' '}
              committed{pct ? ` · ${pct}% of budget` : ''}
            </p>
          ) : (
            <p className="text-[12px] text-white/90">Track your loans &amp; subscriptions →</p>
          )}
        </div>
      </div>
      <span className="text-white/80 text-lg">›</span>
    </Link>
  );
}
