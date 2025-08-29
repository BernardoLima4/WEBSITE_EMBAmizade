'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
type Role = 'admin'|'teacher'|'parent'|null

export default function HeaderClient(){
  const [email,setEmail] = useState<string|null>(null)
  const [role,setRole] = useState<Role>(null)
  const [loading,setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  async function load(){
    const { data:{ user } } = await supabase.auth.getUser()
    setEmail(user?.email ?? null)
    if (user){
      let r: Role = null
      const rpc = await supabase.rpc('my_role'); if (!rpc.error) r = (rpc.data as any) ?? null
      if (!r) {
        const q = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle()
        r = (q.data?.role as any) ?? null
      }
      setRole(r)
    } else {
      setRole(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => sub?.subscription.unsubscribe()
  }, [])

  async function signOut(){
    await supabase.auth.signOut().catch(()=>{})
    router.push('/login'); router.refresh()
    setTimeout(()=>window.location.assign('/login'), 50)
  }

  const area = role==='admin'?'/admin':role==='teacher'?'/teacher':role==='parent'?'/parent':'/login'

  return (
    <div className="flex items-center gap-4">
      {!loading && email ? (
        <>
          <span className="text-sm text-slate-500">{role ? email : 'Perfil por atribuir'}</span>
          {role && pathname!==area && <a className="btn" href={area}>Ir para a minha área</a>}
          <button className="btn" onClick={signOut}>Sair</button>
        </>
      ) : <a className="btn" href="/login">Entrar</a>}
    </div>
  )
}
