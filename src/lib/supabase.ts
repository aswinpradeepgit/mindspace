'use client';

import { createClient } from '@supabase/supabase-js';

// Browser Supabase client — used for auth only (login/signup/session).
// The publishable (anon) key is safe to ship in the client; row access is
// protected by RLS + the FastAPI backend.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
