import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { apiClient, type ApiResponse, type UserDto } from '@/lib/api'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  user: UserDto | null
  login: (email: string, token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authTokenKey = 'auth_token'
const userEmailKey = 'user_email'
const userProfileKey = 'user_profile'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem(authTokenKey)))
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem(userEmailKey))
  const [user, setUser] = useState<UserDto | null>(() => {
    try {
      const raw = localStorage.getItem(userProfileKey)
      return raw ? (JSON.parse(raw) as UserDto) : null
    } catch {
      return null
    }
  })

  const refreshUser = async () => {
    try {
      const resp = await apiClient.get<ApiResponse<UserDto>>('/users/me')
      if (resp.data?.succeeded && resp.data.data) {
        setUser(resp.data.data)
        localStorage.setItem(userProfileKey, JSON.stringify(resp.data.data))
      } else {
        setUser(null)
        localStorage.removeItem(userProfileKey)
      }
    } catch {
      setUser(null)
      localStorage.removeItem(userProfileKey)
    }
  }

  const login = async (email: string, token: string) => {
    setIsAuthenticated(true)
    setUserEmail(email)
    localStorage.setItem(authTokenKey, token)
    localStorage.setItem(userEmailKey, email)

    // attempt to fetch user profile and persist
    await refreshUser()
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUserEmail(null)
    setUser(null)
    localStorage.removeItem(authTokenKey)
    localStorage.removeItem(userEmailKey)
    localStorage.removeItem(userProfileKey)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, user, login, logout, refreshUser }}>
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
