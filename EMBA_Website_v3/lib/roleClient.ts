'use client';

import { supabase } from './supabaseClient';

export type AppRole = 'admin' | 'teacher' | 'parent';

/** Devolve o papel do utilizador autenticado (ou null). */
export default async function fetchUserRole(): Promise<AppRole | null> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) {
    console.warn('[role] getUser error:', authErr);
    return null;
  }
  if (!user) return null;

  // 1) Se tiveres criado a RPC 'current_user_role', tenta primeiro (ignora se não existir)
  try {
    const { data, error } = await supabase.rpc('current_user_role');
    if (!error && data) return data as AppRole;
  } catch (_) {}

  // 2) Fallback: vai à tabela app_users
  const r = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle();
  if (r.error) {
    console.warn('[role] query app_users error:', r.error);
    return null;
  }
  return (r.data?.role as AppRole) ?? null;
}
