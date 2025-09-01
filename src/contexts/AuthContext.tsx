import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { useSupabase } from './SupabaseContext'
import { Profile } from './SupabaseContext'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, phone?: string, optInPromotions?: boolean) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // DEVELOPMENT MODE: Auto-login for testing
    const isDevMode = import.meta.env.DEV
    
    if (isDevMode) {
      // Create a mock user for development
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@fifthdimension.com',
        user_metadata: {
          name: 'Developer Tester'
        }
      } as any
      
      const mockSession = {
        user: mockUser,
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_at: Date.now() + 3600000
      } as any
      
      setSession(mockSession)
      setUser(mockUser)
      setLoading(false)
      
      // Create a mock profile
      const mockProfile = {
        id: 'dev-user-123',
        email: 'dev@fifthdimension.com',
        username: 'CosmicDev',
        cosmic_level: 5,
        experience_points: 100,
        opted_in_promotions: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProfile(mockProfile)
      
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email: string, password: string, phone?: string, optInPromotions = false) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          opted_in_promotions: optInPromotions,
        }
      }
    })

    if (!error && data.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          phone,
          opted_in_promotions: optInPromotions,
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/world`
      }
    })
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`
    })
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      // Refresh profile data
      await fetchProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithMagicLink,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}