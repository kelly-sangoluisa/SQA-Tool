'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/auth/useAuth';
import '../styles/home.css';
import '../styles/components.css';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario está autenticado, redirigir a su dashboard correspondiente
    if (!isLoading && isAuthenticated && user) {
      // Redirigir según el rol del usuario
      switch (user.role.name) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'evaluator':
          router.push('/dashboard');
          break;
        case 'viewer':
          router.push('/results');
          break;
        default:
          router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Mostrar un loader mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="home-root">
        <div className="home-container home-center">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Image 
              src="/logo-SQATool.png" 
              alt="SQA Tool Logo" 
              width={120} 
              height={120}
              priority
              style={{ filter: 'drop-shadow(0 8px 24px rgba(78, 94, 163, 0.3))' }}
            />
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario ya está autenticado, no mostrar nada (está redirigiendo)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="home-root">
      <div className="home-container home-center">
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Image 
            src="/logo-SQATool.png" 
            alt="SQA Tool Logo" 
            width={120} 
            height={120}
            priority
            style={{ filter: 'drop-shadow(0 8px 24px rgba(78, 94, 163, 0.3))' }}
          />
          <h1 className="home-title">SQA Tool</h1>
        </div>
        <p className="home-subtitle">
          Herramienta profesional para la evaluación y aseguramiento de la calidad de software. 
          Administra criterios de evaluación, parametriza procesos y genera reportes detallados 
          basados en estándares de la industria.
        </p>

        {/* Action Buttons */}
        <div className="actions">
          <Link href="/auth/login" className="btn btn-primary">
            Iniciar Sesión
          </Link>
          <Link href="/auth/signup" className="btn btn-outline">
            Registrarse
          </Link>
        </div>

        {/* Features */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-emoji">⚙️</div>
            <h3 className="feature-title">Configuración</h3>
            <p className="feature-desc">
              Define criterios y parámetros de evaluación personalizados adaptados a tus necesidades
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-emoji">📝</div>
            <h3 className="feature-title">Entrada de Datos</h3>
            <p className="feature-desc">
              Registra información detallada de tus proyectos de software de forma estructurada
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-emoji">🎛️</div>
            <h3 className="feature-title">Parametrización</h3>
            <p className="feature-desc">
              Configura parámetros avanzados para evaluaciones precisas y métricas personalizadas
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-emoji">📊</div>
            <h3 className="feature-title">Reportes</h3>
            <p className="feature-desc">
              Genera reportes comprensivos de calidad con análisis detallados y visualizaciones
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="tech-bar">
          <p className="tech-label">Construido con tecnologías modernas</p>
          <div className="tech-list">
            <span className="tech-pill">Next.js 15</span>
            <span className="tech-pill">NestJS 11</span>
            <span className="tech-pill">TypeScript</span>
            <span className="tech-pill">PostgreSQL</span>
            <span className="tech-pill">Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
