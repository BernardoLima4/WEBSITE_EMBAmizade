'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { fetchRoleWithRetry } from '@/lib/roleClient'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const role = await fetchRoleWithRetry()
        const target =
          role === 'admin'   ? '/admin'   :
          role === 'teacher' ? '/teacher' :
          role === 'parent'  ? '/parent'  : '/sem-perfil'
        router.replace(target)
      } else {
        setChecking(false)
      }
    })()
  }, [router])

  // Enquanto verifica a sessão, evita piscar de UI
  if (checking) {
    return <div className="max-w-3xl mx-auto p-8">A verificar sessão…</div>
  }

  // Sem sessão -> mostra call to action para login
  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="rounded-2xl border p-6 bg-white/60 shadow-sm">
        <h1 className="text-3xl font-semibold mb-3">Portal Escola de Música Amizade</h1>
        <p className="mb-6 text-slate-600">Faça login para aceder.</p>
        <Link href="/login" className="inline-block px-6 py-3 rounded-xl bg-blue-700 text-white">
          Entrar
        </Link>
      </div>
    </div>
  )
}
