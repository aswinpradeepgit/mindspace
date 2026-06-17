'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialTip } from '@/types';

export function EducationTip({ tip }: { tip: FinancialTip }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="glass p-4 border border-amber-500/20 bg-amber-500/5 cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-300">{tip.title}</p>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-slate-600 mt-1.5 leading-relaxed"
              >
                {tip.body}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <span className="text-slate-400 text-xs mt-0.5">{expanded ? '▲' : '▼'}</span>
      </div>
    </motion.div>
  );
}
