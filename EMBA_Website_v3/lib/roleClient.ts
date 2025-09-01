"use client";

import { supabase } from "./supabaseClient";

export type AppRole = "admin" | "teacher" | "parent";

const roleCache = new Map<string, AppRole | null>();

export function clearRoleCache(userId?: string) {
  if (userId) roleCache.delete(userId);
  else roleCache.clear();
}

async function fetchRoleOnce(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.role as AppRole | undefined) ?? null;
}

export async function fetchRoleWithRetry(
  maxAttempts = 3,
  baseDelayMs = 300
): Promise<AppRole | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  if (roleCache.has(user.id)) return roleCache.get(user.id) ?? null;

  let lastErr: unknown = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const role = await fetchRoleOnce(user.id);
      roleCache.set(user.id, role);
      return role;
    } catch (err) {
      lastErr = err;
      const wait = baseDelayMs * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  console.warn("fetchRoleWithRetry falhou:", lastErr);
  return null;
}

// default export para compatibilidade
export default async function fetchUserRole(): Promise<AppRole | null> {
  return fetchRoleWithRetry(1, 0);
}
