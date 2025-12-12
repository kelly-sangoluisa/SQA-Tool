import React from 'react';
import Link from 'next/link';
import type { ProjectSummary } from '@/api/reports/reports.types';
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/shared/formatters';

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {

  const hasScore = project.final_project_score !== null;
  const hasThreshold = project.minimum_threshold !== null;
  const canViewResults = project.status === 'completed' && hasScore && hasThreshold;

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-card-info">
          <div className="title-row">
            <h3 className="project-card-title">{project.project_name}</h3>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(project.status) }}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>
          {project.project_description && (
            <p className="project-card-description">{project.project_description}</p>
          )}
          <div className="project-meta">
            <span className="project-date">{formatDate(project.created_at)}</span>
            <span className="project-evaluations">{project.evaluation_count} evaluación(es)</span>
          </div>
        </div>

        {hasScore && hasThreshold && (
          <div 
            className={`project-card-score ${project.meets_threshold ? 'project-card-score--success' : 'project-card-score--warning'}`}
          >
            <div className="score-value">{project.final_project_score?.toFixed(1)}</div>
            <div className="score-label">{project.meets_threshold ? 'Aprobado' : 'No Aprobado'}</div>
          </div>
        )}

        {!hasScore && (
          <div className="project-card-score project-card-score--pending">
            <div className="score-label">Sin resultados</div>
          </div>
        )}
      </div>

      {hasThreshold && (
        <div className="project-threshold-info">
          <span className="threshold-label">Umbral mínimo:</span>
          <span className="threshold-value">{project.minimum_threshold?.toFixed(1)}</span>
        </div>
      )}

      <div className="project-card-footer">
        <Link 
          href={`/results/project/${project.project_id}`}
          className="btn-view-evaluations"
        >
          <div className="btn-content">
            <span>Ver Evaluaciones</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </Link>
        
        {canViewResults ? (
          <Link 
            href={`/results/project/${project.project_id}/report`}
            className="btn-view-results"
          >
            <div className="btn-content">
              <span>Ver Resultados</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        ) : (
          <button 
            className="btn-view-results btn-view-results--disabled"
            disabled
            title="El proyecto debe estar completado y tener resultados"
          >
            <div className="btn-content">
              <span>Ver Resultados</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        )}
      </div>

      <style jsx>{`
        .project-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .project-card:hover::before {
          transform: scaleX(1);
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
          border-color: var(--color-primary);
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-grow: 1;
        }

        .project-card-info {
          flex: 1;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .project-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .project-card-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.5rem 0 0.75rem 0;
          line-height: 1.4;
        }

        .project-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .project-card-score {
          min-width: 100px;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          position: relative;
        }

        .project-card-score::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .project-card-score--success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .project-card-score--warning {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .project-card-score--pending {
          background: var(--color-light);
          color: #6b7280;
          box-shadow: none;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .score-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .project-threshold-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .threshold-label {
          color: #6b7280;
          font-weight: 500;
        }

        .threshold-value {
          color: var(--color-primary);
          font-weight: 700;
        }

        .project-card-footer {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          padding-top: 0.5rem;
          margin-top: auto;
        }

        .btn-view-evaluations,
        .btn-view-results {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          line-height: 1;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          max-width: 200px;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-view-evaluations svg,
        .btn-view-results svg {
          flex-shrink: 0;
          display: block;
        }

        .btn-view-evaluations {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.25);
        }

        .btn-view-results {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .btn-view-results--disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-view-evaluations::before,
        .btn-view-results::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-view-evaluations:hover:not(:disabled)::before,
        .btn-view-results:not(.btn-view-results--disabled):hover::before {
          opacity: 1;
        }

        .btn-view-evaluations:hover:not(:disabled),
        .btn-view-results:not(.btn-view-results--disabled):hover {
          transform: translateY(-3px) scale(1.02);
        }

        .btn-view-evaluations:hover:not(:disabled) {
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.4);
        }

        .btn-view-results:not(.btn-view-results--disabled):hover {
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        .btn-view-evaluations:active,
        .btn-view-results:active {
          transform: translateY(-1px) scale(1);
        }

        .btn-view-results--disabled:hover {
          transform: none;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .project-card-header {
            flex-direction: column;
          }

          .project-threshold-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
