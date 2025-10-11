'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
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

  // Flag para evitar checkAuth después del logout
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Verificar autenticación al cargar - MEMOIZADA para evitar recreación
  const checkAuth = useCallback(async () => {
  // No hacer checkAuth si el usuario se ha deslogueado
  if (hasLoggedOut) {
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    }));
    return;
  }

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
      // Silenciar completamente los errores 401/403 (no autorizado) al inicio
      const isAuthError = error instanceof Error && 
        (error.message.includes('401') || 
         error.message.includes('403') || 
         error.message.includes('No token provided') ||
         error.message.includes('Unauthorized'));
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: isAuthError ? null : 'Error de conexión'
      }));

      // No hacer console.error para errores de autenticación esperados
      if (!isAuthError) {
        console.error('Error inesperado en checkAuth:', error);
      }
    }
  }, [hasLoggedOut]);

  const signIn = useCallback(async (data: SignInData) => {
  setState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    // Resetear el flag de logout al hacer login
    setHasLoggedOut(false);
    
    // Hacer login primero
    await authApi.signIn(data);
    
    // CRÍTICO: Esperar a que el token se guarde en localStorage
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Ahora sí hacer checkAuth
    await checkAuth();
    
  } catch (error) {
    setState(prev => ({
      ...prev,
      error: error instanceof Error ? error.message : 'Error al iniciar sesión',
      isLoading: false
    }));
    throw error;
  }
}, [checkAuth]);

  const signUp = useCallback(async (data: SignUpData) => {
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
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Marcar que el usuario se está deslogueando
      setHasLoggedOut(true);
      
      await authApi.signOut();
    } catch (error) {
      // Solo mostrar error si no es un error de autenticación
      const isAuthError = error instanceof Error && 
        (error.message.includes('401') || 
         error.message.includes('No token'));
      
      if (!isAuthError) {
        console.error('Error al cerrar sesión:', error);
      }
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
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
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
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
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Ahora es seguro porque checkAuth está memoizada

  const contextValue: AuthContextType = useMemo(() => ({
    ...state,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    checkAuth,
    clearError
  }), [state, signIn, signUp, signOut, forgotPassword, resetPassword, checkAuth, clearError]);

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