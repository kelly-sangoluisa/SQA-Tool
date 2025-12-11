import React from 'react';
import Link from 'next/link';
import type { ProjectSummary } from '@/api/reports/reports.types';

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

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
    <Link href={`/results/project/${project.project_id}`} style={{ textDecoration: 'none' }}>
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

          <div 
            className="project-status-badge"
            style={{ backgroundColor: getStatusColor(project.status) }}
          >
            {getStatusLabel(project.status)}
          </div>
        </div>

        {hasScore && hasThreshold && (
          <div className="project-score-section">
            <div className="score-info">
              <div className="score-item">
                <span className="score-label">Puntuación Final:</span>
                <span className="score-value">{project.final_project_score?.toFixed(1)}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Umbral Mínimo:</span>
                <span className="score-value">{project.minimum_threshold?.toFixed(1)}</span>
              </div>
            </div>

            <div 
              className={`approval-badge ${project.meets_threshold ? 'approved' : 'rejected'}`}
            >
              {project.meets_threshold ? 'APROBADO' : 'NO APROBADO'}
            </div>
          </div>
        )}

        {!hasScore && (
          <div className="project-no-score">
            <span>Sin resultados finales</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .project-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-color: #4e5ea3;
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
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .project-card-description {
          font-size: 0.95rem;
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

        .project-status-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .project-score-section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .score-info {
          display: flex;
          gap: 2rem;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .score-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .approval-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .approval-badge.approved {
          background: #d1fae5;
          color: #065f46;
        }

        .approval-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .project-no-score {
          background: #fef3c7;
          border-radius: 8px;
          padding: 0.75rem;
          text-align: center;
          color: #92400e;
          font-weight: 500;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .project-card-header {
            flex-direction: column;
          }

          .project-score-section {
            flex-direction: column;
            align-items: stretch;
          }

          .score-info {
            justify-content: space-around;
          }
        }
      `}</style>
    </Link>
  );
}
