'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Account</h1>
        <p className="text-slate-600 text-sm">
          {user ? 'Your cloud account & sync.' : 'Sign in to sync across devices.'}
        </p>
      </motion.div>

      {user ? <SignedIn email={user.email ?? ''} onSignOut={signOut} /> : <AuthForm />}

      <Link href="/" className="block text-center text-xs text-purple-600 pt-2">
        ← Back to dashboard
      </Link>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created! If email confirmation is on, check your inbox, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // AuthProvider picks up the session automatically.
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex gap-1 glass p-1 rounded-xl">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-purple-600 text-white' : 'text-slate-600'
            }`}
          >
            {m === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full glass px-4 py-3 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none placeholder:text-slate-400"
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full glass px-4 py-3 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none placeholder:text-slate-400"
      />

      <button
        onClick={submit}
        disabled={busy || !email || password.length < 6}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          busy || !email || password.length < 6
            ? 'bg-purple-50/70 text-slate-400'
            : 'bg-purple-600 hover:bg-purple-500 text-white'
        }`}
      >
        {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
      </button>

      {msg && <p className="text-xs text-slate-600 leading-relaxed">{msg}</p>}
    </div>
  );
}

function SignedIn({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [out, setOut] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    setOut(`${label}…`);
    try {
      const data = await fn();
      setOut(`✅ ${label}\n${JSON.stringify(data, null, 2)}`);
    } catch (e) {
      setOut(`❌ ${label}\n${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm font-semibold text-slate-900">{email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="text-xs font-medium text-red-500 px-3 py-1.5 rounded-lg bg-red-50"
        >
          Sign out
        </button>
      </div>

      <div className="glass p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">🔌 Backend connection test</h3>
        <p className="text-[11px] text-slate-500">
          Confirms login → token → your live API on Render works end to end.
        </p>
        <div className="grid grid-cols-1 gap-2">
          <button
            disabled={busy}
            onClick={() => run('GET /me', () => apiFetch('/api/v1/me'))}
            className="py-2.5 rounded-xl text-sm font-medium bg-purple-600 text-white disabled:opacity-50"
          >
            Test authenticated /me
          </button>
          <button
            disabled={busy}
            onClick={() =>
              run('POST /expenses', () =>
                apiFetch('/api/v1/expenses', {
                  method: 'POST',
                  body: JSON.stringify({
                    amount: 25000,
                    category: 'food',
                    description: 'Cloud test latte',
                    date: new Date().toISOString().split('T')[0],
                    emotion: 'content',
                    intent: 'treat',
                    regret: false,
                    would_spend_less: false,
                  }),
                }),
              )
            }
            className="py-2.5 rounded-xl text-sm font-medium bg-cyan-600 text-white disabled:opacity-50"
          >
            Create a cloud expense
          </button>
          <button
            disabled={busy}
            onClick={() => run('GET /expenses', () => apiFetch('/api/v1/expenses'))}
            className="py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white disabled:opacity-50"
          >
            List my cloud expenses
          </button>
        </div>
        {out && (
          <pre className="text-[10px] bg-slate-900 text-emerald-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {out}
          </pre>
        )}
      </div>
    </div>
  );
}
