'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

let cached: { role: AppRole | null; at: number } | null = null
const TTL_MS = 30_000

export function clearRoleCache() {
  cached = null
}

/**
 * Obtém o role do utilizador autenticado.
 * 1) tenta a função RPC current_user_role (se existir)
 * 2) senão, lê de app_users
 * Mantém um cache leve por 30s para evitar sobrecarga.
 */
export async function fetchRoleWithRetry(): Promise<AppRole | null> {
  const now = Date.now()
  if (cached && now - cached.at < TTL_MS) return cached.role

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    if (authErr) console.warn('auth.getUser error:', authErr)
    cached = { role: null, at: now }
    return null
  }

  // 1) Tentar via RPC (se tiveres criado a função no SQL)
  try {
    const r1 = await supabase.rpc('current_user_role')
    if (!r1.error && r1.data) {
      const role = r1.data as AppRole
      cached = { role, at: now }
      return role
    }
  } catch {
    // ignora: passa ao plano B
  }

  // 2) Plano B: ler da tabela app_users
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

/** Alias para compatibilidade com imports antigos (default). */
export const fetchUserRole = fetchRoleWithRetry
export default fetchUserRole
