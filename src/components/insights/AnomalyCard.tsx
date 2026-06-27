'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

interface Anomaly {
  type: string;
  severity: 'alert' | 'warn' | 'info';
  emoji: string;
  title: string;
  detail: string;
}

const STYLE = {
  alert: 'border-red-400/40 bg-red-50/70',
  warn: 'border-amber-400/40 bg-amber-50/70',
  info: 'border-cyan-400/40 bg-cyan-50/70',
} as const;

/** "Heads up" — surfaces detected spending anomalies. Renders nothing when
 *  there's nothing unusual, to keep the page calm. */
export function AnomalyCard() {
  const [items, setItems] = useState<Anomaly[] | null>(null);

  useEffect(() => {
    apiFetch<{ anomalies: Anomaly[] }>('/api/v1/insights/anomalies')
      .then((r) => setItems(r.anomalies))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm font-bold text-slate-900">Heads up</h3>
      </div>
      {items.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`rounded-xl border p-3 ${STYLE[a.severity]}`}
        >
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <span>{a.emoji}</span>
            {a.title}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}
