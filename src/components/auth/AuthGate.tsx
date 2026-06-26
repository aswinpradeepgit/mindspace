'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

/** Requires a logged-in user for every route except /account (the login page). */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname.startsWith('/account');

  useEffect(() => {
    if (!loading && !session && !isAuthRoute) {
      router.replace('/account');
    }
  }, [loading, session, isAuthRoute, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  // Not signed in and not on the login page → we're redirecting; render nothing.
  if (!session && !isAuthRoute) return null;

  return <>{children}</>;
}
