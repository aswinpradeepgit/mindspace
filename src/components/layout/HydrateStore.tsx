'use client';

import { useEffect } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { useAuth } from '@/components/auth/AuthProvider';

export function HydrateStore() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const store = useExpenseStore.getState();
    if (session) {
      // Load this user's cloud data (re-runs if the account changes).
      store
        .hydrate()
        .then(() => {
          // First sign-in: if the name is still the default, derive a display
          // name from the Google identity (or email) and save it once.
          const profile = useExpenseStore.getState().profile;
          if (profile.name && profile.name !== 'You') return;
          const m = (session.user.user_metadata ?? {}) as Record<string, string>;
          const raw =
            m.given_name ||
            (m.full_name || m.name || '').split(' ')[0] ||
            session.user.email?.split('@')[0] ||
            '';
          const first = raw.trim();
          if (first) {
            useExpenseStore
              .getState()
              .updateProfile({ name: first.charAt(0).toUpperCase() + first.slice(1) });
          }
        })
        .catch(() => {});
    } else {
      store.reset();
    }
  }, [session, loading]);

  return null;
}
