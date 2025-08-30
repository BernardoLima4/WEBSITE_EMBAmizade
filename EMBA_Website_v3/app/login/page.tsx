'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { fetchRoleWithRetry, AppRole } from '../../lib/roleClient'

export default function LoginPage(){
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email')||'')
    const password = String(form.get('password')||'')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { alert(error.message); return }

    const role = await fetchRoleWithRetry()
    router.push(role==='admin' ? '/admin' : role==='teacher' ? '/teacher' : '/parent')
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <input name="email" type="email" className="input" placeholder="email" required />
      <input name="password" type="password" className="input" placeholder="password" required />
      <button className="btn btn-primary w-full">Entrar</button>
    </form>
  )
}
