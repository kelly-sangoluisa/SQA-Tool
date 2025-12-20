'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ScoreGauge } from '@/components/reports/ScoreGauge';
import { CriterionCard } from '@/components/reports/CriterionCard';
import { CriterionAccordion } from '@/components/reports/CriterionAccordion';
import { ChartsSection } from '@/components/reports/ChartsSection';
import { StatsOverview } from '@/components/reports/StatsOverview';
import { getEvaluationReport, getEvaluationStats } from '@/api/reports/reports.api';
import type { EvaluationReport, EvaluationStats } from '@/api/reports/reports.types';
import { generateEvaluationPDF } from '@/utils/pdfGenerator';
import { formatDate } from '@/lib/shared/formatters';
import '@/styles/reports/evaluation-detail.css';

function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = Number(params.id);
  const isValidEvaluationId = !Number.isNaN(evaluationId) && evaluationId > 0;

  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'stats'>('overview');
  const [showAllCriteria, setShowAllCriteria] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reportData, statsData] = await Promise.all([
        getEvaluationReport(evaluationId),
        getEvaluationStats(evaluationId)
      ]);
      
      setReport(reportData);
      setStats(statsData);
    } catch {
      setError('Error al cargar los resultados. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    if (!isValidEvaluationId) {
      setError('ID de evaluación inválido');
      setLoading(false);
      return;
    }
    loadData().catch(() => {
      // Error handled in loadData
    });
  }, [evaluationId, isValidEvaluationId, loadData]);

  const handleExportPDF = async () => {
    if (!report || !stats) return;

    try {
      setIsExporting(true);
      
      // Detectar si el radar está expandido ANTES de cambiar de tab
      const radarWrapper = document.querySelector('.radar-chart-wrapper') as HTMLElement;
      const isRadarExpanded = radarWrapper && 
                             radarWrapper.offsetParent !== null && 
                             radarWrapper.offsetHeight > 100;
      
      // Si el radar está expandido, capturarlo ahora antes de cambiar de tab
      let radarImageData: string | null = null;
      if (isRadarExpanded) {
        const html2canvas = (await import('html2canvas')).default;
        const radarCanvas = await html2canvas(radarWrapper, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        radarImageData = radarCanvas.toDataURL('image/png', 1);
      }
      
      // Cambiar a overview para que los gráficos se rendericen
      if (activeTab !== 'overview') {
        setActiveTab('overview');
        // Esperar a que React renderice el nuevo tab
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      await generateEvaluationPDF({ report, stats, radarImageData });
    } catch {
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando resultados...</p>
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
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="page-header">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', onClick: () => router.push('/dashboard') },
            { label: 'Proyectos', onClick: () => router.push('/results') },
            { label: report.project_name, onClick: () => router.push(`/results/project/${report.project_id}`) },
            { label: report.standard_name, isActive: true }
          ]}
        />
        
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">{report.standard_name}</h1>
            <p className="page-subtitle">{report.project_name}</p>
            <p className="page-date">{formatDate(report.created_at)}</p>
          </div>
          
          <div className="header-actions">
            <div className="export-section">
              <button 
                className="export-pdf-btn"
                onClick={() => { handleExportPDF().catch(() => {}); }}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Exportar PDF
                  </>
                )}
              </button>
            </div>
            
            <div className="header-score">
              <ScoreGauge score={report.final_score} size="medium" />
            </div>
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
                {(showAllCriteria ? report.criteria_results : report.criteria_results.slice(0, 3)).map((criterion) => (
                  <CriterionCard key={criterion.criterion_name} criterion={criterion} />
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
              </div>
            </div>

            <div className="criteria-section">
              <h3 className="section-title">Desglose por Criterio y Métrica</h3>
              <p className="section-subtitle">Expandir cada criterio para ver el detalle de sus métricas, variables y cálculos</p>
              <div className="accordion-list">
                {report.criteria_results.map((criterion, index) => (
                  <CriterionAccordion key={criterion.criterion_name} criterion={criterion} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-content">
            <StatsOverview stats={stats} report={report} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvaluationDetailPageWrapper() {
  return (
    <ProtectedRoute requiredRole="any">
      <EvaluationDetailPage />
    </ProtectedRoute>
  );
}
