'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

async function getRoleWithRetry(userId: string){
  // 1) tenta RPC (ignora RLS)
  let role: 'admin'|'teacher'|'parent'|null = null
  let status = 0

  try {
    const r1 = await supabase.rpc('my_role')
    if (!r1.error && r1.data) return r1.data as any
    // se houve erro, tenta SELECT normal
  } catch {}

  try {
    const r2 = await supabase.from('app_users').select('role').eq('id', userId).maybeSingle()
    // @ts-ignore
    status = (r2 as any).status ?? 200
    role = (r2.data?.role as any) ?? null
  } catch (e:any) {
    // se for 500 (projeto acabou de “acordar”), espera e tenta 1x de novo
    status = 500
  }

  if (!role && status === 500) {
    await new Promise(r => setTimeout(r, 1500))
    const r3 = await supabase.from('app_users').select('role').eq('id', userId).maybeSingle()
    role = (r3.data?.role as any) ?? null
  }
  return role
}

export default function LoginPage(){
  const router = useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)

  async function signIn(){
    if (loading) return
    setMsg(''); setLoading(true)
    try{
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const uid = data.user?.id
      if (!uid) throw new Error('Sessão inválida.')

      const role = await getRoleWithRetry(uid)
      if (!role){
        setMsg('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent). Contacte a coordenação.')
        return
      }
      router.push(role==='admin'?'/admin':role==='teacher'?'/teacher':'/parent')
      router.refresh()
    }catch(e:any){
      setMsg(e.message || 'Falha no login.')
    }finally{ setLoading(false) }
  }

  return (
    <section className="max-w-xl mx-auto p-6 card">
      <h1 className="text-3xl font-bold mb-4">Entrar</h1>
      <div className="space-y-3">
        <input className="input w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input w-full" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary" onClick={signIn} disabled={loading}>
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </div>
      {msg && <p className="text-red-600 mt-3">{msg}</p>}
    </section>
  )
}
