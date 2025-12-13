'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCard } from '@/components/reports/ProjectCard';
import { LoadMoreTrigger } from '@/components/shared/LoadMoreTrigger';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getMyProjects } from '@/api/reports/reports.api';
import type { ProjectSummary } from '@/api/reports/reports.types';
import { useInfiniteScroll } from '@/hooks/shared/useInfiniteScroll';
import { PAGINATION } from '@/lib/shared/constants';

export default function ResultsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProjects();
      // Filtrar solo proyectos completados (con resultados)
      const completedProjects = data.filter(p => p.final_project_score !== null);
      setProjects(completedProjects);
    } catch {
      setError('Error al cargar los proyectos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = (projects || []).filter(project => {
    if (filter === 'all') return true;
    if (filter === 'approved') return project.meets_threshold;
    if (filter === 'rejected') return !project.meets_threshold;
    return true;
  });

  const { displayedItems: displayedProjects, hasMore, observerTarget, reset } = useInfiniteScroll(
    filteredProjects,
    { itemsPerPage: PAGINATION.PROJECTS_PER_PAGE }
  );

  useEffect(() => {
    loadProjects().catch(() => {
      // Error already handled in loadProjects
    });
  }, []);

  useEffect(() => {
    // Reset cuando cambia el filtro
    reset();
  }, [filter, reset]);

  const approvedCount = (projects || []).filter(p => p.meets_threshold).length;
  const rejectedCount = (projects || []).filter(p => !p.meets_threshold).length;

  // Mostrar loading inicial sin contenido para evitar FOUC
  if (loading && projects.length === 0) {
    return (
      <div className="results-page">
        <div className="page-header">
          <div className="header-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>

        <div className="content-container">
          <div className="skeleton skeleton-filters"></div>
          <div className="projects-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s ease-in-out infinite;
            border-radius: 8px;
          }

          .skeleton-title {
            height: 40px;
            width: 300px;
            margin-bottom: 0.5rem;
          }

          .skeleton-subtitle {
            height: 20px;
            width: 400px;
          }

          .skeleton-filters {
            height: 60px;
            width: 100%;
            margin-bottom: 2rem;
          }

          .skeleton-card {
            height: 200px;
            width: 100%;
          }

          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          .results-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 2rem;
          }

          .page-header {
            max-width: 1200px;
            margin: 0 auto 2rem;
          }

          .content-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="page-header">
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', onClick: () => router.push('/dashboard') },
            { label: 'Proyectos', isActive: true }
          ]}
        />

        <div className="header-content">
          <h1 className="page-title">Resultados de Proyectos</h1>
          <p className="page-subtitle">
            Visualiza y analiza los resultados de todos tus proyectos de calidad de software
          </p>
        </div>

        <div className="stats-summary">
          <div className="stat-chip stat-chip--total">
            <span className="stat-number">{projects?.length || 0}</span>
            <span className="stat-text">Total</span>
          </div>
          <div className="stat-chip stat-chip--approved">
            <span className="stat-number">{approvedCount}</span>
            <span className="stat-text">Aprobados</span>
          </div>
          <div className="stat-chip stat-chip--rejected">
            <span className="stat-number">{rejectedCount}</span>
            <span className="stat-text">No Aprobados</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({projects?.length || 0})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Aprobados ({approvedCount})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          No Aprobados ({rejectedCount})
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Cargando proyectos...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadProjects}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>No hay datos para visualizar</h3>
          <p>
            {filter === 'approved' 
              ? 'No hay proyectos aprobados disponibles. Una vez que completes las evaluaciones, los proyectos aprobados aparecerán aquí.'
              : filter === 'rejected'
              ? 'No hay proyectos no aprobados. Los proyectos que no cumplan el umbral aparecerán aquí.'
              : 'No se encontraron proyectos completados. Los proyectos con evaluaciones finalizadas aparecerán aquí.'}
          </p>
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <>
          <div className="projects-grid">
            {displayedProjects.map(project => (
              <ProjectCard key={project.project_id} project={project} />
            ))}
          </div>
          
          {hasMore && (
            <LoadMoreTrigger 
              observerRef={observerTarget} 
              message="Cargando más proyectos..." 
            />
          )}
        </>
      )}

      <style jsx>{`
        .results-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
        }
        .page-header {
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: var(--color-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }

        .back-button:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.15);
        }

        .header-content {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.75rem 0;
          animation: fadeInDown 0.6s ease;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
          max-width: 600px;
          animation: fadeInUp 0.6s ease;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          max-width: 500px;
        }

        @media (min-width: 640px) {
          .stats-summary {
            grid-template-columns: repeat(4, 1fr);
            max-width: 100%;
          }
        }

        .stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .stat-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .stat-chip--total {
          border-left: 4px solid var(--color-primary);
        }

        .stat-chip--approved {
          border-left: 4px solid #10b981;
        }

        .stat-chip--rejected {
          border-left: 4px solid #ef4444;
        }

        .stat-chip--pending {
          border-left: 4px solid #f59e0b;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          min-width: 40px;
          text-align: center;
        }

        .stat-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .stat-chip--total .stat-number {
          color: var(--color-primary);
        }

        .stat-chip--approved .stat-number {
          color: #10b981;
        }

        .stat-chip--rejected .stat-number {
          color: #ef4444;
        }

        .stat-chip--pending .stat-number {
          color: #f59e0b;
        }

        .stat-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-bar {
          max-width: 1200px;
          margin: 0 auto 2rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          background: white;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .filter-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .filter-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          box-shadow: 0 2px 8px rgba(78, 94, 163, 0.15);
        }

        .filter-btn--active {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.25);
          position: relative;
        }

        .filter-btn--active span {
          position: relative;
          z-index: 1;
        }

        .projects-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          animation: fadeIn 0.6s ease;
        }

        .loading-state,
        .error-state,
        .empty-state {
          max-width: 600px;
          margin: 4rem auto;
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid #f1f5f9;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .loading-state p,
        .error-state p,
        .empty-state p {
          color: #6b7280;
          margin: 1rem 0;
        }

        .error-state {
          border: 2px solid #ef4444;
        }

        .error-state svg {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.25);
        }

        .empty-state svg {
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .results-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
