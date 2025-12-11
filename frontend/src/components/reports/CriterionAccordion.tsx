'use client';

import { useState } from 'react';
import type { CriterionResult } from '@/api/reports/reports.types';

interface Props {
  criterion: CriterionResult;
  index: number;
}

export function CriterionAccordion({ criterion, index }: Props) {
  const [isOpen, setIsOpen] = useState(index === 0); // Primer criterio abierto por defecto

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Verde
    if (score >= 60) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
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

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'A': return '#dc2626'; // Rojo intenso
      case 'M': return '#f59e0b'; // Amarillo
      case 'B': return '#3b82f6'; // Azul
      case 'NA': return '#6b7280'; // Gris
      default: return '#6b7280';
    }
  };

  return (
    <div className="criterion-accordion">
      {/* Header - Siempre visible */}
      <button 
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="header-left">
          <div className="criterion-number">#{index + 1}</div>
          <div className="criterion-info">
            <h3 className="criterion-name">{criterion.criterion_name}</h3>
            {criterion.criterion_description && (
              <p className="criterion-description">{criterion.criterion_description}</p>
            )}
          </div>
        </div>

        <div className="header-right">
          <div 
            className="importance-badge"
            style={{ 
              background: `${getImportanceColor(criterion.importance_level)}15`,
              color: getImportanceColor(criterion.importance_level),
              borderColor: `${getImportanceColor(criterion.importance_level)}40`
            }}
          >
            {getImportanceLabel(criterion.importance_level)} ({criterion.importance_percentage}%)
          </div>
          
          <div className="score-badge" style={{ color: getScoreColor(criterion.final_score) }}>
            <span className="score-value">{criterion.final_score.toFixed(2)}</span>
            <span className="score-label">Puntuación</span>
          </div>

          <svg 
            className={`chevron ${isOpen ? 'chevron--open' : ''}`}
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M6 9l6 6 6-6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Content - Colapsable */}
      {isOpen && (
        <div className="accordion-content">
          <div className="metrics-grid">
            {criterion.metrics.map((metric, metricIndex) => (
              <div key={metricIndex} className="metric-card">
                {/* Metric Header */}
                <div className="metric-header">
                  <div className="metric-title-row">
                    <span className="metric-code">{metric.metric_code}</span>
                    <h4 className="metric-name">{metric.metric_name}</h4>
                  </div>
                  {metric.metric_description && (
                    <p className="metric-description">{metric.metric_description}</p>
                  )}
                </div>

                {/* Threshold Badge */}
                <div className={`threshold-indicator ${metric.meets_threshold ? 'threshold-indicator--success' : 'threshold-indicator--warning'}`}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    {metric.meets_threshold ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    )}
                  </svg>
                  {metric.meets_threshold ? 'Cumple' : 'No Cumple'}
                </div>

                {/* Formula */}
                {metric.formula && (
                  <div className="formula-section">
                    <span className="section-label">Fórmula:</span>
                    <code className="formula-code">{metric.formula}</code>
                  </div>
                )}

                {/* Variables */}
                {metric.variables && metric.variables.length > 0 && (
                  <div className="variables-section">
                    <span className="section-label">Variables:</span>
                    <div className="variables-list">
                      {metric.variables.map((variable, varIndex) => (
                        <div key={varIndex} className="variable-row">
                          <div className="variable-symbol">{variable.symbol}</div>
                          <div className="variable-info">
                            <span className="variable-desc">{variable.description}</span>
                            <span className="variable-value">{variable.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Values Grid */}
                <div className="values-grid">
                  <div className="value-item">
                    <span className="value-label">Valor Calculado:</span>
                    <span className="value-number">{metric.calculated_value.toFixed(2)}</span>
                  </div>
                  <div className="value-item">
                    <span className="value-label">Umbral Deseado:</span>
                    <span className="value-number">{metric.desired_threshold?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="value-item value-item--highlight">
                    <span className="value-label">Valor Ponderado:</span>
                    <span className="value-number value-number--highlight">{metric.weighted_value.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .criterion-accordion {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          overflow: hidden;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .criterion-accordion:hover {
          box-shadow: 0 8px 32px rgba(78, 94, 163, 0.12);
        }

        .accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: white;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          gap: 1.5rem;
        }

        .accordion-header:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .criterion-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .criterion-info {
          flex: 1;
        }

        .criterion-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.25rem 0;
        }

        .criterion-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .importance-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }

        .score-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .score-value {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1;
        }

        .score-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }

        .chevron {
          color: var(--color-primary);
          transition: transform 0.3s ease;
        }

        .chevron--open {
          transform: rotate(180deg);
        }

        .accordion-content {
          padding: 0 1.5rem 1.5rem 1.5rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .metrics-grid {
          display: grid;
          gap: 1rem;
        }

        .metric-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 1.25rem;
          border-left: 4px solid var(--color-primary);
        }

        .metric-header {
          margin-bottom: 1rem;
        }

        .metric-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .metric-code {
          padding: 0.25rem 0.625rem;
          background: var(--color-primary);
          color: white;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .metric-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0;
        }

        .metric-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .threshold-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .threshold-indicator--success {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .threshold-indicator--warning {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .formula-section,
        .variables-section {
          background: white;
          padding: 0.875rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
        }

        .section-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 0.5rem;
        }

        .formula-code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #4b5563;
          background: #f9fafb;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          display: block;
        }

        .variables-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .variable-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .variable-symbol {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .variable-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .variable-desc {
          font-size: 0.875rem;
          color: #4b5563;
          flex: 1;
        }

        .variable-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-primary);
          padding: 0.25rem 0.625rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
          background: white;
          padding: 0.875rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .value-item {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .value-item--highlight {
          background: linear-gradient(135deg, rgba(78, 94, 163, 0.05), rgba(89, 70, 154, 0.05));
          padding: 0.625rem;
          border-radius: 8px;
          border: 1px solid rgba(78, 94, 163, 0.15);
        }

        .value-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .value-number--highlight {
          color: var(--color-primary);
          font-size: 1.25rem;
        }

        @media (max-width: 768px) {
          .accordion-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-right {
            flex-wrap: wrap;
            justify-content: space-between;
          }

          .score-badge {
            align-items: flex-start;
          }

          .variable-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
