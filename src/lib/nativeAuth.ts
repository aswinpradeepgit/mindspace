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

async function closeBrowser() {
  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.close();
  } catch {
    /* may already be closed */
  }
}

/**
 * Complete the native OAuth flow from the deep-link URL.
 * Handles both the PKCE (?code=) and implicit (#access_token=) flows, and
 * surfaces any error so we can see it on the device.
 */
export async function completeNativeAuth(url: string): Promise<void> {
  if (!url.includes('auth-callback')) return;

  // Params can be in the query string (?...) or the hash (#...).
  const sep = url.search(/[?#]/);
  const params = new URLSearchParams(sep >= 0 ? url.slice(sep + 1) : '');

  const errorDesc = params.get('error_description') || params.get('error');
  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  try {
    if (errorDesc) {
      alert('Google sign-in error: ' + errorDesc);
      return;
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        alert('Sign-in failed (code): ' + error.message);
        return;
      }
    } else if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        alert('Sign-in failed (token): ' + error.message);
        return;
      }
    } else {
      alert('No auth code returned.\nURL: ' + url.slice(0, 160));
      return;
    }

    // Success → go to the dashboard.
    window.location.href = '/';
  } finally {
    await closeBrowser();
  }
}
