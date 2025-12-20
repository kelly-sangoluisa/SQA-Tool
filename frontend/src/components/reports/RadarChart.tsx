'use client';

import { useState } from 'react';
import type { EvaluationReport } from '@/api/reports/reports.types';
import { FaInfoCircle } from 'react-icons/fa';
import '@/styles/reports/radar-chart.css';

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

  // Datos para radar chart - filter out invalid indices
  const radarData = selectedCriteriaForRadar
    .filter(idx => idx >= 0 && idx < report.criteria_results.length)
    .map(idx => ({
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
    </div>
  );
}
