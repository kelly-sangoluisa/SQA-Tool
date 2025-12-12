'use client';

import { useState } from 'react';
import type { EvaluationReport } from '@/api/reports/reports.types';
import { FaInfoCircle } from 'react-icons/fa';

interface Props {
  report: EvaluationReport;
}

export function RadarChart({ report }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCriteriaForRadar, setSelectedCriteriaForRadar] = useState<number[]>(
    report.criteria_results.slice(0, Math.min(5, report.criteria_results.length)).map((_, idx) => idx)
  );

  const hasMinimumCriteria = report.criteria_results.length >= 3;

  // Toggle criterio para radar
  const toggleCriterionForRadar = (index: number) => {
    setSelectedCriteriaForRadar(prev => {
      if (prev.includes(index)) {
        // No permitir desmarcar si quedan menos de 3
        if (prev.length <= 3) return prev;
        return prev.filter(i => i !== index);
      } else {
        // No permitir más de 6
        if (prev.length >= 6) return prev;
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  // Datos para radar chart
  const radarData = selectedCriteriaForRadar.map(idx => ({
    name: report.criteria_results[idx].criterion_name,
    score: report.criteria_results[idx].final_score
  }));

  // Calcular puntos del polígono para SVG
  const calculateRadarPoints = () => {
    const centerX = 100;
    const centerY = 100;
    const radius = 70;
    const angleStep = (Math.PI * 2) / radarData.length;
    
    return radarData.map((item, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const scoreRatio = item.score / 100;
      const x = centerX + radius * scoreRatio * Math.cos(angle);
      const y = centerY + radius * scoreRatio * Math.sin(angle);
      return { x, y, angle, label: item.name, score: item.score };
    });
  };

  const radarPoints = calculateRadarPoints();

  if (!isExpanded) {
    return (
      <div className="radar-toggle-container">
        <button 
          className="radar-toggle-btn"
          onClick={() => hasMinimumCriteria && setIsExpanded(true)}
          disabled={!hasMinimumCriteria}
          title={!hasMinimumCriteria ? 'Se requieren al menos 3 criterios para generar el gráfico de radar' : ''}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ver Gráfico de Radar
        </button>
        {!hasMinimumCriteria && (
          <p className="radar-info-message">
            <FaInfoCircle style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Se requieren al menos 3 criterios para visualizar el gráfico de radar
          </p>
        )}

        <style jsx>{`
          .radar-toggle-container {
            margin-top: 1.5rem;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(78, 94, 163, 0.05), rgba(89, 70, 154, 0.05));
            border: 2px dashed rgba(78, 94, 163, 0.2);
            border-radius: 12px;
            text-align: center;
          }

          .radar-toggle-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #4E5EA3 0%, #59469A 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(78, 94, 163, 0.2);
          }

          .radar-toggle-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(78, 94, 163, 0.3);
          }

          .radar-toggle-btn:disabled {
            background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            cursor: not-allowed;
            opacity: 0.6;
          }

          .radar-info-message {
            margin-top: 0.75rem;
            padding: 0.625rem 1rem;
            background: rgba(59, 130, 246, 0.08);
            border-left: 3px solid rgba(59, 130, 246, 0.4);
            border-radius: 6px;
            color: #475569;
            font-size: 0.8125rem;
            text-align: left;
            line-height: 1.4;
            display: flex;
            align-items: center;
          }

          .radar-toggle-btn svg {
            flex-shrink: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="radar-chart-wrapper">
      <div className="radar-header">
        <h4 className="radar-title">🎯 Gráfico de Radar - Balance de Criterios</h4>
        <button 
          className="radar-close-btn"
          onClick={() => setIsExpanded(false)}
          title="Cerrar gráfico"
        >
          ✕
        </button>
      </div>
      
      <p className="radar-subtitle">
        Selecciona entre 3 y 6 criterios ({selectedCriteriaForRadar.length} seleccionados)
      </p>
      
      {/* Selector de criterios */}
      <div className="criteria-selector">
        {report.criteria_results.map((criterion, index) => {
          const isSelected = selectedCriteriaForRadar.includes(index);
          const isDisabled = !isSelected && selectedCriteriaForRadar.length >= 6;
          const cannotDeselect = isSelected && selectedCriteriaForRadar.length <= 3;
          
          return (
            <button
              key={index}
              onClick={() => toggleCriterionForRadar(index)}
              disabled={isDisabled || cannotDeselect}
              className={`criterion-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              title={cannotDeselect ? 'Mínimo 3 criterios' : isDisabled ? 'Máximo 6 criterios' : ''}
            >
              {criterion.criterion_name}
            </button>
          );
        })}
      </div>

      {/* SVG Radar Chart */}
      <div className="radar-content">
        <svg viewBox="0 0 200 200" className="radar-svg">
          {/* Grid circles */}
          {[20, 40, 60, 80, 100].map((percentage, idx) => (
            <circle
              key={`grid-${idx}`}
              cx="100"
              cy="100"
              r={(70 * percentage) / 100}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Axes lines */}
          {radarPoints.map((point, index) => (
            <line
              key={`axis-${index}`}
              x1="100"
              y1="100"
              x2={100 + 70 * Math.cos(point.angle)}
              y2={100 + 70 * Math.sin(point.angle)}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          ))}
          
          {/* Data polygon */}
          <polygon
            points={radarPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="rgba(78, 94, 163, 0.3)"
            stroke="#4E5EA3"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {radarPoints.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#4E5EA3"
                stroke="white"
                strokeWidth="2"
              />
              <title>{`${point.label}: ${point.score.toFixed(1)}%`}</title>
            </g>
          ))}
          
          {/* Labels */}
          {radarPoints.map((point, index) => {
            const labelRadius = 85;
            const labelX = 100 + labelRadius * Math.cos(point.angle);
            const labelY = 100 + labelRadius * Math.sin(point.angle);
            const textAnchor = labelX > 100 ? 'start' : labelX < 100 ? 'end' : 'middle';
            
            return (
              <text
                key={`label-${index}`}
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                fontSize="7"
                fill="#4b5563"
                fontWeight="500"
              >
                {point.label.length > 18 ? point.label.substring(0, 15) + '...' : point.label}
              </text>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="radar-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
            <span>≥80%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
            <span>60-79%</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
            <span>&lt;60%</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .radar-chart-wrapper {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .radar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .radar-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .radar-close-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          color: #6b7280;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .radar-close-btn:hover {
          background: #ef4444;
          color: white;
        }

        .radar-subtitle {
          font-size: 0.8125rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .criteria-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.875rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .criterion-chip {
          padding: 0.375rem 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .criterion-chip:hover:not(:disabled) {
          border-color: #4E5EA3;
          color: #4E5EA3;
          transform: translateY(-1px);
        }

        .criterion-chip.selected {
          background: linear-gradient(135deg, #4E5EA3 0%, #59469A 100%);
          color: white;
          border-color: #4E5EA3;
        }

        .criterion-chip.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .radar-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .radar-svg {
          width: 100%;
          max-width: 350px;
          height: auto;
        }

        .radar-legend {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: #4b5563;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .radar-chart-wrapper {
            padding: 1rem;
          }

          .radar-title {
            font-size: 0.9375rem;
          }

          .criteria-selector {
            gap: 0.375rem;
            padding: 0.75rem;
          }

          .criterion-chip {
            padding: 0.3125rem 0.75rem;
            font-size: 0.75rem;
          }

          .radar-svg {
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  );
}
