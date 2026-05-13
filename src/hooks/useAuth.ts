import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { decrypt } from '@/lib/encryption'
import type { User, Session } from '@supabase/supabase-js'

async function syncApiKey(userId: string) {
  if (localStorage.getItem('gemini_api_key')) return
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'gemini_api_key')
    .single()
  if (data?.value) {
    try {
      const key = await decrypt(data.value, userId)
      localStorage.setItem('gemini_api_key', key)
    } catch { /* decryption failure — user must re-enter in Settings */ }
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) syncApiKey(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) syncApiKey(session.user.id)
        setLoading(false)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem('gemini_api_key')
    localStorage.removeItem('gemini_model')
    await supabase.auth.signOut()
  }, [])

  return { user, session, loading, signUp, signIn, signOut }
}