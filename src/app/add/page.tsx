'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Category, Emotion, SpendIntent } from '@/types';
import { CategoryPicker } from '@/components/expense/CategoryPicker';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { currencySymbol } from '@/lib/money';
import { apiFetch } from '@/lib/api';
import { NaturalLanguageBox } from '@/components/expense/NaturalLanguageBox';

interface ParseResult {
  amount: number;
  category: string;
  description: string;
  emotion: Emotion | null;
  intent: SpendIntent | null;
  ai_used: boolean;
}

export default function AddExpensePage() {
  const router = useRouter();
  const setDraft = useExpenseStore((s) => s.setDraft);
  const currency = useExpenseStore((s) => s.profile.currency);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  // Emotion/intent the AI inferred — pre-fills the check-in step.
  const [aiEmotion, setAiEmotion] = useState<Emotion | null>(null);
  const [aiIntent, setAiIntent] = useState<SpendIntent | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleParse = async (text: string) => {
    setParsing(true);
    try {
      const r = await apiFetch<ParseResult>('/api/v1/expenses/parse', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      if (r.amount > 0) setAmount((r.amount / 100).toString());
      if (r.description) setDescription(r.description);
      if (r.category) setCategory(r.category);
      setAiEmotion(r.emotion);
      setAiIntent(r.intent);
      if (r.ai_used) {
        toast.success('Filled from your words ✨ — review & continue');
      } else if (r.amount > 0 || r.description) {
        // Regex fallback (AI busy / unavailable) still pre-filled the basics.
        toast('AI is busy — filled what I could. Please review & adjust.');
      } else {
        toast.error("Couldn't read that — try rephrasing or fill it manually.");
      }
    } catch {
      toast.error("Couldn't read that — try rephrasing or fill it manually.");
    } finally {
      setParsing(false);
    }
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if ((raw.match(/\./g) || []).length <= 1) setAmount(raw);
  };

  const handleNext = () => {
    if (!amount || !description || !category) return;
    const amountCents = Math.round(parseFloat(amount) * 100);
    const today = new Date().toISOString().split('T')[0];
    setDraft({
      amount: amountCents,
      description,
      category,
      date: today,
      currency,
      // Pre-fill the check-in if the AI inferred mood/intent.
      ...(aiEmotion || aiIntent
        ? { checkIn: { emotion: aiEmotion as Emotion, intent: aiIntent as SpendIntent, regret: null, wouldSpendLess: null } }
        : {}),
    });
    router.push('/add/checkin');
  };

  const canProceed = !!amount && parseFloat(amount) > 0 && !!description && !!category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Expense</h1>
        <p className="text-slate-600 text-sm">Track what you spend, understand why.</p>
      </div>

      {/* Natural-language quick add */}
      <NaturalLanguageBox onParse={handleParse} parsing={parsing} />

      {/* Amount */}
      <div className="glass p-6 text-center space-y-2">
        <p className="text-sm text-slate-600">Amount</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-light text-slate-600">{currencySymbol(currency)}</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountInput}
            className="bg-transparent text-5xl font-bold text-slate-900 outline-none border-none w-48 text-center placeholder:text-slate-700 !bg-transparent"
            autoFocus
          />
        </div>
        {amount && parseFloat(amount) > 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-amber-600"
          >
            That's a significant spend. Make it count! 💪
          </motion.p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">What did you buy?</label>
        <input
          type="text"
          placeholder="e.g. Coffee at Starbucks, Gym membership..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full glass px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500/50 rounded-xl border border-purple-100 transition-colors placeholder:text-slate-400"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Category</label>
        <CategoryPicker value={category} onChange={setCategory} />
      </div>

      {/* Next */}
      <motion.button
        type="button"
        onClick={handleNext}
        disabled={!canProceed}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
          canProceed
            ? 'bg-purple-600 hover:bg-purple-500 text-white glow-purple'
            : 'bg-purple-50/70 text-slate-400 cursor-not-allowed'
        }`}
      >
        Next: Check In →
      </motion.button>
    </motion.div>
  );
}
