// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  // Isto ajuda a diagnosticar se as ENV não chegaram ao client
  console.error('[SUPABASE] Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY')
}

export const supabase = createClient(url as string, anon as string)
