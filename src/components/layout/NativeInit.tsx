'use client';

import { useEffect } from 'react';
import { initNative } from '@/lib/native';
import { completeNativeAuth, isNative } from '@/lib/nativeAuth';

/** Runs native setup (status bar, splash, daily reminder) once on mount and
    handles the Google OAuth deep-link callback. No-ops on web/preview. */
export function NativeInit() {
  useEffect(() => {
    initNative();

    if (!isNative()) return;

    let remove: (() => void) | undefined;
    (async () => {
      const { App } = await import('@capacitor/app');
      const handle = await App.addListener('appUrlOpen', ({ url }) => {
        completeNativeAuth(url).catch(() => {});
      });
      remove = () => handle.remove();
    })();

    return () => remove?.();
  }, []);

  return null;
}
