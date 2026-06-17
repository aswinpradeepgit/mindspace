'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Nudge } from '@/types';
import { useState } from 'react';

const TYPE_CONFIG = {
  warning: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-300', icon: '⚠️' },
  encouragement: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-300', icon: '✨' },
  insight: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-300', icon: '💡' },
};

export function NudgeAlert({ nudge }: { nudge: Nudge }) {
  const [dismissed, setDismissed] = useState(false);
  const config = TYPE_CONFIG[nudge.type];

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`rounded-xl border p-3 flex items-start gap-2.5 ${config.bg} ${config.border}`}
        >
          <span>{config.icon}</span>
          <p className={`text-xs flex-1 leading-relaxed ${config.text}`}>{nudge.message}</p>
          <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600 text-xs ml-1">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
