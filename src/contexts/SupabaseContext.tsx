import React, { createContext, useContext, ReactNode } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Supabase configuration - replace with environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phhbhiiyyvpvfbujlyrv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaGJoaWl5eXZwdmZidWpseXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNjE4NDksImV4cCI6MjA3MTgzNzg0OX0.RXqXWPatfU7HuuBmogqzKsyCF4wqhDOgCXjSsSpzkcg'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

// Re-export database types for convenience
export type {
  Database,
  Tables,
  Profile,
  Product,
  Order,
  OrderItem,
  ArcadeScore,
  CommunityMessage,
  LiveStream,
  UserAchievement,
  UserFavorite
} from '../types/database.types'