"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser')
    const storedToken = localStorage.getItem('authToken')
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('authUser')
      }
    }
    
    // Check if user is logged in from API
    const checkAuth = async () => {
      try {
        // Use the stored token in the Authorization header if available
        const headers = {}
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`
        }
        
        const response = await fetch('/api/auth/me', { headers })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          localStorage.setItem('authUser', JSON.stringify(data.user))
        } else {
          // If API says user is not authenticated but we have local storage data,
          // attempt to refresh the session
          if (storedUser) {
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user: JSON.parse(storedUser) }),
            })
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              setUser(refreshData.user)
              localStorage.setItem('authUser', JSON.stringify(refreshData.user))
              
              // Store the new token
              if (refreshData.token) {
                localStorage.setItem('authToken', refreshData.token)
              }
            } else {
              // If refresh fails, clear local storage
              localStorage.removeItem('authUser')
              localStorage.removeItem('authToken')
              setUser(null)
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    
    // Set up a token refresh interval (every 30 minutes)
    const refreshInterval = setInterval(async () => {
      if (storedUser) {
        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: JSON.parse(storedUser) }),
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            setUser(refreshData.user)
            localStorage.setItem('authUser', JSON.stringify(refreshData.user))
            
            // Store the new token
            if (refreshData.token) {
              localStorage.setItem('authToken', refreshData.token)
            }
          }
        } catch (error) {
          console.error('Error refreshing token:', error)
        }
      }
    }, 30 * 60 * 1000) // 30 minutes
    
    return () => clearInterval(refreshInterval)
  }, [])

  // Store current path in localStorage for navigation persistence
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.role === 'ADMIN') {
      localStorage.setItem('previousPath', window.location.pathname);
    }
  }, [user]);

  const login = async (email, password, role) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        // Store auth state in localStorage for persistence
        localStorage.setItem('authUser', JSON.stringify(data.user))
        
        // Store the token in localStorage for client-side API requests
        if (data.token) {
          localStorage.setItem('authToken', data.token)
        }
        
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (email, password, name, role = 'CUSTOMER') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      })

      const data = await response.json()

      if (response.ok) {
        // Don't set user on registration, they need to login first
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      setUser(null)
      // Clear auth state from localStorage
      localStorage.removeItem('authUser')
      localStorage.removeItem('authToken')
      localStorage.removeItem('previousPath')
      
      router.push('/')
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to check if user is authorized to access admin routes
  const verifyAdminAccess = () => {
    if (!user) return false;
    return user.role === 'ADMIN';
  }

  // Function to navigate back without logging out
  const navigateBack = () => {
    const previousPath = localStorage.getItem('previousPath') || '/';
    router.push(previousPath);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        navigateBack,
        verifyAdminAccess,
        isAuthenticated: !!user,
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
