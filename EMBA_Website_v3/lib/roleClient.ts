// lib/roleClient.ts
'use client'
import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

let cachedRole: AppRole | null | undefined // undefined = ainda não lido
let inflight: Promise<AppRole | null> | null = null

export function clearRoleCache() {
  cachedRole = undefined
  inflight = null
}

async function readRoleOnce(): Promise<AppRole | null> {
  // 1) user atual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 2) tenta RPC (se existir)
  try {
    const { data, error } = await supabase.rpc('current_user_role')
    if (!error && data) return data as AppRole
  } catch {}

  // 3) fallback: tabela app_users
  const { data, error } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.warn('role table error:', error)
    return null
  }
  return (data?.role as AppRole) ?? null
}

function withTimeout<T>(p: Promise<T>, ms = 2000): Promise<T> {
  return new Promise((resolve) => {
    let done = false
    const t = setTimeout(() => {
      if (!done) resolve(null as any)
    }, ms)
    p.then(v => { done = true; clearTimeout(t); resolve(v) })
     .catch(() => { done = true; clearTimeout(t); resolve(null as any) })
  })
}

export async function fetchRoleWithRetry(): Promise<AppRole | null> {
  if (cachedRole !== undefined) return cachedRole ?? null
  if (!inflight) inflight = withTimeout(readRoleOnce(), 2000) // nunca fica pendente para sempre
  cachedRole = await inflight
  inflight = null
  return cachedRole ?? null
}

export default fetchRoleWithRetry
