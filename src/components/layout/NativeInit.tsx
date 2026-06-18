'use client';

import { useEffect } from 'react';
import { initNative } from '@/lib/native';

/** Runs native setup (status bar, splash, daily reminder) once on mount.
    No-ops on web/preview. */
export function NativeInit() {
  useEffect(() => {
    initNative();
  }, []);
  return null;
}
