
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle();
      const role = (data as any)?.role;
      if (role) router.replace(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/parent');
    })();
  }, [router]);

  return (
    <section className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Portal Escola de Música Amizade</h1>
        <p className="text-sm text-slate-600 mt-1">Faça login para aceder.</p>
        <div className="mt-3"><a className="btn btn-primary" href="/login">Entrar</a></div>
      </div>
    </section>
  );
}
