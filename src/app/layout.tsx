import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { AchievementToast } from '@/components/gamification/AchievementToast';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import { Toaster } from '@/components/ui/sonner';
import { HydrateStore } from '@/components/layout/HydrateStore';
import { NativeInit } from '@/components/layout/NativeInit';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen text-slate-900 pb-24">
        <HydrateStore />
        <NativeInit />
        <main className="max-w-2xl mx-auto px-4 pt-6">
          {children}
        </main>
        <BottomNav />
        <AchievementToast />
        <LevelUpModal />
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
