'use client';

import Link from 'next/link';
import type { EvaluationListItem } from '@/api/reports/reports.types';
import { formatDate, getScoreColor, getScoreLabel, validateScore } from '@/lib/shared/formatters';
import '@/styles/reports/evaluation-card.css';

interface EvaluationCardProps {
  evaluation: EvaluationListItem;
}

export function EvaluationCard({ evaluation }: Readonly<EvaluationCardProps>) {

  return (
    <div className="evaluation-card">
      <div className="evaluation-card-header">
        <div className="evaluation-card-info">
          <h3 className="evaluation-card-title">{evaluation.standard_name}</h3>
          <p className="evaluation-card-standard">{evaluation.project_name}</p>
          <p className="evaluation-card-date">{formatDate(evaluation.created_at)}</p>
        </div>
        
        {evaluation.has_results && evaluation.final_score !== null && (
          <div 
            className="evaluation-card-score"
            style={{ 
              background: `linear-gradient(135deg, ${getScoreColor(evaluation.final_score)}, ${getScoreColor(evaluation.final_score)}dd)`
            }}
          >
            <div className="score-value">
              {validateScore(evaluation.final_score).toFixed(1)}
            </div>
            <div className="score-label">
              {getScoreLabel(evaluation.final_score)}
            </div>
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
            <div className="btn-content">
              <span>Ver Resultados</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        ) : (
          <button className="btn-view-results btn-view-results--disabled" disabled>
            <div className="btn-content">
              <span>Evaluación incompleta</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
