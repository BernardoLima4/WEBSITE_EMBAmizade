'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

let cached: { role: AppRole | null; at: number } | null = null
const TTL_MS = 30_000

export function clearRoleCache() {
  cached = null
}

export async function fetchRoleWithRetry(): Promise<AppRole | null> {
  const now = Date.now()
  if (cached && now - cached.at < TTL_MS) return cached.role

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    if (authErr) console.warn('auth.getUser error:', authErr)
    cached = { role: null, at: now }
    return null
  }

  try {
    const r1 = await supabase.rpc('current_user_role')
    if (!r1.error && r1.data) {
      const role = r1.data as AppRole
      cached = { role, at: now }
      return role
    }
  } catch {}

  const r2 = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (r2.error) {
    console.warn('role query error:', r2.error)
    cached = { role: null, at: now }
    return null
  }

  const role = (r2.data?.role ?? null) as AppRole | null
  cached = { role, at: now }
  return role
}
export default fetchRoleWithRetry;
