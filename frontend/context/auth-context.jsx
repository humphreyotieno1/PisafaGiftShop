"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize user from localStorage on mount
  useEffect(() => {
    console.log('[AuthContext] Initializing auth state...');
    const storedUser = localStorage.getItem('authUser')
    const storedToken = localStorage.getItem('authToken')
    
    console.log('[AuthContext] Found stored auth data:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken 
    });
    
    // Check if user is logged in from API
    const checkAuth = async () => {
      try {
        const headers = {}
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`
        }
        
        console.log('[AuthContext] Checking authentication status...');
        const response = await fetch('/api/auth/me', { 
          headers,
          credentials: 'include' // Include cookies in the request
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('[AuthContext] User is authenticated:', { 
            userId: data.user.id,
            email: data.user.email 
          });
          setUser(data.user)
          localStorage.setItem('authUser', JSON.stringify(data.user))
          setToken(data.token)
          setIsAuthenticated(true)
        } else if (response.status === 401) {
          console.log('[AuthContext] User is not authenticated (401)');
          clearAuthState()
        } else {
          console.error('[AuthContext] Unexpected response status:', response.status);
          clearAuthState()
        }
      } catch (error) {
        console.error('[AuthContext] Error checking authentication:', error)
        clearAuthState()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Clear auth state
  const clearAuthState = useCallback(() => {
    console.log('[AuthContext] Clearing auth state...');
    setUser(null)
    localStorage.removeItem('authUser')
    localStorage.removeItem('authToken')
    localStorage.removeItem('previousPath')
    setToken(null)
    setIsAuthenticated(false)
  }, [])

  // Store current path in localStorage for navigation persistence
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.role === 'ADMIN') {
      localStorage.setItem('previousPath', window.location.pathname)
    }
  }, [user])

  const login = async (email, password) => {
    try {
      console.log("[AuthContext] Attempting login:", { email })
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const data = await response.json()
      
      // Update auth state
      setUser(data.user)
      setToken(data.token)
      setIsAuthenticated(true)
      localStorage.setItem("authUser", JSON.stringify(data.user))
      localStorage.setItem("authToken", data.token)
      
      console.log("[AuthContext] Login successful:", data.user)
      
      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
      
      return data
    } catch (error) {
      console.error("[AuthContext] Login failed:", error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, name, role = "CUSTOMER") => {
    try {
      console.log("[AuthContext] Attempting registration:", { email, role })
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Registration failed")
      }

      const data = await response.json()
      console.log("[AuthContext] Registration successful:", data.user)
      return { success: true, user: data.user }
    } catch (error) {
      console.error("[AuthContext] Registration failed:", error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    console.log('[AuthContext] Attempting logout...');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      clearAuthState()
      router.push('/')
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error('[AuthContext] Logout error:', error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to check if user is authorized to access admin routes
  const verifyAdminAccess = useCallback(() => {
    if (!user) return false
    return user.role === 'ADMIN'
  }, [user])

  // Function to navigate back without logging out
  const navigateBack = useCallback(() => {
    const previousPath = localStorage.getItem('previousPath') || '/'
    router.push(previousPath)
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        navigateBack,
        verifyAdminAccess,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
