import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const login = (email: string) => {
    setIsAuthenticated(true)
    setUserEmail(email)
    localStorage.setItem('auth_token', 'mock-token')
    localStorage.setItem('user_email', email)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserEmail(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_email')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
