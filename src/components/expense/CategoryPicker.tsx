'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';
import { CATEGORY_LIST, CUSTOM_CATEGORY_COLORS, CUSTOM_CATEGORY_ICONS } from '@/lib/categories';
import { useExpenseStore } from '@/hooks/useExpenseStore';

interface Props {
  value: Category | null;
  onChange: (cat: Category) => void;
}

export function CategoryPicker({ value, onChange }: Props) {
  const customCategories = useExpenseStore((s) => s.profile.customCategories ?? []);
  const addCustomCategory = useExpenseStore((s) => s.addCustomCategory);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState(CUSTOM_CATEGORY_ICONS[0]);
  const [color, setColor] = useState(CUSTOM_CATEGORY_COLORS[0]);

  const handleAdd = () => {
    if (!label.trim()) return;
    addCustomCategory({ label: label.trim(), icon, color });
    setLabel('');
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {CATEGORY_LIST.map((cat) => {
          const isSelected = value === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onChange(cat.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                isSelected
                  ? `${cat.bgClass} ${cat.borderClass} ${cat.textClass}`
                  : 'bg-purple-50/50 border-purple-100/70 text-slate-500 hover:bg-purple-50'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{cat.label}</span>
            </motion.button>
          );
        })}

        {/* Custom categories */}
        {customCategories.map((cat) => {
          const isSelected = value === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onChange(cat.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all"
              style={
                isSelected
                  ? { background: `${cat.color}25`, borderColor: `${cat.color}60`, color: cat.color }
                  : { background: 'rgba(124,92,255,0.05)', borderColor: 'rgba(124,92,255,0.12)', color: '#8b7da3' }
              }
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{cat.label}</span>
            </motion.button>
          );
        })}

        {/* Add button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => setAdding((v) => !v)}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-dashed border-purple-200 text-slate-500 hover:bg-purple-50/60 hover:text-purple-600 transition-all"
        >
          <span className="text-2xl">{adding ? '✕' : '＋'}</span>
          <span className="text-[10px] font-medium">{adding ? 'Close' : 'Add'}</span>
        </motion.button>
      </div>

      {/* Add custom category form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass p-4 space-y-3 overflow-hidden"
          >
            <p className="text-sm font-medium text-slate-700">New category</p>
            <input
              type="text"
              placeholder="Category name (e.g. Pets, Coffee)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={18}
              className="w-full glass px-3 py-2.5 text-sm text-slate-900 outline-none rounded-xl border border-purple-100"
            />
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5">Icon</p>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOM_CATEGORY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`text-lg p-1 rounded-lg transition-all ${icon === ic ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'hover:bg-purple-50/70'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5">Color</p>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-all"
                    style={{ background: c, outline: color === c ? `2px solid white` : 'none', outlineOffset: 2 }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!label.trim()}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                label.trim() ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-purple-50/70 text-slate-400'
              }`}
            >
              Add Category
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
