'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { authApi } from '../../api/auth/auth-api';
import { SignInData, SignUpData, ForgotPasswordData, ResetPasswordData, AuthState, AuthContextType, User } from '../../types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// Helpers para localStorage SEGURO
const getUserFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user_profile'); // Solo perfil, NO token
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user: User) => {
  if (typeof window === 'undefined') return;
  // IMPORTANTE: Solo guardar datos NO sensibles
  const safeUser = {
    id: user.user_id,
    email: user.email,
    name: user.name,
    role: user.role,
    // NO guardar: token, password, ni datos sensibles
  };
  localStorage.setItem('user_profile', JSON.stringify(safeUser));
};

const clearUserFromStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user_profile');
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => {
    // Inicialización optimista SEGURA
    const storedUser = getUserFromStorage();
    return {
      user: storedUser, // Solo datos no sensibles del localStorage
      isLoading: !storedUser, // Si hay usuario en cache, no loading
      isAuthenticated: !!storedUser, // Asumir autenticado si hay cache
      error: null
    };
  });

  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkAuth = useCallback(async () => {
    if (!isClient || hasLoggedOut) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }));
      return;
    }

    // Si hay usuario en cache, verificar en background sin loading
    if (state.user) {
      try {
        const user = await authApi.getMe();
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          error: null
        }));
        saveUserToStorage(user); // Actualizar cache seguro
      } catch {
        // Token expiró o es inválido
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          error: null
        }));
        clearUserFromStorage();
      }
      return;
    }

    // Solo mostrar loading si NO hay cache
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
      saveUserToStorage(user); // Guardar de forma segura
    } catch (error) {
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

      clearUserFromStorage();

      if (!isAuthError) {
        console.error('Error inesperado en checkAuth:', error);
      }
    }
  }, [isClient, hasLoggedOut]); // ELIMINADO state.user para evitar bucle

  const signIn = useCallback(async (data: SignInData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      setHasLoggedOut(false);
      await authApi.signIn(data);
      await new Promise(resolve => setTimeout(resolve, 200));
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

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      setHasLoggedOut(true);
      await authApi.signOut();
    } catch (error) {
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
      clearUserFromStorage(); // Limpiar cache
    }
  }, []);

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
    if (isClient) {
      checkAuth();
    }
  }, [isClient, checkAuth]);

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