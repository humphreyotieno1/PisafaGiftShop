"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        setIsAdmin(data.user.role === 'ADMIN')
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  // Check auth status on mount and when window regains focus
  useEffect(() => {
    checkAuth()
    
    const handleFocus = () => {
      checkAuth()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        setIsAdmin(data.user.role === 'ADMIN')
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
      router.push('/auth/login')
    }
  }

  const registerUser = async (email, password, name, role) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, role }),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        checkAuth,
        register: registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
