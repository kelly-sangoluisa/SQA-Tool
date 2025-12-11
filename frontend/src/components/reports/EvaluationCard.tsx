'use client';

import Link from 'next/link';
import type { EvaluationListItem } from '@/api/reports/reports.types';

interface EvaluationCardProps {
  evaluation: EvaluationListItem;
}

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'var(--color-light)';
    if (score >= 80) return '#10b981'; // Verde
    if (score >= 60) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'Pendiente';
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    return 'Necesita mejora';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="evaluation-card">
      <div className="evaluation-card-header">
        <div className="evaluation-card-info">
          <h3 className="evaluation-card-title">{evaluation.project_name}</h3>
          <p className="evaluation-card-standard">{evaluation.standard_name}</p>
          <p className="evaluation-card-date">{formatDate(evaluation.created_at)}</p>
        </div>
        
        {evaluation.has_results && evaluation.final_score !== null && (
          <div 
            className="evaluation-card-score"
            style={{ 
              background: `linear-gradient(135deg, ${getScoreColor(evaluation.final_score)}, ${getScoreColor(evaluation.final_score)}dd)`
            }}
          >
            <div className="score-value">{evaluation.final_score.toFixed(1)}</div>
            <div className="score-label">{getScoreLabel(evaluation.final_score)}</div>
          </div>
        )}

        {!evaluation.has_results && (
          <div className="evaluation-card-score evaluation-card-score--pending">
            <div className="score-label">Sin resultados</div>
          </div>
        )}
      </div>

      <div className="evaluation-card-footer">
        {evaluation.has_results ? (
          <Link 
            href={`/results/${evaluation.evaluation_id}`}
            className="btn-view-results"
          >
            <span>Ver Resultados</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <button className="btn-view-results btn-view-results--disabled" disabled>
            <span>Evaluación incompleta</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .evaluation-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .evaluation-card::before {
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

        .evaluation-card:hover::before {
          transform: scaleX(1);
        }

        .evaluation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
          border-color: var(--color-primary);
        }

        .evaluation-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .evaluation-card-info {
          flex: 1;
        }

        .evaluation-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        .evaluation-card-standard {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0 0 0.25rem 0;
        }

        .evaluation-card-date {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .evaluation-card-score {
          min-width: 100px;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          position: relative;
        }

        .evaluation-card-score::after {
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

        .evaluation-card-score--pending {
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

        .evaluation-card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .btn-view-results {
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

        .btn-view-results:hover::before {
          opacity: 1;
        }

        .btn-view-results:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(78, 94, 163, 0.3);
        }

        .btn-view-results:active {
          transform: translateY(0);
        }

        .btn-view-results--disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-view-results--disabled:hover {
          transform: none;
        }
      `}</style>
    </div>
  );
}
