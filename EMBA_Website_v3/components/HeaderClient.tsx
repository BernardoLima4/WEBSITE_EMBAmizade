
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type Role = 'admin' | 'teacher' | 'parent' | null;

function routeForRole(role: Role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  if (role === 'parent') return '/parent';
  return '/login';
}

export default function HeaderClient() {
  const [role, setRole] = useState<Role>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  async function refreshSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAuthed(false); setRole(null); return; }
    setIsAuthed(true);
    const { data } = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle();
    setRole((data as any)?.role ?? null);
  }

  useEffect(() => {
    refreshSession();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshSession());
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setIsAuthed(false);
    setRole(null);
    router.push('/login');
  }

  return (
    <nav className="flex items-center gap-3 text-sm">
      {isAuthed ? (
        <>
          {role ? <Link className="btn" href={routeForRole(role)}>Área</Link> : <span className="text-slate-500">Perfil por atribuir</span>}
          <button className="btn" onClick={signOut}>Sair</button>
        </>
      ) : (
        <Link className="btn" href="/login">Entrar</Link>
      )}
    </nav>
  );
}
