import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import type { User, LoginFormData, RegisterFormData } from '@/types/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const checkAuth = useCallback(async (): Promise<User | null> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const userData = await authApi.getCurrentUser();
      setState({ user: userData, loading: false, error: null });
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setState({ user: null, loading: false, error: errorMessage });
      // Clear tokens if authentication fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      return null;
    }
  }, []);

  const login = async (username: string, password: string, rememberMe = false): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await authApi.login(username, password, rememberMe);
      const userData = await checkAuth();
      return { success: true, user: userData || undefined };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      // Try to call logout API, but don't fail if it doesn't work
      try {
        await authApi.logout();
      } catch (err) {
        // Ignore API errors during logout
        console.warn('Logout API call failed:', err);
      }
      
      // Always clear local state and tokens
      setState({ user: null, loading: false, error: null });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Force a page reload to clear all state
        window.location.href = '/';
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterFormData): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await authApi.register(userData);
      const result = await login(userData.username, userData.password);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await authApi.resetPassword(token, newPassword);
      setState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    register,
    resetPassword,
    isAuthenticated: !!state.user,
    checkAuth,
    clearError,
  };
}
