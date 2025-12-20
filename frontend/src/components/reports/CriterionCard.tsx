'use client';

import type { CriterionResult } from '@/api/reports/reports.types';
import { getScoreColor } from '@/lib/shared/formatters';
import '@/styles/reports/criterion-card.css';

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
    </div>
  );
}
