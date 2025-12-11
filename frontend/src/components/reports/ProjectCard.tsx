import React from 'react';
import Link from 'next/link';
import type { ProjectSummary } from '@/api/reports/reports.types';

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasScore = project.final_project_score !== null;
  const hasThreshold = project.minimum_threshold !== null;

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-card-info">
          <h3 className="project-card-title">{project.project_name}</h3>
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

      {hasScore && hasThreshold && (
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
          <span>Ver Evaluaciones</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
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
        }

        .project-card-info {
          flex: 1;
        }

        .project-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        .project-card-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.75rem 0;
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
          justify-content: flex-end;
        }

        .btn-view-evaluations {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(78, 94, 163, 0.2);
          position: relative;
          overflow: hidden;
        }

        .btn-view-evaluations::before {
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

        .btn-view-evaluations:hover::before {
          opacity: 1;
        }

        .btn-view-evaluations:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(78, 94, 163, 0.3);
        }

        .btn-view-evaluations:active {
          transform: translateY(0);
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
