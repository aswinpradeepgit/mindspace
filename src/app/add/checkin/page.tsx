'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Emotion, SpendIntent } from '@/types';
import { IntentQuestion } from '@/components/emotion/IntentQuestion';
import { EmotionWheel } from '@/components/emotion/EmotionWheel';
import { RegretPrompt } from '@/components/emotion/RegretPrompt';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney } from '@/lib/money';
import { resolveCategory } from '@/lib/categories';
import { hapticMedium } from '@/lib/native';
import { toast } from 'sonner';

const STEPS = ['intent', 'emotion', 'reflect'] as const;
type Step = (typeof STEPS)[number];

export default function CheckInPage() {
  const router = useRouter();
  const draft = useExpenseStore((s) => s.draftExpense);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const currency = useExpenseStore((s) => s.profile.currency);
  const custom = useExpenseStore((s) => s.profile.customCategories ?? []);

  const [step, setStep] = useState<Step>('intent');
  const [intent, setIntent] = useState<SpendIntent | null>(null);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [regret, setRegret] = useState<boolean | null>(null);
  const [wouldSpendLess, setWouldSpendLess] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draft) router.replace('/add');
  }, [draft, router]);

  if (!draft) return null;

  const stepIndex = STEPS.indexOf(step);

  const canAdvance = () => {
    if (step === 'intent') return !!intent;
    if (step === 'emotion') return !!emotion;
    if (step === 'reflect') return regret !== null && wouldSpendLess !== null;
    return false;
  };

  const handleNext = async () => {
    if (step === 'intent') { setStep('emotion'); return; }
    if (step === 'emotion') { setStep('reflect'); return; }
    if (step === 'reflect') {
      setSubmitting(true);
      try {
        await addExpense({
          ...(draft as any),
          checkIn: {
            emotion: emotion!,
            intent: intent!,
            regret,
            wouldSpendLess,
          },
        });
        hapticMedium();
        toast.success('Expense logged! 🎉', { description: 'XP earned for tracking mindfully.' });
        router.push('/');
      } catch {
        toast.error("Couldn't save — check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
          ← Back
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">Step {stepIndex + 1} of {STEPS.length}</p>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= stepIndex ? 'bg-purple-500' : 'bg-purple-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Expense summary */}
      <div className="glass p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-600">{draft.description}</p>
          <p className="text-xs text-slate-500">
            {draft.category ? `${resolveCategory(draft.category, custom).icon} ${resolveCategory(draft.category, custom).label}` : ''}
          </p>
        </div>
        <p className="text-2xl font-bold text-slate-900 gradient-text">
          {formatMoney(draft.amount ?? 0, currency)}
        </p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'intent' && <IntentQuestion value={intent} onChange={setIntent} />}
          {step === 'emotion' && <EmotionWheel value={emotion} onChange={setEmotion} />}
          {step === 'reflect' && (
            <RegretPrompt
              regret={regret}
              wouldSpendLess={wouldSpendLess}
              onRegretChange={setRegret}
              onWouldSpendLessChange={setWouldSpendLess}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleNext}
        disabled={!canAdvance() || submitting}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          canAdvance() && !submitting
            ? 'bg-purple-600 hover:bg-purple-500 text-white glow-purple'
            : 'bg-purple-50/70 text-slate-400 cursor-not-allowed'
        }`}
      >
        {submitting
          ? 'Saving...'
          : step === 'reflect'
          ? '✅ Save Expense'
          : 'Continue →'}
      </motion.button>
    </div>
  );
}
