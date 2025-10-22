'use client';
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../styles/dashboard/dashboard.css';

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
    <div className="dashboard-root">
      {/* Header con botón de cerrar sesión */}
      <nav className="dashboard-header">
        <div className="container">
          <div className="header-inner">
            <div className="brand">
              <h1>🎉 Dashboard SQA Tool</h1>
            </div>
            <div className="dashboard-user">
              <span className="dashboard-user-greeting">Hola, {user?.email}</span>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="signout-btn"
              >
                {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="dashboard-main">
        <div className="page-wrapper">
          <div className="dashboard-card">
            {/* Features */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-emoji">⚙️</div>
                <h3 className="feature-title">Configuración</h3>
                <p className="feature-desc">Define criterios y parámetros de evaluación personalizados</p>
              </div>

              <div className="feature-card">
                <div className="feature-emoji">📝</div>
                <h3 className="feature-title">Entrada de Datos</h3>
                <p className="feature-desc">Registra información detallada de tus proyectos de software</p>
              </div>

              <div className="feature-card">
                <div className="feature-emoji">🎛️</div>
                <h3 className="feature-title">Parametrización</h3>
                <p className="feature-desc">Configura parámetros avanzados para evaluaciones precisas</p>
              </div>

              <div className="feature-card">
                <div className="feature-emoji">📊</div>
                <h3 className="feature-title">Reportes</h3>
                <p className="feature-desc">Genera reportes comprensivos de calidad de software</p>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}