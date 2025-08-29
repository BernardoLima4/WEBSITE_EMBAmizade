
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRequireRole } from '../../lib/useRequireRole';

type Student = { id: string; full_name: string };
type Status = 'present'|'absent'|'justified';
const cycle: Record<Status,Status> = { present:'absent', absent:'justified', justified:'present' };

export default function TeacherPage() {
  const allowed = useRequireRole('teacher');
  const [students, setStudents] = useState<Student[]>([]);
  const [att, setAtt] = useState<Record<string, Status>>({});
  const [summary, setSummary] = useState('');
  const [duration, setDuration] = useState(45);
  const [emoji, setEmoji] = useState<'😀'|'🙂'|'😐'>('🙂');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const { data } = await supabase.from('students').select('id, full_name').limit(10);
      setStudents((data as any) || []);
      const st: any = {};
      (data || []).forEach((s: any) => st[s.id] = 'present');
      setAtt(st);
    })();
  }, [allowed]);

  if (!allowed) return null;

  async function saveAll() {
    setMsg('');
    const start = new Date().toISOString();
    const end = new Date(Date.now() + duration*60000).toISOString();
    const { data: lesson } = await supabase.from('lessons').insert({ class_id: null, date_start: start, date_end: end, status:'done' }).select().single();
    const rows = Object.entries(att).map(([student_id, status]) => ({ lesson_id: (lesson as any).id, student_id, status }));
    await supabase.from('attendance').insert(rows);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('summaries').insert({ lesson_id: (lesson as any).id, teacher_id: user?.id, content: summary, emoji: emoji==='😀'?'great':emoji==='🙂'?'good':'ok' });
    setMsg('Presenças e sumário guardados.');
  }

  function toggle(id: string){ setAtt(p => ({...p, [id]: cycle[p[id]]})) }

  return (
    <section className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold">Presenças</h2>
          <ul className="mt-2 space-y-2">
            {students.map(s => (
              <li key={s.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                <span>{s.full_name}</span>
                <button className="btn" onClick={()=>toggle(s.id)}>{att[s.id]}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold">Sumário & Avaliação</h2>
          <label className="text-sm">Duração
            <select className="input" value={duration} onChange={e=>setDuration(parseInt(e.target.value))}>
              <option value={60}>60 min</option>
              <option value={45}>45 min</option>
              <option value={30}>30 min</option>
            </select>
          </label>
          <textarea className="input mt-2" rows={5} placeholder="Conteúdos..." value={summary} onChange={e=>setSummary(e.target.value)} />
          <div className="mt-2 flex gap-2">
            {(['😀','🙂','😐'] as const).map(x=> <button key={x} className={`btn ${emoji===x?'btn-primary':''}`} onClick={()=>setEmoji(x)}>{x}</button>)}
          </div>
          <div className="mt-2 flex justify-end">
            <button className="btn btn-primary" onClick={saveAll}>Guardar</button>
          </div>
          <p className="text-sm mt-2">{msg}</p>
        </div>
      </div>
    </section>
  );
}
