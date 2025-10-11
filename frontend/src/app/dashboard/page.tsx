'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardHome } from '../../components/dashboard/DashboardHome';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Manejar redirección de forma suave
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Si está cargando, mostrar fondo blanco elegante
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-sm">Verificando acceso...</div>
      </div>
    );
  }

  // Si no está autenticado, mostrar fondo blanco mientras redirige
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-sm">Redirigiendo al login...</div>
      </div>
    );
  }

  // Solo mostrar dashboard si está definitivamente autenticado
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}