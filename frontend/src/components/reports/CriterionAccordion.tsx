'use client';

import { useState } from 'react';
import type { CriterionResult } from '@/api/reports/reports.types';
import { getScoreColor } from '@/lib/shared/formatters';
import '@/styles/reports/criterion-accordion.css';

interface Props {
  criterion: CriterionResult;
  index: number;
}

export function CriterionAccordion({ criterion, index }: Props) {
  const [isOpen, setIsOpen] = useState(false); // Todos cerrados por defecto

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
                    <span className="value-number">{metric.desired_threshold ? Number(metric.desired_threshold).toFixed(2) : 'N/A'}</span>
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
    </div>
  );
}
