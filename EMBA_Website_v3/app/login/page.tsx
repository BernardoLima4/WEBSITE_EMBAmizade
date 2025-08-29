'use client' // tem de ser a PRIMEIRA linha, sem nada antes

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient' // caminho relativo evita problemas de alias

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn() {
    try {
      setMsg('')
      setLoading(true)
      console.log('[LOGIN] submitting', email)

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      console.log('[LOGIN] user', data.user?.id)

      // tenta RPC my_role; se não existir, tenta select (com RLS)
      let role: 'admin'|'teacher'|'parent'|null = null
      try {
        const r1 = await supabase.rpc('my_role')
        if (!r1.error && r1.data) role = r1.data as any
      } catch {}
      if (!role) {
        const r2 = await supabase.from('app_users').select('role').eq('id', data.user!.id).maybeSingle()
        role = (r2.data?.role as any) ?? null
      }

      if (!role) { setMsg('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent). Contacte a coordenação.'); return }

      const to = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/parent'
      router.push(to)
      router.refresh()
    } catch (e:any) {
      console.error(e)
      setMsg(e.message ?? 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto p-6 card">
      <h1 className="text-3xl font-bold mb-4">Entrar</h1>

      {/* Em vez de onSubmit no form, usamos onClick — elimina problemas de hidratação */}
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
