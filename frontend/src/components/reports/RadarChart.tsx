'use client';

import { useState } from 'react';
import type { EvaluationReport } from '@/api/reports/reports.types';
import { FaInfoCircle } from 'react-icons/fa';
import '@/styles/reports/radar-chart.css';

interface Props {
  report: EvaluationReport;
}

export function RadarChart({ report }: Readonly<Props>) {
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
    const centerX = 140;
    const centerY = 140;
    const radius = 90;
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
          title={hasMinimumCriteria ? '' : 'Se requieren al menos 3 criterios para generar el gráfico de radar'}
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
          
          let buttonTitle = '';
          if (cannotDeselect) {
            buttonTitle = 'Mínimo 3 criterios';
          } else if (isDisabled) {
            buttonTitle = 'Máximo 6 criterios';
          }
          
          return (
            <button
              key={criterion.criterion_name}
              onClick={() => toggleCriterionForRadar(index)}
              disabled={isDisabled || cannotDeselect}
              className={`criterion-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              title={buttonTitle}
            >
              {criterion.criterion_name}
            </button>
          );
        })}
      </div>

      {/* SVG Radar Chart */}
      <div className="radar-content">
        <svg viewBox="0 0 280 280" className="radar-svg">
          {/* Grid circles */}
          {[20, 40, 60, 80, 100].map((percentage) => (
            <circle
              key={`grid-${percentage}`}
              cx="140"
              cy="140"
              r={(90 * percentage) / 100}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Axes lines */}
          {radarPoints.map((point) => (
            <line
              key={`axis-${point.label}`}
              x1="140"
              y1="140"
              x2={140 + 90 * Math.cos(point.angle)}
              y2={140 + 90 * Math.sin(point.angle)}
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
          {radarPoints.map((point) => (
            <g key={`point-${point.label}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#4E5EA3"
                stroke="white"
                strokeWidth="2"
              />
              <title>{`${point.label}: ${point.score.toFixed(1)}%`}</title>
            </g>
          ))}
          
          {/* Labels */}
          {radarPoints.map((point) => {
            const labelRadius = 115;
            const labelX = 140 + labelRadius * Math.cos(point.angle);
            const labelY = 140 + labelRadius * Math.sin(point.angle);
            
            let textAnchor: 'start' | 'middle' | 'end';
            if (Math.abs(labelX - 140) < 5) {
              textAnchor = 'middle';
            } else if (labelX > 140) {
              textAnchor = 'start';
            } else {
              textAnchor = 'end';
            }
            
            // Dividir en palabras para multi-línea
            const words = point.label.split(' ');
            const lines: string[] = [];
            let currentLine = '';
            
            words.forEach((word, idx) => {
              if (idx === 0) {
                currentLine = word;
              } else {
                const testLine = `${currentLine} ${word}`;
                // Máximo 15 caracteres por línea
                if (testLine.length <= 15) {
                  currentLine = testLine;
                } else {
                  lines.push(currentLine);
                  currentLine = word;
                }
              }
            });
            if (currentLine) lines.push(currentLine);
            
            // Ajustar posición Y para centrar texto multi-línea
            const lineHeight = 11;
            const totalHeight = lines.length * lineHeight;
            const startY = labelY - (totalHeight / 2) + (lineHeight / 2);
            
            return (
              <text
                key={`label-${point.label}`}
                textAnchor={textAnchor}
                fontSize="10"
                fill="#1f2937"
                fontWeight="600"
                className="radar-label"
              >
                {lines.map((line, i) => (
                  <tspan
                    key={i}
                    x={labelX}
                    y={startY + (i * lineHeight)}
                  >
                    {line}
                  </tspan>
                ))}
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
