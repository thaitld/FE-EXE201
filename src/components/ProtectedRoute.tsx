import { type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute - Wraps components that require authentication.
 * Redirects to login if user is not authenticated.
 * Saves current path for redirect after login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Save current path for redirect after login
    sessionStorage.setItem('redirect_after_login', window.location.hash)
    window.location.hash = '#/login'
    return null
  }

  return <>{children}</>
}
