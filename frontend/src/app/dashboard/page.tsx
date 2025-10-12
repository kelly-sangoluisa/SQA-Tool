'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Solo redirigir cuando estemos seguros
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Mostrar loading hasta estar montado
  if (!mounted || isLoading) {
    return <div className="min-h-screen bg-white" />; // Pantalla simple
  }

  // Si no autenticado, no mostrar nada (está redirigiendo)
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-white" />;
  }

  // DASHBOARD REAL - Simple y directo
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">🎉 Dashboard</h1>
        <p className="text-gray-600 mb-4">¡Funciona en Vercel!</p>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Bienvenido</h2>
          <p>Usuario: {user?.email}</p>
          <p>Estado: ✅ Conectado</p>
        </div>
      </div>
    </div>
  );
}