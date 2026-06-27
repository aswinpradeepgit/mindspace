'use client';

import { useEffect } from 'react';
import { initNative } from '@/lib/native';
import { completeNativeAuth, isNative } from '@/lib/nativeAuth';
import { registerPush } from '@/lib/push';
import { supabase } from '@/lib/supabase';

/** Runs native setup (status bar, splash, daily reminder) once on mount,
    handles the Google OAuth deep-link callback, and registers for push
    notifications once the user is signed in. No-ops on web/preview. */
export function NativeInit() {
  useEffect(() => {
    initNative();

    if (!isNative()) return;

    let removeUrl: (() => void) | undefined;
    (async () => {
      const { App } = await import('@capacitor/app');
      const handle = await App.addListener('appUrlOpen', ({ url }) => {
        completeNativeAuth(url).catch(() => {});
      });
      removeUrl = () => handle.remove();
    })();

    // Register for push as soon as we have a session (now or after login).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) registerPush();
    });
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) registerPush();
    });

    return () => {
      removeUrl?.();
      authSub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
