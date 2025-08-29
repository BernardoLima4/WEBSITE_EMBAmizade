'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (loading) return
    setMsg(''); setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // tenta RPC (ignora RLS), fallback para select
      let role: 'admin' | 'teacher' | 'parent' | null = null
      const r1 = await supabase.rpc('my_role')
      if (!r1.error) role = (r1.data as any) ?? null
      if (!role) {
        const { data: r2 } = await supabase.from('app_users').select('role').eq('id', data.user!.id).maybeSingle()
        role = (r2?.role as any) ?? null
      }
      if (!role) { setMsg('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent). Contacte a coordenação.'); return }
      router.push(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/parent')
      router.refresh()
    } catch (e: any) {
      setMsg(e.message || 'Falha no login.')
    } finally { setLoading(false) }
  }

  return (
    <section className="max-w-xl mx-auto p-6 card">
      <h1 className="text-3xl font-bold mb-4">Entrar</h1>
      <div className="space-y-3">
        <input className="input w-full" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input w-full" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
        {msg && <p className="text-red-600">{msg}</p>}
      </div>
    </section>
  )
}
