import React from 'react';
import Link from 'next/link';
import type { ProjectSummary } from '@/api/reports/reports.types';
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/shared/formatters';
import '@/styles/reports/project-card.css';

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
          <span className="threshold-value">{Number(project.minimum_threshold).toFixed(1)}%</span>
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
    </div>
  );
}
