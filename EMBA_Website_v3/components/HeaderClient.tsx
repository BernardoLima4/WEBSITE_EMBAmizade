'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Role = 'admin'|'teacher'|'parent'|null

export default function HeaderClient() {
  const [email, setEmail]   = useState<string|null>(null)
  const [role, setRole]     = useState<Role>(null)
  const [loading, setLoading]=useState(true)
  const router = useRouter()
  const pathname = usePathname()

  async function getRole(uid: string) {
    // 1ª tentativa: RPC my_role (ignora RLS mas é seguro para o próprio utilizador)
    const { data: r1, error: e1 } = await supabase.rpc('my_role')
    if (!e1 && r1) return r1 as Role
    // fallback: select com RLS
    const { data: r2 } = await supabase.from('app_users')
      .select('role').eq('id', uid).maybeSingle()
    return (r2?.role as Role) ?? null
  }

  async function load() {
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
      if (!user) { setRole(null); return }
      setRole(await getRole(user.id))
    } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => sub?.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut().catch(()=>{})
    router.push('/login'); router.refresh()
    setTimeout(()=>window.location.assign('/login'), 50)
  }

  const area =
    role==='admin'?'/admin':role==='teacher'?'/teacher':role==='parent'?'/parent':'/login'

  return (
    <div className="flex items-center gap-4">
      {!loading && email ? (
        <>
          <span className="text-sm text-slate-500">{role? email : 'Perfil por atribuir'}</span>
          {role && pathname!==area && <a className="btn" href={area}>Ir para a minha área</a>}
          <button className="btn" onClick={signOut}>Sair</button>
        </>
      ) : (
        <a className="btn" href="/login">Entrar</a>
      )}
    </div>
  )
}
