// lib/roleClient.ts
'use client'

import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

export async function fetchUserRole(): Promise<AppRole | null> {
  // 1) Utilizador autenticado
  const { data: userData, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.warn('getUser error:', authErr)
    return null
  }
  const userId = userData?.user?.id
  if (!userId) return null

  // 2) Tenta RPC (se existir). Ignora se não houver.
  try {
    const { data, error } = await supabase.rpc('current_user_role')
    if (!error && data) return data as AppRole
  } catch {
    /* segue para fallback */
  }

  // 3) Fallback: lê de app_users
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

export default fetchUserRole
