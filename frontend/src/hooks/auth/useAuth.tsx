'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authApi } from '../../api/auth/auth-api';
import { 
  User, 
  SignInData, 
  SignUpData, 
  ForgotPasswordData, 
  ResetPasswordData,
  AuthState, 
  AuthContextType 
} from '../../types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  // Verificar autenticación al cargar
  const checkAuth = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = await authApi.getMe();
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }));
    }
  };

  const signIn = async (data: SignInData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.signIn(data);
      await checkAuth();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
        isLoading: false
      }));
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.signUp(data);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al registrarse',
        isLoading: false
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.forgotPassword(data);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al enviar email',
        isLoading: false
      }));
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.resetPassword(data);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al resetear contraseña',
        isLoading: false
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    checkAuth,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}