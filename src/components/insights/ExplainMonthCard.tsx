'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ExplainResponse {
  narrative: string;
  cached?: boolean;
}

/** Reveal `text` character-by-character for a premium "typing" feel. */
function useTypewriter(text: string, speed = 16): string {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return shown;
}

export function ExplainMonthCard() {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);
  const shown = useTypewriter(narrative);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const res = await apiFetch<ExplainResponse>(
        `/api/v1/insights/explain${refresh ? '?refresh=true' : ''}`,
      );
      setNarrative(res.narrative || '');
    } catch {
      setNarrative('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="glass p-4 space-y-2 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h3 className="text-sm font-bold text-slate-900">Explain my month</h3>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading}
          className="text-[11px] font-semibold text-purple-600 disabled:text-slate-400"
        >
          ↻ Refresh
        </button>
      </div>

      {loading && !shown ? (
        <div className="space-y-2 pt-1">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed min-h-[3.5rem]">
          {shown}
          {shown.length < narrative.length && (
            <span className="ml-0.5 inline-block animate-pulse text-purple-500">▋</span>
          )}
        </p>
      )}
    </div>
  );
}
