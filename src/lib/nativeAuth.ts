'use client';

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

// Custom URL scheme deep link the OAuth flow returns to on native.
// Must match the AndroidManifest intent-filter and the Supabase redirect allow-list.
export const NATIVE_REDIRECT = 'com.mindspend.app://auth-callback';

export function isNative(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

/**
 * Google sign-in that works on both web and the native APK.
 * - Web: normal redirect back to the site origin.
 * - Native: open the system browser, then deep-link back into the app where
 *   the appUrlOpen listener (in NativeInit) exchanges the code for a session.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!isNative()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message ?? null };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
  });
  if (error) return { error: error.message };

  if (data?.url) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url });
  }
  return { error: null };
}

/** Complete the native OAuth flow from the deep-link URL. */
export async function completeNativeAuth(url: string): Promise<void> {
  if (!url.startsWith('com.mindspend.app://auth-callback')) return;

  // The code is in the query string (PKCE flow): ...auth-callback?code=XXedit
  const codeMatch = url.match(/[?&]code=([^&]+)/);
  if (codeMatch) {
    const code = decodeURIComponent(codeMatch[1]);
    await supabase.auth.exchangeCodeForSession(code);
  }

  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.close();
  } catch {
    /* browser may already be closed */
  }
}
