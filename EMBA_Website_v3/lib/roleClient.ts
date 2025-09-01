"use client";

import { supabase } from "./supabaseClient";

export type AppRole = "admin" | "teacher" | "parent";

// cache simples em memória por userId
const roleCache = new Map<string, AppRole | null>();

export function clearRoleCache(userId?: string) {
  if (userId) roleCache.delete(userId);
  else roleCache.clear();
}

// lê a role uma vez da tabela app_users
async function fetchRoleOnce(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.role as AppRole | undefined) ?? null;
}

/**
 * Tenta obter a role do utilizador autenticado, com pequenas tentativas de retry
 * (útil logo após o sign-in enquanto a linha em app_users é criada).
 */
export async function fetchRoleWithRetry(
  maxAttempts = 3,
  baseDelayMs = 300
): Promise<AppRole | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  // cache
  if (roleCache.has(user.id)) return roleCache.get(user.id) ?? null;

  let lastErr: unknown = null;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const role = await fetchRoleOnce(user.id);
      roleCache.set(user.id, role);
      return role;
    } catch (err) {
      lastErr = err;
      // backoff simples
      const wait = baseDelayMs * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  console.warn("fetchRoleWithRetry: falhou após tentativas", lastErr);
  return null;
}

/**
 * Export default para compatibilidade com imports antigos:
 *   import fetchUserRole from '@/lib/roleClient'
 */
export default async function fetchUserRole(): Promise<AppRole | null> {
  return fetchRoleWithRetry(1, 0);
}
