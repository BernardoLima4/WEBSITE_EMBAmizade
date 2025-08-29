
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRequireRole } from '../../lib/useRequireRole';

type Payout = { teacher: string; minutes: number; lessons: number; rate60: number; payout: number };

export default function AdminPage() {
  const allowed = useRequireRole('admin');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      const { data: sums } = await supabase.rpc('compute_payouts', { start_iso: start, end_iso: end });
      const rows = (sums as any) || [];
      setTotal(rows.reduce((a: any, b: any) => a + b.payout, 0));
    })();
  }, [allowed]);

  if (!allowed) return null;

  return (
    <section className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-5"><h3 className="font-semibold">Taxa de presença</h3><p className="text-sm text-slate-500">Indicativo (mês)</p><div className="mt-2 h-2 bg-slate-200 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{width:'92%'}}/></div></div>
        <div className="card p-5"><h3 className="font-semibold">Aulas não dadas</h3><p className="text-sm text-slate-500">Professores</p><div className="mt-2">5</div></div>
        <div className="card p-5"><h3 className="font-semibold">Pagamentos</h3><p className="text-sm text-slate-500">Resumo mensal</p><div className="mt-2">Em atraso: 7</div></div>
        <div className="card p-5"><h3 className="font-semibold">Professores</h3><p className="text-sm text-slate-500">Vencimento estimado</p><div className="mt-2 font-semibold">€ {total.toFixed(2)}</div><Link href="/admin/teachers" className="text-xs underline">Abrir gestão de professores</Link></div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold">Branding</h3>
        <p className="text-sm text-slate-500">Personaliza logo, nome e cores.</p>
        <Link href="/admin/branding" className="btn mt-2">Abrir Branding</Link>
      </div>
    </section>
  );
}
