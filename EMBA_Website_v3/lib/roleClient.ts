// lib/roleClient.ts
'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

/**
 * Devolve o papel do utilizador autenticado (ou null se não houver sessão).
 * Primeiro tenta uma RPC 'current_user_role' (se existir); caso contrário,
 * consulta a tabela public.app_users.
 */
export async function fetchUserRole(): Promise<AppRole | null> {
  // 1) Obter o utilizador atual
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.warn('getUser error:', authErr)
    return null
  }
  if (!user) return null

  // 2) (Opcional) tentar RPC se a tiveres criado; ignorar se não existir
  try {
    const { data, error } = await supabase.rpc('current_user_role')
    if (!error && data) return data as AppRole
  } catch {
    // sem RPC? segue para a query normal
  }

  // 3) Fallback: ler da tabela app_users
  const { data, error } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)        // <- user está garantidamente definido aqui
    .maybeSingle()

  if (error) {
    console.warn('role query error:', error)
    return null
  }

  return (data?.role as AppRole) ?? null
}

// Mantém um default export para evitar quebras onde é importado por defeito
export default fetchUserRole
