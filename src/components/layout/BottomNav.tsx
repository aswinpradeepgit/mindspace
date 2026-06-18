'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { hapticLight } from '@/lib/native';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/add', icon: '➕', label: 'Add' },
  { href: '/insights', icon: '📊', label: 'Insights' },
  { href: '/goals', icon: '🎯', label: 'Goals' },
  { href: '/leaderboard', icon: '🏆', label: 'Badges' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="glass-solid flex items-center justify-around py-3 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => hapticLight()} className="relative flex flex-col items-center gap-1 px-3 py-1">
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-purple-600/20 border border-purple-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10">{item.icon}</span>
                <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-purple-600' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
