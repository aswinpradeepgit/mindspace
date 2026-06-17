'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Expense } from '@/types';
import { useMemo } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney, currencySymbol } from '@/lib/money';

interface Props {
  expenses: Expense[];
  days?: number;
}

function makeTooltip(currency: string) {
  return function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass p-3 rounded-xl text-xs space-y-1">
        <p className="text-slate-600">{label}</p>
        <p className="text-slate-900 font-semibold">
          {formatMoney(Math.round((payload[0]?.value ?? 0) * 100), currency)} spent
        </p>
      </div>
    );
  };
}

export function SpendingChart({ expenses, days = 14 }: Props) {
  const currency = useExpenseStore((s) => s.profile.currency);
  const CustomTooltip = useMemo(() => makeTooltip(currency), [currency]);
  const data = useMemo(() => {
    const result: { date: string; amount: number; avg: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayExpenses = expenses.filter((e) => e.date === iso);
      const amount = dayExpenses.reduce((s, e) => s + e.amount, 0) / 100;
      result.push({
        date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        amount,
        avg: 0,
      });
    }

    // 7-day rolling average
    for (let i = 0; i < result.length; i++) {
      const window = result.slice(Math.max(0, i - 6), i + 1);
      result[i].avg = window.reduce((s, d) => s + d.amount, 0) / window.length;
    }

    return result;
  }, [expenses, days]);

  return (
    <div className="glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Spending — Last {days} Days</h3>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" />Daily</span>
          <span className="flex items-center gap-1"><span className="w-2 h-px bg-cyan-400 inline-block" />7-day avg</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,255,0.12)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(days / 5)}
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${currencySymbol(currency)}${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="#7c5cff" opacity={0.85} radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#00c2d1"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
