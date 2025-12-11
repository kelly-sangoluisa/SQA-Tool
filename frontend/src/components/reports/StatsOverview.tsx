'use client';

import type { EvaluationStats } from '@/api/reports/reports.types';

interface StatsOverviewProps {
  stats: EvaluationStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="stats-overview">
      {/* Tarjetas de estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_criteria}</div>
            <div className="stat-label">Criterios Evaluados</div>
          </div>
        </div>

        <div className="stat-card stat-card--secondary">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_metrics}</div>
            <div className="stat-label">Métricas Analizadas</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.average_criteria_score.toFixed(1)}</div>
            <div className="stat-label">Promedio General</div>
          </div>
        </div>
      </div>

      {/* Mejor y Peor Criterio */}
      <div className="comparison-grid">
        <div className="comparison-card comparison-card--best">
          <div className="comparison-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3l2.5 5.5L18 9.5l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1L10 3z" fill="currentColor"/>
            </svg>
            <h4>Mejor Criterio</h4>
          </div>
          <p className="comparison-name">{stats.best_criterion.name}</p>
          <div className="comparison-score">{stats.best_criterion.score.toFixed(1)}</div>
        </div>

        <div className="comparison-card comparison-card--worst">
          <div className="comparison-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18l-2.5-5.5L2 11.5l4-4-1-6 5 3 5-3-1 6 4 4-5.5 1L10 18z" fill="currentColor"/>
            </svg>
            <h4>Área de Mejora</h4>
          </div>
          <p className="comparison-name">{stats.worst_criterion.name}</p>
          <div className="comparison-score">{stats.worst_criterion.score.toFixed(1)}</div>
        </div>
      </div>

      {/* Distribución por Importancia */}
      <div className="importance-section">
        <h4 className="importance-title">Puntuación por Nivel de Importancia</h4>
        <div className="importance-bars">
          {stats.score_by_importance.high > 0 && (
            <div className="importance-bar">
              <div className="bar-header">
                <span className="bar-label">Alta Importancia</span>
                <span className="bar-value">{stats.score_by_importance.high.toFixed(1)}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill bar-fill--high"
                  style={{ width: `${stats.score_by_importance.high}%` }}
                />
              </div>
            </div>
          )}

          {stats.score_by_importance.medium > 0 && (
            <div className="importance-bar">
              <div className="bar-header">
                <span className="bar-label">Importancia Media</span>
                <span className="bar-value">{stats.score_by_importance.medium.toFixed(1)}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill bar-fill--medium"
                  style={{ width: `${stats.score_by_importance.medium}%` }}
                />
              </div>
            </div>
          )}

          {stats.score_by_importance.low > 0 && (
            <div className="importance-bar">
              <div className="bar-header">
                <span className="bar-label">Baja Importancia</span>
                <span className="bar-value">{stats.score_by_importance.low.toFixed(1)}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill bar-fill--low"
                  style={{ width: `${stats.score_by_importance.low}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .stats-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          border: 1px solid rgba(78, 94, 163, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.16);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card--primary .stat-icon {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
        }

        .stat-card--secondary .stat-icon {
          background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-5));
          color: white;
        }

        .stat-card--success .stat-icon {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-primary-dark);
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .comparison-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          border: 2px solid;
        }

        .comparison-card--best {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, white 100%);
        }

        .comparison-card--worst {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, white 100%);
        }

        .comparison-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .comparison-card--best .comparison-header {
          color: #10b981;
        }

        .comparison-card--worst .comparison-header {
          color: #f59e0b;
        }

        .comparison-header h4 {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .comparison-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.75rem 0;
        }

        .comparison-score {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .comparison-card--best .comparison-score {
          color: #10b981;
        }

        .comparison-card--worst .comparison-score {
          color: #f59e0b;
        }

        .importance-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          border: 1px solid rgba(78, 94, 163, 0.1);
        }

        .importance-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 1.5rem 0;
        }

        .importance-bars {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .importance-bar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bar-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary-dark);
        }

        .bar-value {
          font-size: 0.875rem;
          font-weight: 800;
          color: var(--color-primary);
        }

        .bar-container {
          height: 12px;
          background: #f1f5f9;
          border-radius: 24px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 24px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bar-fill--high {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .bar-fill--medium {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }

        .bar-fill--low {
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }
      `}</style>
    </div>
  );
}
