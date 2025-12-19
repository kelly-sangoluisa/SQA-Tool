'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ProjectCard } from '@/components/reports/ProjectCard';
import { LoadMoreTrigger } from '@/components/shared/LoadMoreTrigger';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getMyProjects } from '@/api/reports/reports.api';
import type { ProjectSummary } from '@/api/reports/reports.types';
import { useInfiniteScroll } from '@/hooks/shared/useInfiniteScroll';
import { PAGINATION } from '@/lib/shared/constants';
import '@/styles/reports/results-list.css';

function ResultsPageContent() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'in_progress'>('all');

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProjects();
      // Mostrar TODOS los proyectos del usuario
      setProjects(data);
    } catch {
      setError('Error al cargar los proyectos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = (projects || []).filter(project => {
    if (filter === 'all') return true;
    if (filter === 'approved') return project.status === 'completed' && project.final_project_score !== null && project.meets_threshold;
    if (filter === 'rejected') return project.status === 'completed' && project.final_project_score !== null && !project.meets_threshold;
    if (filter === 'in_progress') return project.status === 'in_progress';
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

  const approvedCount = (projects || []).filter(p => p.status === 'completed' && p.final_project_score !== null && p.meets_threshold).length;
  const rejectedCount = (projects || []).filter(p => p.status === 'completed' && p.final_project_score !== null && !p.meets_threshold).length;
  const inProgressCount = (projects || []).filter(p => p.status === 'in_progress').length;

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
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="page-header">
        <div className="header-left">
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
          <div className="stat-chip stat-chip--in-progress">
            <span className="stat-number">{inProgressCount}</span>
            <span className="stat-text">En Progreso</span>
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
        <button
          className={`filter-btn ${filter === 'in_progress' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          En Progreso ({inProgressCount})
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
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="any">
      <ResultsPageContent />
    </ProtectedRoute>
  );
}
