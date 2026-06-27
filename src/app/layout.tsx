import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { AchievementToast } from '@/components/gamification/AchievementToast';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import { Toaster } from '@/components/ui/sonner';
import { HydrateStore } from '@/components/layout/HydrateStore';
import { NativeInit } from '@/components/layout/NativeInit';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthGate } from '@/components/auth/AuthGate';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MindSpend — Gamified Finance Tracker',
  description: 'Track expenses, understand emotions, build wealth.',
};

// viewport-fit: cover → the app draws into the notch/safe areas; we then pad
// content with env(safe-area-inset-*) (see globals.css / BottomNav).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fdf7ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen text-slate-900 pb-24">
        <AuthProvider>
          <HydrateStore />
          <NativeInit />
          <AuthGate>
            <main className="max-w-2xl mx-auto px-4 pt-6">
              {children}
            </main>
            <BottomNav />
            <AchievementToast />
            <LevelUpModal />
          </AuthGate>
          <Toaster theme="light" position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
