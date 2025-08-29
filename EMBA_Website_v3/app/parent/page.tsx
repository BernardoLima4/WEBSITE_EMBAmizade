
'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRequireRole } from '../../lib/useRequireRole';

type Student = { id: string; full_name: string };
type Payment = { id: string; month_ref: string; amount: number; status: string };
type LessonRow = { lesson_id: string; status: 'present'|'absent'|'justified'; lesson?: { date_start: string; summaries?: { emoji: 'great'|'good'|'ok'; content: string }[] } };

export default function ParentPage() {
  const allowed = useRequireRole('parent');

  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0,7));
  const [amount, setAmount] = useState<number>(45);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  const [lessons, setLessons] = useState<LessonRow[]>([]);

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // encontra guardian
      const { data: g } = await supabase.from('guardians').select('id').eq('user_id', user.id).maybeSingle();
      if (!g) { setStudents([]); setStudentId(null); return; }

      // alunos do guardian
      const { data: st } = await supabase.from('students').select('id, full_name').eq('guardian_id', (g as any).id).order('full_name');
      const arr = (st as any[]) ?? [];
      setStudents(arr);
      setStudentId(arr[0]?.id ?? null);
    })();
  }, [allowed]);

  useEffect(() => {
    if (!allowed || !studentId) return;
    (async () => {
      // pagamentos por aluno
      const { data: pays } = await supabase.from('payments').select('id, month_ref, amount, status').eq('student_id', studentId).order('month_ref', { ascending: false });
      setPayments((pays as any) ?? []);

      // últimas 20 lições com presença + sumário/emoji
      const { data: att } = await supabase
        .from('attendance')
        .select('lesson_id, status, lesson:lessons(date_start, summaries(emoji, content))')
        .eq('student_id', studentId)
        .order('lesson.date_start', { ascending: false })
        .limit(20);
      setLessons((att as any) ?? []);
    })();
  }, [allowed, studentId]);

  const latePayments = useMemo(() => {
    // marca como 'late' localmente se for depois do dia 8 e status pendente
    const today = new Date();
    const day = today.getDate();
    return new Set(payments.filter(p => p.status !== 'paid' && day > 8).map(p => p.id));
  }, [payments]);

  if (!allowed) return null;

  async function uploadProof() {
    setMsg('');
    if (!studentId) { setMsg('Selecione um aluno.'); return; }
    if (!file) { setMsg('Selecione um ficheiro PDF/JPG.'); return; }
    const { data: pay, error: e1 } = await supabase.from('payments').insert({ student_id: studentId, month_ref: month, amount, status: 'pending' }).select().single();
    if (e1) { setMsg('Erro ao registar pagamento: ' + e1.message); return; }
    const path = `${studentId}/${(pay as any).id}-${file.name}`;
    const up = await supabase.storage.from('payments').upload(path, file);
    if (up.error) { setMsg('Erro no upload: ' + up.error.message); return; }
    const { error: e2 } = await supabase.from('payment_proofs').insert({ payment_id: (pay as any).id, file_path: path });
    if (e2) { setMsg('Erro ao gravar comprovativo: ' + e2.message); return; }
    setMsg('Comprovativo enviado.');
    const { data } = await supabase.from('payments').select('id, month_ref, amount, status').eq('student_id', studentId).order('month_ref', { ascending: false });
    setPayments((data as any) || []);
  }

  return (
    <section className="space-y-6">
      <div className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold">Área do Encarregado de Educação</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm">Aluno
            <select className="input" value={studentId ?? ''} onChange={e=>setStudentId(e.target.value || null)}>
              <option value="" disabled>Selecione</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </label>
          <label className="text-sm">Mês de referência
            <input className="input" value={month} onChange={e=>setMonth(e.target.value)} placeholder="YYYY-MM" />
          </label>
          <label className="text-sm">Montante (€)
            <input className="input" type="number" value={amount} onChange={e=>setAmount(parseFloat(e.target.value))} />
          </label>
        </div>
        <label className="text-sm block">Comprovativo (PDF/JPG)
          <input className="input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files?.[0]||null)} />
        </label>
        <div className="mt-1"><button className="btn btn-primary" onClick={uploadProof}>Enviar comprovativo</button></div>
        <p className="text-sm mt-1">{msg}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold">Pagamentos</h3>
          <ul className="text-sm mt-2 space-y-1">
            {payments.map(p => {
              const late = latePayments.has(p.id);
              const status = late ? 'late' : p.status;
              const badge = status==='paid'?'badge-green':status==='pending'?'badge-amber':'badge-red';
              return (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.month_ref} · €{Number(p.amount).toFixed(2)}</span>
                  <span className={`badge ${badge}`}>{status}</span>
                </li>
              );
            })}
            {payments.length === 0 && <li className="text-slate-500">Sem registos.</li>}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">Sumários & Presenças (recentes)</h3>
          <ul className="text-sm mt-2 space-y-2">
            {lessons.map((r, i) => {
              const when = r.lesson?.date_start ? new Date(r.lesson.date_start) : null;
              const emoji = r.lesson?.summaries?.[0]?.emoji;
              const content = r.lesson?.summaries?.[0]?.content || '';
              const em = emoji==='great'?'😀':emoji==='good'?'🙂':emoji==='ok'?'😐':'—';
              return (
                <li key={r.lesson_id+String(i)} className="border rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span>{when ? when.toLocaleString() : '—'}</span>
                    <span className="flex items-center gap-2">
                      <span className="badge">{r.status}</span>
                      <span className="text-lg">{em}</span>
                    </span>
                  </div>
                  {content && <p className="mt-1 text-slate-700">{content}</p>}
                </li>
              );
            })}
            {lessons.length === 0 && <li className="text-slate-500">Sem sumários ainda.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
