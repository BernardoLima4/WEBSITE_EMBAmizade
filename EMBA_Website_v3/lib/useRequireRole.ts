'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

type Role = 'admin'|'teacher'|'parent'

export function useRequireRole(expected: Role){
  const [allowed, setAllowed] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChecked(true); router.push('/login'); return }
      const { data: r } = await supabase.from('app_users')
        .select('role').eq('id', user.id).maybeSingle()
      const ok = (r?.role === expected)
      if (mounted) {
        setAllowed(ok)
        setChecked(true)
        if (!ok) router.push('/login')  // sem role certo → volta ao login
      }
    })()
    return () => { mounted = false }
  }, [expected, router])

  // devolve true só quando já verificou e está OK
  return checked && allowed
}
