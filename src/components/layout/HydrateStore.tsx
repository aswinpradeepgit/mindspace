'use client';

import { useEffect } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';

export function HydrateStore() {
  const hydrate = useExpenseStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
