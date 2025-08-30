'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anon) {
  console.error(
    '[Supabase] Variáveis em falta:',
    { NEXT_PUBLIC_SUPABASE_URL: !!url, NEXT_PUBLIC_SUPABASE_ANON_KEY: !!anon }
  );
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
