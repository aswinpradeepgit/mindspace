'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { GoalCard } from '@/components/goals/GoalProgress';
import { GoalForm } from '@/components/goals/GoalForm';

export default function GoalsPage() {
  const goals = useExpenseStore((s) => s.goals);
  const [showForm, setShowForm] = useState(false);

  const activeGoals = goals.filter((g) => !g.completedAt);
  const completedGoals = goals.filter((g) => g.completedAt);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings Goals</h1>
          <p className="text-slate-600 text-sm">Dream big. Save smart.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all"
        >
          {showForm ? '✕ Cancel' : '+ New Goal'}
        </motion.button>
      </motion.div>

      {showForm && <GoalForm onClose={() => setShowForm(false)} />}

      {activeGoals.length === 0 && !showForm ? (
        <div className="glass p-10 text-center space-y-3">
          <span className="text-5xl block">🎯</span>
          <p className="text-slate-600 text-sm">No savings goals yet.</p>
          <p className="text-xs text-slate-400">Set a goal to stay motivated and track your progress.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-block mt-2 px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl"
          >
            Create your first goal →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500">Completed ({completedGoals.length})</h2>
          {completedGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}
    </div>
  );
}
