'use client';

import { motion } from 'framer-motion';
import { Emotion } from '@/types';

const EMOTIONS: { id: Emotion; label: string; emoji: string; color: string }[] = [
  { id: 'joyful', label: 'Joyful', emoji: '😄', color: '#f59e0b' },
  { id: 'celebratory', label: 'Celebratory', emoji: '🎉', color: '#ec4899' },
  { id: 'content', label: 'Content', emoji: '😊', color: '#10b981' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#64748b' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#06b6d4' },
  { id: 'stressed', label: 'Stressed', emoji: '😤', color: '#f97316' },
  { id: 'guilty', label: 'Guilty', emoji: '😔', color: '#8b5cf6' },
  { id: 'impulsive', label: 'Impulsive', emoji: '⚡', color: '#ef4444' },
];

interface Props {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
}

export function EmotionWheel({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">How are you feeling?</h2>
        <p className="text-sm text-slate-600">Emotions and spending are deeply connected.</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {EMOTIONS.map((em, i) => {
          const isSelected = value === em.id;
          return (
            <motion.button
              key={em.id}
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(em.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all"
              style={
                isSelected
                  ? {
                      background: `${em.color}25`,
                      borderColor: `${em.color}60`,
                      boxShadow: `0 0 15px ${em.color}30`,
                    }
                  : { background: 'rgba(124,92,255,0.05)', borderColor: 'rgba(124,92,255,0.12)' }
              }
            >
              <span className="text-2xl">{em.emoji}</span>
              <span className="text-[10px] font-medium text-center" style={{ color: isSelected ? em.color : '#64748b' }}>
                {em.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
