'use client';

import { apiFetch } from '@/lib/api';
import { isNative } from '@/lib/nativeAuth';

let registered = false;

/**
 * Register for FCM push notifications on native and send the device token to
 * the backend (`POST /devices`). No-op on web/preview. Idempotent — safe to
 * call on every auth change.
 *
 * Requires an active Supabase session so `apiFetch` can attach the JWT.
 */
export async function registerPush(): Promise<void> {
  if (!isNative() || registered) return;
  registered = true;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      registered = false; // let a future attempt retry after the user enables it
      return;
    }

    // Fires with the FCM token once registration succeeds → store it server-side.
    await PushNotifications.addListener('registration', (token) => {
      apiFetch('/api/v1/devices', {
        method: 'POST',
        body: JSON.stringify({ token: token.value, platform: 'android' }),
      }).catch(() => {});
    });

    await PushNotifications.addListener('registrationError', () => {
      registered = false;
    });

    // Tapping a notification opens the app; route by type when present.
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const type = action.notification?.data?.type;
      window.location.href = type === 'streak_rescue' ? '/add' : '/';
    });

    await PushNotifications.register();
  } catch {
    registered = false; // plugin missing / not native — ignore
  }
}
