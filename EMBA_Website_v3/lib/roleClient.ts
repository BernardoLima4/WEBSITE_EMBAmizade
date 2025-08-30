// lib/roleClient.ts
'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

/**
 * Lê o papel do utilizador autenticado (ou null se não houver sessão).
 * Tenta uma RPC 'current_user_role' se existir; caso contrário usa a tabela public.app_users.
 */
export async function fetchUserRole(): Promise<AppRole | null> {
  // Obtém o ID do utilizador de forma segura
  const { data, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.warn('getUser error:', authErr)
    return null
  }
  const userId = data?.user?.id
  if (!userId) return null

  // Tentativa opcional: RPC (ignora se não existir)
  try {
    const { data: r1, error: e1 } = await supabase.rpc('current_user_role')
    if (!e1 && r1) return r1 as AppRole
  } catch {
    // sem RPC -> continua para a query normal
  }

  // Fallback: ler de app_users
  const { data: r2, error: e2 } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', userId) // <- usamos userId, nunca 'user.id' direto
    .maybeSingle()

  if (e2) {
    console.warn('role query error:', e2)
    return null
  }

  return (r2?.role as AppRole) ?? null
}

// manter default export para imports existentes
export default fetchUserRole
