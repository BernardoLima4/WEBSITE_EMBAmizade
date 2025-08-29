
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';

type Role = 'admin' | 'teacher' | 'parent';

export function useRequireRole(required: Role) {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      const { data } = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle();
      const role = (data as any)?.role;
      if (!role || role !== required) { router.replace('/login'); return; }
      setOk(true);
    })();
  }, [required, router]);

  return ok;
}
