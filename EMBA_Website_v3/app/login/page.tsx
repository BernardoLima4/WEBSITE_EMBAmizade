
'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState<string|null>(null); const router=useRouter();
  async function submit(e:React.FormEvent){ e.preventDefault(); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if(error) return setError(error.message);
    const u = data.user; if(!u) return setError('Sem utilizador');
    const { data: r } = await supabase.from('app_users').select('role').eq('id', u.id).maybeSingle();
    const role=(r as any)?.role;
    if(!role){ setError('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent). Contacte a coordenação.'); return; }
    router.push(role==='teacher'?'/teacher': role==='admin'?'/admin':'/parent');
  }
  return (<section className="max-w-md mx-auto"><div className="card p-6 space-y-4">
    <h1 className="text-xl font-semibold">Entrar</h1>
    <form className="space-y-3" onSubmit={submit}>
      <input className="input" type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn btn-primary" type="submit">Entrar</button>
    </form>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div></section>)
}
