'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'
type Role = 'admin'|'teacher'|'parent'

export function useRequireRole(expected: Role){
  const [ok,setOk] = useState(false)
  const [checked,setChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async ()=>{
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { if(mounted){ setChecked(true); router.push('/login') } ; return }
      let role: string | null = null
      const r1 = await supabase.rpc('my_role'); if(!r1.error) role = r1.data as string | null
      if (!role){
        const r2 = await supabase.from('app_users').select('role').eq('id', user.id).maybeSingle()
        role = (r2.data?.role as string) ?? null
      }
      const allow = role === expected
      if (mounted){
        setOk(allow); setChecked(true)
        if (!allow) router.push('/login')
      }
    })()
    return () => { mounted = false }
  }, [expected, router])

  return checked && ok
}
