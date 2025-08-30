'use client'
import { supabase } from './supabaseClient'

export type AppRole = 'admin'|'teacher'|'parent'
const KEY = 'app_role_cache_v1'

type Cache = { role: AppRole; exp: number }

export async function fetchRoleWithRetry(): Promise<AppRole|null> {
  const { data:{ user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1) cache (5 min)
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const c = JSON.parse(raw) as Cache
      if (c.exp > Date.now()) return c.role
    }
  } catch {}

  // 2) tentativas (RPC my_role -> SELECT) com pequeno backoff
  async function tryOnce(): Promise<AppRole|null> {
    try {
      const r1 = await supabase.rpc('my_role')
      if (!r1.error && r1.data) return r1.data as AppRole
    } catch {}
    const r2 = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle()
    if (r2.error) throw r2.error
    return (r2.data?.role as AppRole) ?? null
  }

  let role: AppRole|null = null
  for (let i=0; i<3 && !role; i++) {
    try { role = await tryOnce() } catch { /* espera e tenta outra vez */ await new Promise(r=>setTimeout(r, 600*(i+1))) }
  }

  if (role) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ role, exp: Date.now() + 5*60*1000 }))
    } catch {}
  }

  return role
}

export function clearRoleCache(){ try{ sessionStorage.removeItem(KEY) }catch{} }
