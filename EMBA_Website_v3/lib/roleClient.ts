// EMBA_Website_v3/lib/roleClient.ts
'use client';

import { supabase } from './supabaseClient';

export type AppRole = 'admin' | 'teacher' | 'parent';

// cache simples em memória do browser
let _cachedRole: AppRole | null | undefined = undefined;

export function clearRoleCache() {
  _cachedRole = undefined;
}

/** Obtém o papel do utilizador autenticado (ou null se não autenticado). */
export async function fetchRoleWithRetry(): Promise<AppRole | null> {
  // se já tínhamos cache (inclui null), devolve
  if (_cachedRole !== undefined) return _cachedRole ?? null;

  // 1) utilizador atual
  const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
  if (getUserErr) {
    console.warn('getUser error:', getUserErr);
    _cachedRole = null;
    return null;
  }
  if (!user) {
    _cachedRole = null;
    return null;
  }

  // 2) tenta RPC (se existir)
  try {
    const { data, error } = await supabase.rpc('current_user_role');
    if (!error && data) {
      _cachedRole = data as AppRole;
      return _cachedRole;
    }
  } catch { /* sem stress */ }

  // 3) fallback: tabela app_users
  const r2 = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (r2.error) {
    console.warn('role query error:', r2.error);
    _cachedRole = null;
    return null;
  }

  _cachedRole = (r2.data?.role as AppRole | undefined) ?? null;
  return _cachedRole;
}

// export default + named para não dar mais desencontros nos imports
export default fetchRoleWithRetry;
