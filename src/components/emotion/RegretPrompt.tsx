'use client';

import { motion } from 'framer-motion';

interface Props {
  regret: boolean | null;
  wouldSpendLess: boolean | null;
  onRegretChange: (v: boolean) => void;
  onWouldSpendLessChange: (v: boolean) => void;
}

export function RegretPrompt({ regret, wouldSpendLess, onRegretChange, onWouldSpendLessChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Quick reflection</h2>
        <p className="text-sm text-slate-600">Honest reflection is the key to better spending.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Was this the right amount to spend?</p>
        <div className="flex gap-2">
          {[
            { label: '✅ Yes, worth it', value: false },
            { label: '❌ Regret it', value: true },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onRegretChange(opt.value)}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                regret === opt.value
                  ? opt.value
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-purple-50/50 border-purple-100/70 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Would you spend less next time?</p>
        <div className="flex gap-2">
          {[
            { label: '👍 No, same amount', value: false },
            { label: '💸 Yes, spend less', value: true },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onWouldSpendLessChange(opt.value)}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                wouldSpendLess === opt.value
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-600'
                  : 'bg-purple-50/50 border-purple-100/70 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
