'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ScoreGauge } from '@/components/reports/ScoreGauge';
import { CriterionCard } from '@/components/reports/CriterionCard';
import { CriterionAccordion } from '@/components/reports/CriterionAccordion';
import { ChartsSection } from '@/components/reports/ChartsSection';
import { StatsOverview } from '@/components/reports/StatsOverview';
import { getEvaluationReport, getEvaluationStats } from '@/api/reports/reports.api';
import type { EvaluationReport, EvaluationStats } from '@/api/reports/reports.types';

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = Number(params.id);

  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'stats'>('overview');
  const [showAllCriteria, setShowAllCriteria] = useState(false);

  useEffect(() => {
    if (evaluationId) {
      loadData();
    }
  }, [evaluationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reportData, statsData] = await Promise.all([
        getEvaluationReport(evaluationId),
        getEvaluationStats(evaluationId)
      ]);
      
      setReport(reportData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los resultados. Por favor intenta de nuevo.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando resultados...</p>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }
          .loader {
            width: 64px;
            height: 64px;
            border: 6px solid #f1f5f9;
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            margin-top: 1rem;
            color: #6b7280;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  if (error || !report || !stats) {
    return (
      <div className="error-container">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>Error al cargar</h2>
        <p>{error || 'No se encontraron los resultados'}</p>
        <button onClick={() => router.push('/results')} className="back-btn">
          Volver a Resultados
        </button>
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 2rem;
            text-align: center;
          }
          svg {
            color: #ef4444;
            margin-bottom: 1rem;
          }
          h2 {
            color: var(--color-primary-dark);
            margin: 0 0 0.5rem 0;
          }
          p {
            color: #6b7280;
            margin: 0 0 1.5rem 0;
          }
          .back-btn {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(78, 94, 163, 0.25);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => router.push('/results')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>
        
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">{report.project_name}</h1>
            <p className="page-subtitle">{report.standard_name}</p>
            <p className="page-date">{formatDate(report.created_at)}</p>
            
            {/* Threshold Indicator */}
            <div className={`threshold-badge ${report.meets_threshold ? 'threshold-badge--success' : 'threshold-badge--warning'}`}>
              {report.meets_threshold ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Cumple con el umbral del proyecto ({report.project_threshold}%)
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  No cumple con el umbral del proyecto ({report.project_threshold}%)
                </>
              )}
            </div>
          </div>
          
          <div className="header-score">
            <ScoreGauge score={report.final_score} size="medium" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" fill="currentColor"/>
            </svg>
            Resumen
          </button>
          <button
            className={`tab ${activeTab === 'details' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" fill="currentColor"/>
            </svg>
            Detalles
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" fill="currentColor"/>
            </svg>
            Estadísticas
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-container">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="conclusion-card">
              <h3 className="conclusion-title">Conclusión</h3>
              <p className="conclusion-text">{report.conclusion || 'Sin conclusión disponible'}</p>
            </div>

            <div className="quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-icon quick-stat-icon--primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="quick-stat-value">{stats.total_criteria}</div>
                  <div className="quick-stat-label">Criterios</div>
                </div>
              </div>

              <div className="quick-stat">
                <div className="quick-stat-icon quick-stat-icon--secondary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="quick-stat-value">{stats.total_metrics}</div>
                  <div className="quick-stat-label">Métricas</div>
                </div>
              </div>

              <div className="quick-stat">
                <div className="quick-stat-icon quick-stat-icon--success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="quick-stat-value">{stats.average_criteria_score.toFixed(1)}</div>
                  <div className="quick-stat-label">Promedio</div>
                </div>
              </div>
            </div>

            {/* Gráficos Visuales */}
            <ChartsSection report={report} />

            {/* Resultados por Criterio */}
            <div className="criteria-section">
              <h3 className="section-title">Resultados por Criterio</h3>
              <div className="criteria-grid">
                {(showAllCriteria ? report.criteria_results : report.criteria_results.slice(0, 3)).map((criterion, index) => (
                  <CriterionCard key={index} criterion={criterion} />
                ))}
              </div>
              
              {report.criteria_results.length > 3 && (
                <button 
                  className="show-more-criteria-btn"
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
                      Ver todos los criterios ({report.criteria_results.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-content">
            <div className="details-section">
              <h3 className="section-title">Información General</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Proyecto:</span>
                  <span className="detail-value">{report.project_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estándar:</span>
                  <span className="detail-value">{report.standard_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha de Evaluación:</span>
                  <span className="detail-value">{formatDate(report.created_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Puntuación Final:</span>
                  <span className="detail-value detail-value--score">{report.final_score.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Umbral del Proyecto:</span>
                  <span className="detail-value">{report.project_threshold}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className={`detail-value ${report.meets_threshold ? 'detail-value--success' : 'detail-value--warning'}`}>
                    {report.meets_threshold ? 'Aprobado' : 'No Cumple'}
                  </span>
                </div>
              </div>
            </div>

            <div className="criteria-section">
              <h3 className="section-title">Desglose por Criterio y Métrica</h3>
              <p className="section-subtitle">Expandir cada criterio para ver el detalle de sus métricas, variables y cálculos</p>
              <div className="accordion-list">
                {report.criteria_results.map((criterion, index) => (
                  <CriterionAccordion key={index} criterion={criterion} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-content">
            <StatsOverview stats={stats} />
          </div>
        )}
      </div>

      <style jsx>{`
        .detail-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
        }

        .page-header {
          max-width: 1200px;
          margin: 0 auto 2rem;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: var(--color-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }

        .back-button:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.15);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.12);
        }

        .header-info {
          flex: 1;
        }

        .page-title {
          font-size: clamp(1.25rem, 2.5vw, 1.75rem);
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.375rem 0;
        }

        .page-subtitle {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0 0 0.25rem 0;
        }

        .page-date {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .tabs-container {
          max-width: 1200px;
          margin: 0 auto 2rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.08);
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab:hover {
          background: #f8fafc;
          color: var(--color-primary);
        }

        .tab--active {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.25);
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tab-content {
          animation: fadeIn 0.4s ease;
        }

        .conclusion-card {
          background: white;
          padding: 1.25rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          margin-bottom: 1.5rem;
        }

        .conclusion-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.75rem 0;
        }

        .conclusion-text {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #4b5563;
          margin: 0;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .quick-stat {
          background: white;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.08);
        }

        .quick-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
        }

        .quick-stat-icon--primary {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        }

        .quick-stat-icon--secondary {
          background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-5));
        }

        .quick-stat-icon--success {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .quick-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          line-height: 1;
        }

        .quick-stat-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 1rem 0;
        }

        .criteria-grid,
        .criteria-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .details-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          margin-bottom: 2rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .detail-value--score {
          font-size: 1.5rem;
          color: var(--color-primary);
        }

        .detail-value--success {
          color: #10b981;
        }

        .detail-value--warning {
          color: #f59e0b;
        }

        .threshold-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.75rem;
        }

        .threshold-badge--success {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .threshold-badge--warning {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .criterion-detail-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          margin-bottom: 1.5rem;
        }

        .criterion-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .criterion-detail-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        .criterion-detail-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .criterion-detail-score {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .criterion-score-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .criterion-score-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }

        .metric-detail-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          border-left: 4px solid var(--color-primary);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .metric-info {
          flex: 1;
        }

        .metric-name-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .metric-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0;
        }

        .metric-code {
          padding: 0.25rem 0.625rem;
          background: var(--color-primary);
          color: white;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .metric-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .metric-threshold-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .metric-threshold-badge--success {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .metric-threshold-badge--warning {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .metric-formula {
          background: white;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .formula-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary-dark);
          flex-shrink: 0;
        }

        .formula-code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #4b5563;
          background: #f9fafb;
          padding: 0.375rem 0.625rem;
          border-radius: 6px;
          flex: 1;
        }

        .variables-section {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
        }

        .variables-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .variables-grid {
          display: grid;
          gap: 0.75rem;
        }

        .variable-item {
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

        .variable-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .variable-description {
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

        .metric-values {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .metric-value-item {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .metric-value-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .metric-value-number--highlight {
          color: var(--color-primary);
          font-size: 1.25rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        .section-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .accordion-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .criteria-section {
          margin-top: 2rem;
        }

        .criteria-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .show-more-criteria-btn {
          width: 100%;
          padding: 0.875rem;
          margin-top: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .show-more-criteria-btn:hover {
          background: white;
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.15);
        }

        .show-more-criteria-btn svg {
          transition: transform 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .detail-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .tabs {
            flex-direction: column;
          }

          .tab {
            justify-content: flex-start;
          }

          .metric-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .metric-threshold-badge {
            align-self: flex-start;
          }

          .criterion-detail-header {
            flex-direction: column;
            gap: 1rem;
          }

          .criterion-detail-score {
            align-items: flex-start;
          }

          .variable-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
