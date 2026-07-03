import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { AuthContext } from './AuthContext.ts'
import { supabase } from '../../lib/supabaseClient.ts'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error loading Supabase session', error)
      }

      if (!isMounted) {
        return
      }

      const nextSession = data.session
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
    }),
    [loading, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
