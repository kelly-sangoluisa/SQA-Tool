'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  // Función para cerrar sesión
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

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
      {/* Header con botón de cerrar sesión */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🎉 Dashboard SQA Tool
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Hola, {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Bienvenido al Sistema SQA! 🚀
            </h2>
            <p className="text-gray-600 mb-6">
              Tu aplicación está funcionando perfectamente en producción.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Estado del Sistema:
              </h3>
              <div className="space-y-1 text-green-700">
                <p>✅ Usuario autenticado: {user?.email}</p>
                <p>✅ Backend: Railway (funcionando)</p>
                <p>✅ Frontend: Vercel (funcionando)</p>
                <p>✅ Base de datos: Supabase (conectada)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800">Módulos Disponibles:</h4>
                <ul className="text-blue-700 text-sm mt-2">
                  <li>• Configuración de Evaluación</li>
                  <li>• Entrada de Datos</li>
                  <li>• Parametrización</li>
                  <li>• Reportes</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800">Próximas Funciones:</h4>
                <ul className="text-purple-700 text-sm mt-2">
                  <li>• Dashboard de métricas</li>
                  <li>• Gestión de usuarios</li>
                  <li>• Configuraciones avanzadas</li>
                  <li>• Exportación de datos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}