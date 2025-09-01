'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { fetchRoleWithRetry, clearRoleCache, AppRole } from '@/lib/roleClient'
import { fetchUserRole, clearRoleCache, AppRole } from '@/lib/roleClient'

export default function HeaderClient() {
  const [email, setEmail] = useState<string|null>(null)
  const [role, setRole] = useState<AppRole|null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
      const r = await fetchRoleWithRetry()
      setRole(r)
    })()
  }, [pathname])

  async function handleLogin() {
    router.push('/login')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    clearRoleCache()
    setEmail(null)
    setRole(null)
    router.push('/')
  }

  return (
    <div className="flex items-center gap-3">
      {email ? (
        <>
          <span className="text-sm opacity-80">{email}{role ? ` · ${role}`:''}</span>
          <button className="btn" onClick={handleLogout}>Sair</button>
        </>
      ) : (
        <button className="btn btn-primary" onClick={handleLogin}>Entrar</button>
      )}
    </div>
  )
}
