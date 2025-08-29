
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRequireRole } from '../../../lib/useRequireRole';

type Row = { id: string; full_name: string; email: string; instrument: string | null; rate60: number | null; minutes: number; lessons: number; payout: number };

export default function Teachers() {
  const allowed = useRequireRole('admin');
  const [rows, setRows] = useState<Row[]>([]);
  const [base, setBase] = useState<number>(10);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const { data: cfg } = await supabase.from('settings').select('value_json').eq('key','rates').single();
      setBase((cfg as any)?.value_json?.rate60 ?? 10);
      const { data } = await supabase.rpc('list_teachers_payouts');
      setRows((data as any) || []);
    })();
  }, [allowed]);

  if (!allowed) return null;

  async function saveBase() {
    await supabase.from('settings').upsert({ id: 'rates', key: 'rates', value_json: { rate60: base } });
    alert('Valor base atualizado.');
  }

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <h2 className="font-semibold">Configuração de vencimento</h2>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm">Valor base 60 min (€): <input className="input w-28" type="number" step="0.5" value={base} onChange={e=>setBase(parseFloat(e.target.value))} /></label>
          <button className="btn" onClick={saveBase}>Guardar</button>
        </div>
        <p className="text-xs text-slate-500 mt-1">45 min = 0.75× · 30 min = 0.5×</p>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold">Professores</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Nome</th><th>Email</th><th>Instrumento</th><th>60min (€)</th><th>Minutos (mês)</th><th>Lições</th><th>Total (€)</th></tr></thead>
          <tbody>
            {rows.map(r=> <tr key={r.id}><td>{r.full_name}</td><td>{r.email}</td><td>{r.instrument||'—'}</td><td>{r.rate60||base}</td><td>{r.minutes}</td><td>{r.lessons}</td><td>{r.payout.toFixed(2)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
