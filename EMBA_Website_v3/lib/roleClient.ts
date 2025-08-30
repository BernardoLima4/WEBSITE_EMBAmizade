// lib/roleClient.ts
'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

export async function fetchUserRole(): Promise<AppRole | null> {
  // 1) Obter o utilizador autenticado de forma typesafe
  const { data: userData, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.warn('getUser error:', authErr)
    return null
  }
  const userId = userData?.user?.id
  if (!userId) return null

  // 2) Tentar RPC (se existir no teu projeto)
  try {
    const { data, error } = await supabase.rpc('current_user_role')
    if (!error && data) return data as AppRole
  } catch {
    // ignora, seguimos para fallback
  }

  // 3) Fallback: ler papel na app_users, garantindo userId definido
  const { data: row, error } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('role query error:', error)
    return null
  }
  return (row?.role as AppRole) ?? null
}

// Mantém também o default export para quem importar por defeito
export default fetchUserRole
