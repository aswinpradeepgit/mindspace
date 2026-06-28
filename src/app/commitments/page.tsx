'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney, currencySymbol } from '@/lib/money';
import { hapticSuccess } from '@/lib/native';

interface Commitment {
  id: string;
  type: 'emi' | 'subscription';
  name: string;
  amount: number;
  cycle: string;
  months_left?: number | null;
  icon: string;
}
interface Insights {
  monthly_total_minor: number;
  monthly_emi_minor: number;
  monthly_subs_minor: number;
  annual_subs_minor: number;
  percent_of_budget: number | null;
  summary: string;
  suggestions: string[];
}

const PRESETS = [
  { name: 'Netflix', icon: '🎬' },
  { name: 'Hotstar', icon: '📺' },
  { name: 'Spotify', icon: '🎵' },
  { name: 'YouTube Premium', icon: '▶️' },
  { name: 'Amazon Prime', icon: '📦' },
  { name: 'Disney+', icon: '🏰' },
  { name: 'Apple', icon: '🍎' },
  { name: 'Gym', icon: '💪' },
];

export default function CommitmentsPage() {
  const router = useRouter();
  const currency = useExpenseStore((s) => s.profile.currency);
  const [items, setItems] = useState<Commitment[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [tab, setTab] = useState<'subscription' | 'emi'>('subscription');

  // form
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [monthsLeft, setMonthsLeft] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, ins] = await Promise.all([
        apiFetch<Commitment[]>('/api/v1/commitments'),
        apiFetch<Insights>('/api/v1/commitments/insights'),
      ]);
      setItems(list);
      setInsights(ins);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fmt = (m: number) => formatMoney(m, currency, { whole: true });

  const add = async () => {
    const v = parseFloat(amount);
    if (!name.trim() || !v || v <= 0) return;
    try {
      await apiFetch('/api/v1/commitments', {
        method: 'POST',
        body: JSON.stringify({
          type: tab,
          name: name.trim(),
          amount: Math.round(v * 100),
          cycle: tab === 'emi' ? 'monthly' : cycle,
          months_left: tab === 'emi' && monthsLeft ? parseInt(monthsLeft) : null,
          icon: tab === 'emi' ? '🏦' : icon || '💳',
        }),
      });
      hapticSuccess();
      toast.success(`Added ${name.trim()}`);
      setName('');
      setIcon('');
      setAmount('');
      setMonthsLeft('');
      load();
    } catch {
      toast.error("Couldn't save — try again.");
    }
  };

  const remove = async (id: string) => {
    setItems((x) => x.filter((c) => c.id !== id));
    await apiFetch(`/api/v1/commitments/${id}`, { method: 'DELETE' }).catch(() => {});
    load();
  };

  const emis = items.filter((c) => c.type === 'emi');
  const subs = items.filter((c) => c.type === 'subscription');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-slate-600 text-sm" aria-label="Back">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commitments</h1>
          <p className="text-slate-600 text-sm">Your EMIs & subscriptions, in one place.</p>
        </div>
      </div>

      {/* Insights */}
      {insights && insights.monthly_total_minor > 0 && (
        <div className="glass p-4 space-y-3 border border-purple-500/20">
          <p className="text-sm text-slate-800 leading-relaxed">{insights.summary}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="EMIs/mo" value={fmt(insights.monthly_emi_minor)} />
            <Stat label="Subs/mo" value={fmt(insights.monthly_subs_minor)} />
            <Stat label="Subs/yr" value={fmt(insights.annual_subs_minor)} />
          </div>
          {insights.suggestions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {insights.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-slate-600 flex gap-1.5">
                  <span>💡</span>
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      <div className="glass p-4 space-y-3 border border-purple-500/15">
        <div className="flex gap-2">
          {(['subscription', 'emi'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
              }`}
            >
              {t === 'emi' ? '🏦 EMI / Loan' : '💳 Subscription'}
            </button>
          ))}
        </div>

        {tab === 'subscription' && (
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setName(p.name);
                  setIcon(p.icon);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                  name === p.name
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-white border-purple-100 text-slate-600'
                }`}
              >
                {p.icon} {p.name}
              </button>
            ))}
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tab === 'emi' ? 'Loan name (e.g. HDFC personal loan)' : 'Subscription name'}
          className="w-full bg-white px-3 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
        />
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${currencySymbol(currency)})`}
            className="flex-1 bg-white px-3 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
          />
          {tab === 'emi' ? (
            <input
              type="number"
              inputMode="numeric"
              value={monthsLeft}
              onChange={(e) => setMonthsLeft(e.target.value)}
              placeholder="Months left"
              className="w-28 bg-white px-3 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
            />
          ) : (
            <div className="flex rounded-xl overflow-hidden border border-purple-100">
              {(['monthly', 'yearly'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`px-3 text-xs font-medium ${
                    cycle === c ? 'bg-purple-600 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  {c === 'monthly' ? '/mo' : '/yr'}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={add}
          disabled={!name.trim() || !amount}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-purple-600 text-white disabled:opacity-50"
        >
          + Add {tab === 'emi' ? 'EMI' : 'subscription'}
        </button>
      </div>

      {/* Lists */}
      {emis.length > 0 && <List title="🏦 EMIs & loans" items={emis} fmt={fmt} onRemove={remove} />}
      {subs.length > 0 && (
        <List title="💳 Subscriptions" items={subs} fmt={fmt} onRemove={remove} />
      )}

      {items.length === 0 && (
        <p className="text-center text-sm text-slate-400 pt-4">
          Add your EMIs and subscriptions above to see what&apos;s locked in each month.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-xl py-2">
      <div className="text-sm font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

function List({
  title,
  items,
  fmt,
  onRemove,
}: {
  title: string;
  items: Commitment[];
  fmt: (m: number) => string;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {items.map((c) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-3 flex items-center justify-between border border-purple-500/10"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{c.icon || '💳'}</span>
            <div>
              <p className="text-sm font-medium text-slate-800">{c.name}</p>
              <p className="text-[11px] text-slate-500">
                {fmt(c.amount)}/{c.cycle === 'yearly' ? 'yr' : c.cycle === 'weekly' ? 'wk' : 'mo'}
                {c.months_left ? ` · ${c.months_left} mo left` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => onRemove(c.id)}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            remove
          </button>
        </motion.div>
      ))}
    </div>
  );
}
