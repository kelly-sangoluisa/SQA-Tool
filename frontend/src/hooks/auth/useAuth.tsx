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
    if (!stored) return null;

    const user = JSON.parse(stored);
    return user;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user: User) => {
  if (typeof window === 'undefined') return;
  // IMPORTANTE: Solo guardar datos NO sensibles
  const safeUser = {
    id: user.id,
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
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Estado inicial siempre igual para evitar hydration mismatch
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  // Detectar cuando estamos en el cliente y cargar cache
  useEffect(() => {
    setIsClient(true);
    
    // Cargar cache SOLO después de montar en cliente
    const cachedUser = getUserFromStorage();
    if (cachedUser) {
      setState({
        user: cachedUser,
        isLoading: true,
        isAuthenticated: true,
        error: null
      });
    }
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

    // Verificar si ya hay un usuario cargado (cache)
    const cachedUser = getUserFromStorage();
    
    // Si hay usuario en cache, usarlo inmediatamente y verificar en background
    // No podemos verificar cookies HttpOnly desde JS, así que confiamos en el cache
    if (cachedUser) {
      // Establecer usuario de cache inmediatamente (sin loading)
      setState(prev => ({
        ...prev,
        user: cachedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));

      // Verificar en background para actualizar si cambió algo
      try {
        const user = await authApi.getMe();
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          error: null
        }));
        saveUserToStorage(user);
      } catch (error) {
        // Token expiró o es inválido
        const isAuthError = error instanceof Error && 
          (error.message.includes('401') || 
           error.message.includes('403') || 
           error.message.includes('No token provided') ||
           error.message.includes('Unauthorized'));
        
        if (isAuthError) {
          // Cookie expiró, limpiar todo
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            error: null
          }));
          clearUserFromStorage();
        }
      }
      return;
    }

    // No hay cache, intentar obtener usuario desde el servidor
    // Si hay cookie HttpOnly válida, esto funcionará
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = await authApi.getMe();
      // Cookie válida encontrada!
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
      saveUserToStorage(user);
    } catch (error) {
      const isAuthError = error instanceof Error && 
        (error.message.includes('401') || 
         error.message.includes('403') || 
         error.message.includes('No token provided') ||
         error.message.includes('Unauthorized'));
      
      // No hay sesión válida
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
  }, [isClient, hasLoggedOut]);

  const signIn = useCallback(async (data: SignInData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      setHasLoggedOut(false);
      await authApi.signIn(data);
      // Obtener el usuario inmediatamente después del login
      const user = await authApi.getMe();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      saveUserToStorage(user);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
        isLoading: false
      }));
      throw error instanceof Error ? error : new Error('Error al iniciar sesión');
    }
  }, []);

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
      throw error instanceof Error ? error : new Error('Error al registrarse');
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
      throw error instanceof Error ? error : new Error('Error al enviar email');
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
      throw error instanceof Error ? error : new Error('Error al resetear contraseña');
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (isClient) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // SOLO isClient - quitar checkAuth para evitar bucle

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