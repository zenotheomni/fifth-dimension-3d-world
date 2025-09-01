import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user && !import.meta.env.DEV) {
    // Redirect to auth page with return path
    return <Navigate to={`/auth?mode=signin&from=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}