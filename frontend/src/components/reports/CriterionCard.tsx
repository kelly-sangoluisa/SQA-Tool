'use client';

import type { CriterionResult } from '@/api/reports/reports.types';

interface CriterionCardProps {
  criterion: CriterionResult;
}

export function CriterionCard({ criterion }: CriterionCardProps) {
  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'A': return '#ef4444'; // Alta
      case 'M': return '#f59e0b'; // Media
      case 'B': return '#3b82f6'; // Baja
      case 'NA': return '#6b7280'; // No Aplicable
      default: return '#6b7280';
    }
  };

  const getImportanceLabel = (level: string) => {
    switch (level) {
      case 'A': return 'Alta';
      case 'M': return 'Media';
      case 'B': return 'Baja';
      case 'NA': return 'No Aplicable';
      default: return level;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="criterion-card">
      <div className="criterion-header">
        <div className="criterion-info">
          <h4 className="criterion-name">{criterion.criterion_name}</h4>
          <div className="criterion-badges">
            <span 
              className="importance-badge"
              style={{ backgroundColor: getImportanceColor(criterion.importance_level) }}
            >
              Importancia: {getImportanceLabel(criterion.importance_level)}
            </span>
            <span className="percentage-badge">
              {criterion.importance_percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div 
          className="criterion-score"
          style={{ 
            background: `linear-gradient(135deg, ${getScoreColor(criterion.final_score)}, ${getScoreColor(criterion.final_score)}dd)`
          }}
        >
          <div className="score-number">{criterion.final_score.toFixed(1)}</div>
        </div>
      </div>

      {criterion.metrics && criterion.metrics.length > 0 && (
        <div className="metrics-section">
          <h5 className="metrics-title">Métricas ({criterion.metrics.length})</h5>
          <div className="metrics-grid">
            {criterion.metrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-name">{metric.metric_name}</div>
                <div className="metric-values">
                  <div className="metric-value">
                    <span className="metric-label">Calculado:</span>
                    <span className="metric-number">{metric.calculated_value.toFixed(2)}</span>
                  </div>
                  <div className="metric-value">
                    <span className="metric-label">Ponderado:</span>
                    <span className="metric-number metric-number--weighted">
                      {metric.weighted_value.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .criterion-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .criterion-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.12);
        }

        .criterion-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .criterion-info {
          flex: 1;
        }

        .criterion-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.75rem 0;
        }

        .criterion-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .importance-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 24px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .percentage-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 24px;
          font-size: 0.75rem;
          font-weight: 700;
          background: var(--color-light);
          color: var(--color-primary-dark);
        }

        .criterion-score {
          min-width: 80px;
          padding: 0.75rem;
          border-radius: 12px;
          text-align: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .score-number {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
        }

        .metrics-section {
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .metrics-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.75rem 0;
        }

        .metrics-grid {
          display: grid;
          gap: 0.75rem;
        }

        .metric-item {
          background: #f8fafc;
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
        }

        .metric-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary-dark);
          margin-bottom: 0.5rem;
        }

        .metric-values {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .metric-value {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .metric-number {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .metric-number--weighted {
          color: #10b981;
        }
      `}</style>
    </div>
  );
}
