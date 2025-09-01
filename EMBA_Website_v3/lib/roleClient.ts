'use client'
import { supabase } from './supabaseClient'

export type AppRole = 'admin' | 'teacher' | 'parent'

let cachedRole: AppRole | null | undefined = undefined
let lastUid: string | undefined

export async function fetchUserRole(): Promise<AppRole | null> {
  // NÃO chama a API /auth/v1/user. Usa a sessão local.
  const { data: sessionData } = await supabase.auth.getSession()
  const uid = sessionData?.session?.user?.id
  if (!uid) return null

  // cache simples por utilizador
  if (cachedRole !== undefined && lastUid === uid) {
    return cachedRole ?? null
  }

  // pergunta o papel na tabela app_users (RLS já criada permite ver a própria linha)
  const { data, error } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', uid)
    .maybeSingle()

  if (error) {
    console.warn('role query error', error)
    cachedRole = null
    lastUid = uid
    return null
  }

  cachedRole = (data?.role as AppRole) ?? null
  lastUid = uid
  return cachedRole
}

export function clearRoleCache() {
  cachedRole = undefined
  lastUid = undefined
}
