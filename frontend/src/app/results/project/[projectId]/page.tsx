'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EvaluationCard } from '@/components/reports/EvaluationCard';
import { getEvaluationsByProject, getProjectReport } from '@/api/reports/reports.api';
import type { EvaluationListItem, ProjectReport } from '@/api/reports/reports.types';

export default function ProjectEvaluationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [projectReport, setProjectReport] = useState<ProjectReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    loadEvaluations();
  }, [projectId]);

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
      } catch (reportErr) {
        // Proyecto aún no completado o sin resultados
      }
    } catch (err) {
      setError('Error al cargar las evaluaciones del proyecto.');
      console.error('Error loading evaluations:', err);
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
  const projectName = evaluations[0]?.project_name || 'Proyecto';

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
        <style jsx>{`
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s ease-in-out infinite;
            border-radius: 8px;
          }
          .skeleton-title { height: 40px; width: 300px; margin-bottom: 0.5rem; }
          .skeleton-subtitle { height: 20px; width: 400px; }
          .skeleton-filters { height: 60px; width: 100%; margin-bottom: 2rem; }
          .skeleton-card { height: 180px; width: 100%; }
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="evaluations-page">
      {/* Widget flotante arriba a la derecha cuando proyecto completado */}
      {projectReport && projectReport.status === 'completed' && (
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
        <button onClick={() => router.back()} className="back-button">
          ← Volver
        </button>
        <div className="header-content">
          <h1 className="page-title">Evaluaciones: {projectName}</h1>
          <p className="page-subtitle">
            Visualiza y analiza los resultados de las evaluaciones de calidad
          </p>
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
          <button className="retry-btn" onClick={loadEvaluations}>
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
            {filter === 'completed' 
              ? 'No hay evaluaciones completadas disponibles. Una vez que finalices una evaluación, los resultados aparecerán aquí.'
              : filter === 'pending'
              ? 'No hay evaluaciones pendientes. Las evaluaciones sin resultados aparecerán aquí.'
              : 'Este proyecto no tiene evaluaciones registradas. Comienza creando una nueva evaluación.'}
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

      <style jsx>{`
        .evaluations-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
          position: relative;
        }

        .project-results-widget {
          position: fixed;
          top: 2rem;
          right: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          z-index: 100;
          animation: slideInRight 0.5s ease;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .score-circle {
          position: relative;
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }

        .score-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 600;
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .widget-results-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          white-space: nowrap;
        }

        .widget-results-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .widget-results-btn svg {
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .project-results-widget {
            top: auto;
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            flex-direction: row;
            justify-content: center;
          }

          .score-circle {
            width: 80px;
            height: 80px;
          }

          .score-circle svg {
            width: 80px;
            height: 80px;
          }

          .score-value {
            font-size: 1.25rem;
          }

          .score-label {
            font-size: 0.625rem;
          }

          .widget-results-btn {
            padding: 0.75rem 1.25rem;
            font-size: 0.8125rem;
          }
        }

        .page-header {
          max-width: 1200px;
          margin: 0 auto 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          padding-right: 200px;
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
          flex: 1;
          min-width: 300px;
        }

        .page-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem 0;
          animation: fadeInDown 0.6s ease;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
          animation: fadeInUp 0.6s ease;
        }

        .stats-summary {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
          min-width: 100px;
          transition: all 0.3s ease;
        }

        .stat-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .stat-chip--total {
          border-left: 4px solid var(--color-primary);
        }

        .stat-chip--completed {
          border-left: 4px solid #10b981;
        }

        .stat-chip--pending {
          border-left: 4px solid #f59e0b;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }

        .stat-chip--total .stat-number {
          color: var(--color-primary);
        }

        .stat-chip--completed .stat-number {
          color: #10b981;
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

        .evaluations-grid {
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
          .evaluations-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .evaluations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
