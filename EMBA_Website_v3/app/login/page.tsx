// app/login/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import fetchRoleWithRetry, { clearRoleCache } from '../../lib/roleClient'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoading(false)
      alert('Credenciais inválidas.')
      return
    }

    // limpa cache e NÃO espera por role aqui
    clearRoleCache()
    router.replace('/')   // segue já para a home
    // não precisamos de setLoading(false) porque vamos navegar
  }

  // ... JSX com botão a mostrar "A entrar..." quando loading===true
}
