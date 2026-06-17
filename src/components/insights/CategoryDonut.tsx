'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense } from '@/types';
import { resolveCategory } from '@/lib/categories';
import { useMemo } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney } from '@/lib/money';

interface Props {
  expenses: Expense[];
}

function makeTooltip(currency: string) {
  return function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
      <div className="glass p-2 rounded-lg text-xs">
        <p className="text-slate-700">{name}: <span className="font-bold text-slate-900">{formatMoney(value, currency)}</span></p>
      </div>
    );
  };
}

export function CategoryDonut({ expenses }: Props) {
  const currency = useExpenseStore((s) => s.profile.currency);
  const custom = useExpenseStore((s) => s.profile.customCategories ?? []);

  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of expenses) {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount;
    }
    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => {
        const cfg = resolveCategory(key, custom);
        return { name: cfg.label, value, color: cfg.color, icon: cfg.icon };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses, custom]);

  const CustomTooltip = useMemo(() => makeTooltip(currency), [currency]);

  if (data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Spending by Category</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.slice(0, 5).map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="text-sm">{d.icon}</span>
              <div className="flex-1 flex items-center gap-1">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${(d.value / total) * 100}%`, background: d.color, minWidth: 4 }}
                />
              </div>
              <span className="text-[10px] text-slate-600 w-12 text-right">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
