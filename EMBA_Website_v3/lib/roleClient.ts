// lib/roleClient.ts
'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

// cache simples em memória (lado do cliente)
let roleCache: AppRole | null | undefined

/** Obtém o papel do utilizador autenticado. */
export async function fetchUserRole(): Promise<AppRole | null> {
  // 1) devolve do cache, se já tivermos
  if (roleCache !== undefined) return roleCache

  // 2) utilizador autenticado?
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    roleCache = null
    return roleCache
  }

  // 3) tentar RPC opcional (se existir)
  try {
    const { data, error } = await supabase.rpc('current_user_role')
    if (!error && data) {
      roleCache = data as AppRole
      return roleCache
    }
  } catch {
    // ignora se a RPC não existir
  }

  // 4) fallback: tabela app_users
  const r2 = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  roleCache = r2.error ? null : ((r2.data?.role as AppRole) ?? null)
  return roleCache
}

/** Limpa o cache (por ex., depois de logout). */
export function clearRoleCache() {
  roleCache = undefined
}

/** Compatibilidade com código antigo */
export const fetchRoleWithRetry = fetchUserRole

// opcional: export default para quem fizer import default
export default fetchUserRole
