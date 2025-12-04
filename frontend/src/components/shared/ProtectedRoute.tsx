'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'evaluator' | 'any';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'any',
  redirectTo 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    // Verificar autenticación
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Si no hay usuario o rol, redirigir
    if (!user || !user.role) {
      router.push('/auth/login');
      return;
    }

    // Verificar rol específico
    if (requiredRole !== 'any' && user.role.name !== requiredRole) {
      const defaultRedirect = user.role.name === 'admin' 
        ? '/admin/parameterization' 
        : '/dashboard';
      
      router.push(redirectTo || defaultRedirect);
      return;
    }
  }, [mounted, isLoading, isAuthenticated, user, requiredRole, redirectTo, router]);

  // Mostrar loading mientras se verifica
  if (!mounted || isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Verificar rol después de cargar
  if (requiredRole !== 'any' && user.role?.name !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}