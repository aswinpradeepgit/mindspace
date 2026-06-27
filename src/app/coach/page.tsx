'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { hapticLight } from '@/lib/native';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Why am I overspending?',
  'How can I save more this month?',
  "What's my biggest spending weakness?",
];

export default function CoachChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;
    hapticLight();
    const history = messages;
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setInput('');
    setSending(true);
    try {
      const res = await apiFetch<{ reply: string }>('/api/v1/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      });
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "I couldn't think just now — try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      <div className="flex items-center gap-2 pb-3">
        <button onClick={() => router.back()} className="text-slate-600 text-sm" aria-label="Back">
          ←
        </button>
        <span className="text-xl spin-slow">🤖</span>
        <div>
          <h1 className="text-base font-bold text-slate-900">Talk to your coach</h1>
          <p className="text-[11px] text-slate-500">Grounded in your real spending</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <div className="space-y-3 pt-4">
            <p className="text-sm text-slate-500 text-center">
              Ask me anything about your money 💜
            </p>
            <div className="flex flex-col gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="glass text-left text-sm text-slate-700 px-3 py-2.5 border border-purple-500/15"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-md'
                  : 'glass text-slate-800 rounded-bl-md border border-purple-500/15'
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="glass px-4 py-3 rounded-2xl rounded-bl-md border border-purple-500/15">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask your coach…"
          className="flex-1 bg-white px-3.5 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
        />
        <button
          onClick={() => send(input)}
          disabled={sending || !input.trim()}
          className="px-4 rounded-xl text-sm font-semibold bg-purple-600 text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
