// EMBA_Website_v3/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import fetchRoleWithRetry, { AppRole, clearRoleCache } from '../../lib/roleClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    console.log('[login] submit', { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[login] supabase error:', error);
        alert(error.message);
        return;
      }
      console.log('[login] ok, user:', data.user?.id);

      // limpar cache de role (por via das dúvidas)
      clearRoleCache();

      const role = await fetchRoleWithRetry();
      console.log('[login] role:', role);

      const goto = (r: AppRole | null) =>
        r === 'admin' ? '/admin' :
        r === 'teacher' ? '/teacher' :
        r === 'parent' ? '/parent' : '/';

      router.replace(goto(role));
    } catch (e: any) {
      console.error('[login] unexpected:', e);
      alert(e?.message ?? 'Erro inesperado a entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-4xl font-semibold mb-6">Entrar</h1>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"               // <- importante: evita submit do <form>
          onClick={handleSignIn}      // <- garante que o clique dispara JS
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
