'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Role = 'admin'|'teacher'|'parent'|null

export default function HeaderClient() {
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole]   = useState<Role>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  async function loadSessionAndRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
      if (!user) { setRole(null); return }
      const { data: r } = await supabase.from('app_users')
        .select('role').eq('id', user.id).maybeSingle()
      setRole((r?.role as Role) ?? null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessionAndRole()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // sempre que login/logout acontecer, volta a carregar
      loadSessionAndRole()
    })
    return () => sub?.subscription.unsubscribe()
  }, [])

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } finally {
      // força transição independente do router caso o cache prenda
      router.push('/login')
      router.refresh()
      setTimeout(() => { window.location.assign('/login') }, 50)
    }
  }

  const area =
    role === 'admin'   ? '/admin'   :
    role === 'teacher' ? '/teacher' :
    role === 'parent'  ? '/parent'  : '/login'

  return (
    <div className="flex items-center gap-4">
      {!loading && email ? (
