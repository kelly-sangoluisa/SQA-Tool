'use client';

import type { EvaluationStats, EvaluationReport } from '@/api/reports/reports.types';
import { RadarChart } from './RadarChart';
import { FaClipboardList, FaChartBar, FaArrowUp, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import '@/styles/reports/stats-overview.css';

interface StatsOverviewProps {
  stats: EvaluationStats;
  report: EvaluationReport;
}

export function StatsOverview({ stats, report }: Readonly<StatsOverviewProps>) {
  return (
    <div className="stats-overview">
      {/* Tarjetas de estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-icon">
            <FaClipboardList size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_criteria}</div>
            <div className="stat-label">Criterios Evaluados</div>
          </div>
        </div>

        <div className="stat-card stat-card--secondary">
          <div className="stat-icon">
            <FaChartBar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_metrics}</div>
            <div className="stat-label">Métricas Analizadas</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-icon">
            <FaArrowUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.average_criteria_score.toFixed(1)}</div>
            <div className="stat-label">Promedio General</div>
          </div>
        </div>
      </div>

      {/* Mejor y Peor Criterio - Solo mostrar si son diferentes */}
      {stats.best_criterion.name === stats.worst_criterion.name ? (
        <div className="comparison-grid">
          <div className="comparison-card comparison-card--single">
            <div className="comparison-header">
              <FaStar size={20} />
              <h4>Criterio Evaluado</h4>
            </div>
            <p className="comparison-name">{stats.best_criterion?.name || 'N/A'}</p>
            <div className="comparison-score">{stats.best_criterion?.score?.toFixed(1) || '0.0'}</div>
          </div>
        </div>
      ) : (
        <div className="comparison-grid">
          <div className="comparison-card comparison-card--best">
            <div className="comparison-header">
              <FaStar size={20} />
              <h4>Mejor Criterio</h4>
            </div>
            <p className="comparison-name">{stats.best_criterion?.name || 'N/A'}</p>
            <div className="comparison-score">{stats.best_criterion?.score?.toFixed(1) || '0.0'}</div>
          </div>

          <div className="comparison-card comparison-card--worst">
            <div className="comparison-header">
              <FaExclamationTriangle size={20} />
              <h4>Área de Mejora</h4>
            </div>
            <p className="comparison-name">{stats.worst_criterion?.name || 'N/A'}</p>
            <div className="comparison-score">{stats.worst_criterion?.score?.toFixed(1) || '0.0'}</div>
          </div>
        </div>
      )}

      {/* Distribución por Importancia */}
      <div className="importance-section">
        <h4 className="importance-title">Puntuación por Nivel de Importancia</h4>
        <div className="importance-bars">
          {(stats.score_by_importance?.high || 0) > 0 && (
            <div className="importance-bar">
              <div className="bar-header">
                <span className="bar-label">Alta Importancia</span>
                <span className="bar-value">{stats.score_by_importance?.high?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill bar-fill--high"
                  style={{ width: `${stats.score_by_importance?.high || 0}%` }}
                />
              </div>
            </div>
          )}

          {(stats.score_by_importance?.medium || 0) > 0 && (
            <div className="importance-bar">
              <div className="bar-header">
                <span className="bar-label">Importancia Media</span>
                <span className="bar-value">{stats.score_by_importance?.medium?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill bar-fill--medium"
                  style={{ width: `${stats.score_by_importance?.medium || 0}%` }}
                />
              </div>
            </div>
          )}

          {(stats.score_by_importance?.low || 0) > 0 && (
            <div className="importance-bar">
              <div className="bar-header">
                <span className="bar-label">Baja Importancia</span>
                <span className="bar-value">{stats.score_by_importance?.low?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill bar-fill--low"
                  style={{ width: `${stats.score_by_importance?.low || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Radar - Activable por el usuario */}
      <RadarChart report={report} />
    </div>
  );
}
