'use client';

import { useState } from 'react';
import type { EvaluationReport } from '@/api/reports/reports.types';
import { getScoreColor } from '@/lib/shared/formatters';
import '@/styles/reports/charts-section.css';

interface Props {
  report: EvaluationReport;
}

export function ChartsSection({ report }: Readonly<Props>) {
  const [showAllCriteria, setShowAllCriteria] = useState(false);
  
  // Helper function to get importance label
  const getImportanceLabel = (level: string): string => {
    if (level === 'A') return 'Alta';
    if (level === 'M') return 'Media';
    if (level === 'B') return 'Baja';
    return 'N/A';
  };
  
  // Calcular datos para gráficos
  const criteriaScores = report.criteria_results.map(c => ({
    name: c.criterion_name,
    score: c.final_score,
    importance: c.importance_level
  })).sort((a, b) => b.score - a.score);

  // Mostrar solo los primeros 5 criterios por defecto
  const displayedCriteria = showAllCriteria ? criteriaScores : criteriaScores.slice(0, 5);
  const hasMoreCriteria = criteriaScores.length > 5;

  // Calcular peso acumulado por nivel de importancia
  const importanceWeights = report.criteria_results.reduce((acc, c) => {
    const level = c.importance_level;
    acc[level] = (acc[level] || 0) + c.importance_percentage;
    return acc;
  }, {} as Record<string, number>);

  // Calcular score promedio por nivel de importancia
  const importanceScores = report.criteria_results.reduce((acc, c) => {
    const level = c.importance_level;
    if (!acc[level]) {
      acc[level] = { totalScore: 0, count: 0, weight: 0 };
    }
    acc[level].totalScore += c.final_score;
    acc[level].count += 1;
    acc[level].weight += c.importance_percentage;
    return acc;
  }, {} as Record<string, { totalScore: number; count: number; weight: number }>);

  const getImportanceColor = (level: string) => {
    switch (level) {
      case 'A': return '#dc2626';
      case 'M': return '#f59e0b';
      case 'B': return '#3b82f6';
      case 'NA': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="charts-section">
      <h3 className="section-title">Análisis Visual</h3>

      <div className="charts-grid">
        {/* Gráfico de Barras Horizontales - Comparación de Criterios */}
        <div className="chart-card chart-card--full">
          <div className="chart-header">
            <h4 className="chart-title">Puntuación por Criterio</h4>
            <p className="chart-subtitle">Comparación de todos los criterios evaluados</p>
          </div>
          <div className="horizontal-bar-chart">
            {displayedCriteria.map((criterion) => (
              <div key={criterion.name} className="bar-row">
                <div className="bar-label">
                  <span className="bar-name">{criterion.name}</span>
                  <span className="bar-score">{criterion.score.toFixed(1)}</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${(criterion.score / 10) * 100}%`,
                      background: getScoreColor(criterion.score)
                    }}
                  >
                    <div className="bar-shine"></div>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMoreCriteria && (
              <button 
                className="show-more-btn"
                onClick={() => setShowAllCriteria(!showAllCriteria)}
              >
                {showAllCriteria ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Ver todos los criterios ({criteriaScores.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Gráfico de DONA - Distribución de Importancia */}
        <div className="chart-card donut-card">
          <div className="chart-header">
            <h4 className="chart-title">Distribución de Importancia</h4>
            <p className="chart-subtitle">Peso relativo por nivel de importancia</p>
          </div>
          <div className="donut-chart-container">
            <svg viewBox="0 0 200 200" className="donut-svg">
              {(() => {
                const centerX = 100;
                const centerY = 100;
                const radius = 60;
                const innerRadius = 40;
                
                // Filtrar niveles con peso > 0
                const filteredWeights = Object.entries(importanceWeights)
                  .filter(([, weight]) => weight > 0)
                  .map(([level, weight]) => ({
                    level,
                    weight,
                    percentage: weight,
                    color: getImportanceColor(level),
                    label: getImportanceLabel(level),
                    score: importanceScores[level] ? importanceScores[level].totalScore / importanceScores[level].count : 0
                  }));

                // Caso especial: solo un nivel de importancia (100%)
                if (filteredWeights.length === 1 && filteredWeights[0]) {
                  const item = filteredWeights[0];
                  return (
                    <g>
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        fill={item.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={innerRadius}
                        fill="white"
                      />
                      <title>{`${item.label}: ${item.percentage.toFixed(1)}% (Score: ${item.score.toFixed(1)})`}</title>
                    </g>
                  );
                }

                let currentAngle = -90; // Empezar desde arriba
                
                return filteredWeights.map((item) => {
                  const angle = (item.percentage / 100) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  // Convertir ángulos a radianes
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  // Calcular puntos del arco exterior
                  const x1 = centerX + radius * Math.cos(startRad);
                  const y1 = centerY + radius * Math.sin(startRad);
                  const x2 = centerX + radius * Math.cos(endRad);
                  const y2 = centerY + radius * Math.sin(endRad);
                  
                  // Calcular puntos del arco interior
                  const x3 = centerX + innerRadius * Math.cos(endRad);
                  const y3 = centerY + innerRadius * Math.sin(endRad);
                  const x4 = centerX + innerRadius * Math.cos(startRad);
                  const y4 = centerY + innerRadius * Math.sin(startRad);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                    'Z'
                  ].join(' ');
                  
                  currentAngle = endAngle;
                  
                  return (
                    <g key={item.label}>
                      <path
                        d={pathData}
                        fill={item.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <title>{`${item.label}: ${item.percentage.toFixed(1)}% (Score: ${item.score.toFixed(1)})`}</title>
                    </g>
                  );
                });
              })()}
              
              {/* Centro del donut con score total */}
              <circle cx="100" cy="100" r="38" fill="white" />
              <text x="100" y="95" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1f2937">
                {report.final_score.toFixed(1)}
              </text>
              <text x="100" y="110" textAnchor="middle" fontSize="10" fill="#6b7280">
                Score Total
              </text>
            </svg>
            
            {/* Leyenda */}
            <div className="donut-legend">
              {Object.entries(importanceWeights)
                .filter(([, weight]) => weight > 0)
                .map(([level, weight]) => {
                const levelLabel = getImportanceLabel(level);
                const avgScore = importanceScores[level] ? importanceScores[level].totalScore / importanceScores[level].count : 0;
                
                return (
                  <div key={level} className="donut-legend-item">
                    <div 
                      className="donut-color-indicator"
                      style={{ backgroundColor: getImportanceColor(level) }}
                    ></div>
                    <div className="donut-legend-text">
                      <span className="donut-legend-label">{levelLabel}</span>
                      <span className="donut-legend-value">{weight.toFixed(1)}%</span>
                      <span className="donut-legend-score">Score: {avgScore.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Indicador de Cumplimiento del Proyecto */}
        <div className="chart-card">
          <div className="chart-header">
            <h4 className="chart-title">Puntuación de la Evaluación</h4>
            <p className="chart-subtitle">Resultado obtenido en la evaluación</p>
          </div>
          <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 200 120">
              {/* Background arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                strokeLinecap="round"
              />
              {/* Score arc */}
              <path
                d="M 30 100 A 70 70 0 0 1 170 100"
                fill="none"
                stroke={getScoreColor(report.final_score)}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${(report.final_score / 10) * 220} 220`}
                className="gauge-arc"
              />
            </svg>
            <div className="gauge-info">
              <div className="gauge-score" style={{ color: getScoreColor(report.final_score) }}>
                {report.final_score.toFixed(1)}
              </div>
              <div className="gauge-label">Puntuación Final</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
