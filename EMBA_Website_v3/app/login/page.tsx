'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { fetchRoleWithRetry, AppRole } from '../../lib/roleClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@amizade.pt');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      console.log('[login] start', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('[login] session ok', data?.session?.user?.id);

      const role = await fetchRoleWithRetry();
      console.log('[login] role =', role);

      if (role === 'admin') router.replace('/admin');
      else if (role === 'teacher') router.replace('/teacher');
      else if (role === 'parent') router.replace('/parent');
      else setErrorMsg('Este utilizador ainda não tem perfil atribuído (admin/teacher/parent).');

    } catch (err: any) {
      console.error('[login] failed', err);
      setErrorMsg(err?.message ?? 'Falha no login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-4xl font-bold mb-6">Entrar</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-md border p-3"
          placeholder="email"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-md border p-3"
          placeholder="password"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-700 px-5 py-3 text-white disabled:opacity-60"
        >
          {loading ? 'A entrar…' : 'Entrar'}
        </button>

        {errorMsg && (
          <p className="text-red-600">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}
