// Thin, safe wrappers around Capacitor native plugins.
// Everything is guarded so the same code runs in the browser/preview (no-op)
// and on a real device (native). Plugins are dynamically imported so the web
// bundle never breaks if a native module isn't available.

import { Capacitor } from '@capacitor/core';

export const isNative = () =>
  typeof window !== 'undefined' && Capacitor.isNativePlatform();

// ── Haptics ──────────────────────────────────────────────────────────────────
// Haptics has a web vibration fallback, so we let it run everywhere.

export async function hapticLight() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* not available — ignore */
  }
}

export async function hapticMedium() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    /* ignore */
  }
}

export async function hapticSuccess() {
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* ignore */
  }
}

// ── Status bar + splash + daily reminder (native only) ───────────────────────

export async function initNative() {
  if (!isNative()) return;

  // Status bar: dark icons on our light background, matching the theme.
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light }); // Light = dark text/icons
    await StatusBar.setBackgroundColor({ color: '#fdf7ff' });
  } catch {
    /* ignore (e.g. iOS doesn't support setBackgroundColor) */
  }

  // Hide the native splash once the web app is ready.
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    /* ignore */
  }

  // Schedule a gentle daily reminder to log expenses / keep the streak.
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display === 'granted') {
      // Clear any previous schedule, then set a daily 8pm nudge.
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1001,
            title: 'How did today go? 💸',
            body: 'Log your spending and keep your streak alive in MindSpend.',
            schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true },
          },
        ],
      });
    }
  } catch {
    /* ignore */
  }
}
