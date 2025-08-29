
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
export default function Branding(){
  const [name,setName]=useState('Amizade'); const [subtitle,setSubtitle]=useState('Escola de Música'); const [primary,setPrimary]=useState('#1E40AF'); const [bg,setBg]=useState('#F8FAFC'); const [logo,setLogo]=useState<File|null>(null); const [saved,setSaved]=useState('')
  useEffect(()=>{(async()=>{ const { data }=await supabase.from('settings').select('value_json').eq('key','branding').single(); const v=(data as any)?.value_json; if(v){ setName(v.brandName||'Amizade'); setSubtitle(v.brandSubtitle||'Escola de Música'); setPrimary(v.primary||'#1E40AF'); setBg(v.background||'#F8FAFC'); } })()},[])
  async function save(){ setSaved(''); let logoUrl:string|undefined; if(logo){ const path=`branding/logo-${Date.now()}-${logo.name}`; await supabase.storage.from('branding').upload(path, logo); const { data:url }=await supabase.storage.from('branding').getPublicUrl(path); logoUrl=(url as any).publicUrl }
    await supabase.from('settings').upsert({ id:'branding', key:'branding', value_json:{ brandName:name, brandSubtitle:subtitle, primary, background:bg, logoUrl } }); setSaved('Branding guardado.') }
  return (<section className="space-y-4">
    <div className="card p-5"><h2 className="font-semibold">Branding</h2>
      <div className="grid sm:grid-cols-2 gap-3 mt-2">
        <label className="text-sm">Nome <input className="input" value={name} onChange={e=>setName(e.target.value)} /></label>
        <label className="text-sm">Subtítulo <input className="input" value={subtitle} onChange={e=>setSubtitle(e.target.value)} /></label>
        <label className="text-sm">Cor primária <input className="input" value={primary} onChange={e=>setPrimary(e.target.value)} /></label>
        <label className="text-sm">Cor de fundo <input className="input" value={bg} onChange={e=>setBg(e.target.value)} /></label>
        <label className="text-sm">Logo <input className="input" type="file" accept=".png,.jpg,.jpeg,.svg" onChange={e=>setLogo(e.target.files?.[0]||null)} /></label>
      </div>
      <div className="mt-3 flex gap-2"><button className="btn btn-primary" onClick={save}>Guardar</button><span className="text-sm">{saved}</span></div>
    </div>
  </section>)
}
