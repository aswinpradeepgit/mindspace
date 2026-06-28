'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { hapticLight } from '@/lib/native';

/** True while the on-screen keyboard is open (viewport shrinks). Lets us hide
 *  the fixed bottom nav so it doesn't float up over the content. */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          // Native: the Keyboard plugin fires reliable show/hide events.
          const { Keyboard } = await import('@capacitor/keyboard');
          const show = await Keyboard.addListener('keyboardWillShow', () => setOpen(true));
          const hide = await Keyboard.addListener('keyboardWillHide', () => setOpen(false));
          cleanups.push(() => show.remove(), () => hide.remove());
          return;
        }
      } catch {
        /* fall through to web */
      }
      const vv = window.visualViewport;
      if (vv) {
        const onResize = () => setOpen(window.innerHeight - vv.height > 150);
        vv.addEventListener('resize', onResize);
        cleanups.push(() => vv.removeEventListener('resize', onResize));
      }
    })();
    return () => cleanups.forEach((fn) => fn());
  }, []);
  return open;
}

const SIDE_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/insights', label: 'Insights', icon: '📊' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/journal', label: 'Journal', icon: '📖' },
];

export function BottomNav() {
  const pathname = usePathname();
  const keyboardOpen = useKeyboardOpen();

  // The account / login page is a full-screen surface with its own back link —
  // no bottom nav there. Also hide while typing so it doesn't obstruct inputs.
  if (pathname.startsWith('/account') || keyboardOpen) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const NavItem = ({ href, label, icon }: (typeof SIDE_ITEMS)[number]) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={() => hapticLight()}
        className="flex flex-col items-center gap-1 w-16 py-1"
      >
        <span className="text-xl">{icon}</span>
        <span className={`text-[10px] font-medium ${active ? 'text-purple-600' : 'text-slate-500'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="max-w-2xl mx-auto px-4 pb-4"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="glass-solid relative flex items-center justify-between px-5 py-2.5">
          <NavItem {...SIDE_ITEMS[0]} />
          <NavItem {...SIDE_ITEMS[1]} />

          {/* Center slot for the raised Add FAB */}
          <div className="w-16" aria-hidden />

          <NavItem {...SIDE_ITEMS[2]} />
          <NavItem {...SIDE_ITEMS[3]} />

          {/* Raised Add FAB */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="absolute left-1/2 -translate-x-1/2 -top-6"
          >
            <Link
              href="/add"
              onClick={() => hapticLight()}
              aria-label="Add expense"
              className="flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg shadow-purple-500/40 ring-4 ring-[var(--bg-base)]"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-7 h-7">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
