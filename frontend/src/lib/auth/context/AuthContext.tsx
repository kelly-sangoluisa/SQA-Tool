'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@/lib/auth/types/auth';
import { authAPI } from '@/lib/auth/api/auth.api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const result = await authAPI.me();
      
      if (result.error) {
        setError(result.error.message);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        return;
      }

      if (result.data) {
        setUser(result.data);
        setError(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(result.data));
        }
      }
    } catch (err) {
      setError('Error al obtener información del usuario');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    if (!isClient) return;
    
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
    }

    fetchUser();
  }, [isClient]);

  const value = {
    user,
    isLoading,
    error,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}