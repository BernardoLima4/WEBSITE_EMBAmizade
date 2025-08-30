'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { fetchRoleWithRetry, clearRoleCache, AppRole } from '@/lib/roleClient'

export default function HeaderClient() {
  const [email, setEmail] = useState<string|null>(null)
  const [role, setRole] = useState<AppRole|null>(null)
  const router = useRouter()
  const pathname = usePathname()

  async function load(){
    const { data:{ user } } = await supabase.auth.getUser()
    setEmail(user?.email ?? null)
    setRole(await fetchRoleWithRetry())
  }

  useEffect(() => {
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => sub?.subscription.unsubscribe()
  }, [])

  async function signOut(){
    clearRoleCache()
    await supabase.auth.signOut().catch(()=>{})
    router.push('/login'); router.refresh()
    setTimeout(()=>window.location.assign('/login'), 60)
  }

  const area = role==='admin'?'/admin':role==='teacher'?'/teacher':role==='parent'?'/parent':'/login'

  return (
    <div className="flex items-center gap-3">
      {/* Ícone da casa */}
      <a href={area} title="Início" aria-label="Início"
         className="inline-flex items-center justify-center w-10 h-10 rounded-xl border hover:bg-slate-100">
        {/* SVG simples de Home (sem dependências) */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>
        </svg>
      </a>

      {email ? (
        <>
          <span className="text-sm text-slate-500">{role ? email : 'Perfil por atribuir'}</span>
          {role && pathname !== area && <a className="btn" href={area}>A minha área</a>}
          <button className="btn" onClick={signOut}>Sair</button>
        </>
      ) : (
        <a className="btn" href="/login">Entrar</a>
      )}
    </div>
  )
}
