'use client';
import Link from 'next/link';
import '../styles/home.css';
import '../styles/components.css';

export default function HomePage() {

  return (
    <div className="home-root">
      <div className="home-container home-center">
        {/* Header */}
        <h1 className="home-title">SQA Tool</h1>
        <p className="home-subtitle">
          Herramienta para la evaluación y aseguramiento de la calidad de software. 
          Administra criterios de evaluación, parametriza procesos y genera reportes detallados.
        </p>

        {/* Action Buttons */}
        <div className="actions">
          <Link href="/auth/login" className="btn btn-primary">Iniciar Sesión</Link>
          <Link href="/auth/signup" className="btn btn-outline">Registrarse</Link>
        </div>

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

        {/* Tech Stack */}
        <div className="tech-bar">
          <p className="tech-label">Construido con</p>
          <div className="tech-list">
            <span className="tech-pill">Next.js 14</span>
            <span className="tech-pill">NestJS</span>
            <span className="tech-pill">TypeScript</span>
            <span className="tech-pill">CSS</span>
            <span className="tech-pill">Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
