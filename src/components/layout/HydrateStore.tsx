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
      store.hydrate().catch(() => {});
    } else {
      store.reset();
    }
  }, [session, loading]);

  return null;
}
