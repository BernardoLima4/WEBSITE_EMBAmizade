'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { fetchRoleWithRetry, AppRole } from '../../lib/roleClient'

export default function LoginPage(){
  const router = useRouter()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [msg,setMsg] = useState('')
  const [loading,setLoading] = useState(false)

  async function signIn(){
    if (loading) return
    setMsg(''); setLoading(true)
    try{
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('Sessão inválida.')

      const role = await fetchRoleWithRetry() as AppRole|null
      if (!role) { setMsg('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent). Contacte a coordenação.'); return }

      const to = role==='admin'?'/admin':role==='teacher'?'/teacher':'/parent'
      router.push(to); router.refresh()
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
