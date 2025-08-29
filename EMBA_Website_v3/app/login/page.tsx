'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'  // evita qualquer cache chata

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setMsg('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // procurar o role e redirecionar
      const uid = data.user?.id
      if (!uid) throw new Error('Sessão inválida.')
      const { data: r } = await supabase.from('app_users')
        .select('role').eq('id', uid).maybeSingle()
      const role = r?.role as 'admin'|'teacher'|'parent'|undefined
      if (!role) { setMsg('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent). Contacte a coordenação.'); return }
      const to = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/parent'
      router.push(to)
      router.refresh()
    } catch (err:any) {
      setMsg(err.message || 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto p-6 card">
      <h1 className="text-3xl font-bold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input w-full" placeholder="email" value={email}
               onChange={e=>setEmail(e.target.value)} />
        <input className="input w-full" type="password" placeholder="password" value={password}
               onChange={e=>setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      {msg && <p className="text-red-600 mt-3">{msg}</p>}
    </section>
  )
}
