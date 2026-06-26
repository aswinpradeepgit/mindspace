'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/nativeAuth';
import { apiFetch } from '@/lib/api';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  return user ? (
    <SignedIn email={user.email ?? ''} onSignOut={signOut} />
  ) : (
    <AuthForm />
  );
}

// ── Google "G" logo ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.5-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5c-.5.4 7-5.1 7-14.4 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const google = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const submitEmail = async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // If confirmation is off, a session is returned and AuthProvider takes over.
        // If on, there's no session yet.
        if (!data.session) {
          setInfo("Almost there — tap the confirmation link we just emailed you, then sign in.");
        } else {
          router.push('/');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-14 pb-9"
      >
        <h1 className="text-4xl font-bold gradient-text tracking-tight">MindSpend</h1>
        <p className="text-slate-600 text-sm mt-3 px-6">
          Spend with awareness. Save more, feel better.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6 space-y-4"
      >
        {/* Google — primary, mobile-friendly */}
        <button
          onClick={google}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-semibold text-sm shadow-sm hover:bg-slate-50 transition-all"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-purple-100" />
          <span className="text-[11px] text-slate-400 font-medium">or use email</span>
          <div className="h-px flex-1 bg-purple-100" />
        </div>

        {/* Email + password */}
        <div className="flex gap-1 bg-purple-50/70 p-1 rounded-xl">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white px-4 py-3 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
        />
        <input
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white px-4 py-3 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
        />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={submitEmail}
          disabled={busy || !email || password.length < 6}
          className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all ${
            busy || !email || password.length < 6
              ? 'bg-purple-50/70 text-slate-400'
              : 'bg-purple-600 hover:bg-purple-500 text-white glow-purple'
          }`}
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </motion.button>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        {info && <p className="text-xs text-emerald-600 text-center leading-relaxed">{info}</p>}
      </motion.div>

      <p className="text-center text-[11px] text-slate-400 mt-6 px-8 leading-relaxed">
        Your data syncs securely to your account across all your devices.
      </p>
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
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Account</h1>
        <p className="text-slate-600 text-sm">Your cloud account & sync.</p>
      </motion.div>

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

      <Link href="/" className="block text-center text-xs text-purple-600">
        ← Back to dashboard
      </Link>
    </div>
  );
}
