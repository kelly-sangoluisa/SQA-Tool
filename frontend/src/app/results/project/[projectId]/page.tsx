'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { EvaluationCard } from '@/components/reports/EvaluationCard';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getEvaluationsByProject, getProjectReport } from '@/api/reports/reports.api';
import type { EvaluationListItem, ProjectReport } from '@/api/reports/reports.types';
import '@/styles/reports/project-evaluations.css';

function ProjectEvaluationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const isValidProjectId = !Number.isNaN(projectId) && projectId > 0;

  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [projectReport, setProjectReport] = useState<ProjectReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!isValidProjectId) {
      setError('ID de proyecto inválido');
      setLoading(false);
      return;
    }
    loadEvaluations().catch(() => {
      // Error handled in loadEvaluations
    });
  }, [projectId, isValidProjectId]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEvaluationsByProject(projectId);
      setEvaluations(data);
      
      // Cargar reporte del proyecto para verificar si está completado
      try {
        const report = await getProjectReport(projectId);
        setProjectReport(report);
      } catch (error_) {
        console.error('Project not completed or no results:', error_);
        // Proyecto aún no completado o sin resultados
      }
    } catch {
      setError('Error al cargar las evaluaciones del proyecto.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = (evaluations || []).filter(evaluation => {
    if (filter === 'all') return true;
    if (filter === 'completed') return evaluation.has_results;
    if (filter === 'pending') return !evaluation.has_results;
    return true;
  });

  const completedCount = (evaluations || []).filter(e => e.has_results).length;
  const pendingCount = (evaluations || []).filter(e => !e.has_results).length;

  // Obtener nombre del proyecto de la primera evaluación
  const projectName = (evaluations && evaluations.length > 0 && evaluations[0]?.project_name) || 'Proyecto';

  if (loading) {
    return (
      <div className="evaluations-page">
        <div className="page-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
        </div>
        <div className="content-container">
          <div className="skeleton skeleton-filters"></div>
          <div className="evaluations-grid">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluations-page">
      {/* Widget flotante arriba a la derecha cuando proyecto completado */}
      {projectReport?.status === 'completed' && (
        <div className="project-results-widget">
          <div className="score-circle">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={projectReport.meets_threshold ? '#10b981' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - projectReport.final_project_score / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="score-content">
              <div className="score-value">{projectReport.final_project_score.toFixed(1)}</div>
              <div className="score-label">{projectReport.meets_threshold ? 'Excelente' : 'Necesita Mejora'}</div>
            </div>
          </div>
          <button
            className="widget-results-btn"
            onClick={() => router.push(`/results/project/${projectId}/report`)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ver Resultados
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="header-left">
          <Breadcrumbs 
            items={[
              { label: 'Dashboard', onClick: () => router.push('/dashboard') },
              { label: 'Proyectos', onClick: () => router.push('/results') },
              { label: projectName, isActive: true }
            ]}
          />
          
          <div className="header-content">
            <h1 className="page-title">{projectName}</h1>
            <p className="page-subtitle">
              Visualiza y analiza los resultados de las evaluaciones de calidad
            </p>
          </div>
        </div>

        <div className="stats-summary">
          <div className="stat-chip stat-chip--total">
            <span className="stat-number">{evaluations?.length || 0}</span>
            <span className="stat-text">Total</span>
          </div>
          <div className="stat-chip stat-chip--completed">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-text">Completadas</span>
          </div>
          <div className="stat-chip stat-chip--pending">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-text">Pendientes</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({evaluations?.length || 0})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completadas ({completedCount})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({pendingCount})
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Cargando evaluaciones...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => { loadEvaluations().catch(() => {}); }}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && filteredEvaluations.length === 0 && (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>No hay datos para visualizar</h3>
          <p>
            {(() => {
              if (filter === 'completed') {
                return 'No hay evaluaciones completadas disponibles. Una vez que finalices una evaluación, los resultados aparecerán aquí.';
              }
              if (filter === 'pending') {
                return 'No hay evaluaciones pendientes. Las evaluaciones sin resultados aparecerán aquí.';
              }
              return 'Este proyecto no tiene evaluaciones registradas. Comienza creando una nueva evaluación.';
            })()}
          </p>
        </div>
      )}

      {!loading && !error && filteredEvaluations.length > 0 && (
        <div className="evaluations-grid">
          {filteredEvaluations.map((evaluation) => (
            <EvaluationCard key={evaluation.evaluation_id} evaluation={evaluation} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectEvaluationsPageWrapper() {
  return (
    <ProtectedRoute requiredRole="any">
      <ProjectEvaluationsPage />
    </ProtectedRoute>
  );
}
