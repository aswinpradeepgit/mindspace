'use client';

import { motion } from 'framer-motion';
import { SpendIntent } from '@/types';

const INTENTS: { id: SpendIntent; label: string; emoji: string; desc: string }[] = [
  { id: 'need', label: 'Need', emoji: '✅', desc: 'Essential, unavoidable' },
  { id: 'want', label: 'Want', emoji: '💭', desc: 'Desired but not essential' },
  { id: 'treat', label: 'Treat', emoji: '🎁', desc: 'Reward for yourself' },
  { id: 'social_pressure', label: 'Social', emoji: '👥', desc: 'Peer or social influence' },
  { id: 'habit', label: 'Habit', emoji: '🔄', desc: 'Automatic, routine spend' },
  { id: 'investment', label: 'Invest', emoji: '📈', desc: 'Future value or growth' },
  { id: 'emergency', label: 'Emergency', emoji: '🚨', desc: 'Unexpected urgent need' },
];

interface Props {
  value: SpendIntent | null;
  onChange: (intent: SpendIntent) => void;
}

export function IntentQuestion({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">What's the intent?</h2>
        <p className="text-sm text-slate-600">Understanding why you spend helps you spend better.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {INTENTS.map((intent, i) => {
          const isSelected = value === intent.id;
          return (
            <motion.button
              key={intent.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(intent.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-purple-600/20 border-purple-500/40 text-slate-900'
                  : 'bg-purple-50/50 border-purple-100/70 text-slate-600 hover:bg-purple-50'
              }`}
            >
              <span className="text-xl">{intent.emoji}</span>
              <div>
                <p className="text-sm font-semibold">{intent.label}</p>
                <p className="text-[10px] text-slate-500">{intent.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
