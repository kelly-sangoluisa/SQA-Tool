'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ScoreGauge } from '@/components/reports/ScoreGauge';
import { EvaluationCard } from '@/components/reports/EvaluationCard';
import { AIAnalysisDisplay } from '@/components/reports/AIAnalysisDisplay';
import { getProjectReport, getProjectStats } from '@/api/reports/reports.api';
import type { ProjectReport, ProjectStats } from '@/api/reports/reports.types';
import { generateProjectPDF } from '@/utils/projectPDFGenerator';
import { formatDate } from '@/lib/shared/formatters';
import { useAIAnalysis } from '@/hooks/shared/useAIAnalysis';
import '@/styles/reports/project-report.css';
import { 
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineLightBulb,
  HiExclamation,
  HiOutlineCalendar
} from 'react-icons/hi';

function ProjectReportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const isValidProjectId = !Number.isNaN(projectId) && projectId > 0;

  const [report, setReport] = useState<ProjectReport | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [includeCertificate, setIncludeCertificate] = useState(true);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    general: false,
    strengths: false,
    weaknesses: false,
    recommendations: false,
    risks: false,
    nextSteps: false,
  });

  // AI Analysis
  const { analysis, loading: aiLoading, error: aiError, analyzeProject, clearAnalysis } = useAIAnalysis();

  useEffect(() => {
    if (!isValidProjectId) {
      setError('ID de proyecto inválido');
      setLoading(false);
      return;
    }
    loadData().catch(() => {
      // Error handled in loadData
    });
  }, [projectId, isValidProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reportData, statsData] = await Promise.all([
        getProjectReport(projectId),
        getProjectStats(projectId)
      ]);
      
      setReport(reportData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los resultados del proyecto. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!report || !stats) return;

    try {
      setIsExporting(true);
      await generateProjectPDF({ 
        report, 
        stats, 
        includeCertificate,
        aiAnalysis: analysis,
        selectedAISections: selectedSections
      });
    } catch {
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!projectId) return;

    try {
      await analyzeProject(projectId);
    } catch {
      // Error already handled in hook
    }
  };

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando resultados del proyecto...</p>
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
        <p>{error || 'No se encontraron los resultados del proyecto'}</p>
        <button onClick={() => router.push('/results')} className="back-btn">
          Volver a Resultados
        </button>
      </div>
    );
  }

  return (
    <div className="project-report-page">
      {/* Header */}
      <div className="page-header">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', onClick: () => router.push('/dashboard') },
            { label: 'Proyectos', onClick: () => router.push('/results') },
            { label: report.project_name, onClick: () => router.push(`/results/project/${report.project_id}`) },
            { label: 'Reporte', isActive: true }
          ]}
        />
        
        <div className="header-content">
          <div className="header-info">
            <h1 className="page-title">{report.project_name}</h1>
            {report.project_description && (
              <p className="page-subtitle">{report.project_description}</p>
            )}
            <p className="page-date">{formatDate(report.created_at)}</p>
            
            <div className={`status-badge ${report.meets_threshold ? 'status-badge--success' : 'status-badge--warning'}`}>
              {report.meets_threshold ? (
                <>
                  <HiOutlineCheckCircle size={20} />
                  Proyecto Aprobado (Umbral: {report.minimum_threshold}%)
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  Proyecto No Aprobado (Umbral: {report.minimum_threshold}%)
                </>
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <div className="export-section">
              <div className="actions-grid">
                <button 
                  className="ai-analysis-btn"
                  onClick={() => { handleAIAnalysis().catch(() => {}); }}
                  disabled={aiLoading}
                  title="Generar análisis inteligente con IA"
                >
                  {aiLoading ? (
                    <>
                      <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                      </svg>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Analizar con IA
                    </>
                  )}
                </button>

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

                {analysis && (
                  <button 
                    className="add-to-pdf-btn"
                    onClick={() => setShowPDFModal(true)}
                    title="Configurar secciones del análisis IA para incluir en el PDF"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Añadir al PDF
                  </button>
                )}
                
                {report.meets_threshold && (
                  <label className="certificate-checkbox">
                    <input
                      type="checkbox"
                      checked={includeCertificate}
                      onChange={(e) => setIncludeCertificate(e.target.checked)}
                      disabled={isExporting}
                    />
                    <span>Incluir Certificado</span>
                  </label>
                )}
              </div>
            </div>
            
            <div className="header-score">
              <ScoreGauge 
                score={typeof report.final_project_score === 'number' && !isNaN(report.final_project_score) ? report.final_project_score : 0} 
                size="medium"
                threshold={report.minimum_threshold}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon stat-icon--primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.total_evaluations}</div>
            <div className="stat-label">Evaluaciones Total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.completed_evaluations}</div>
            <div className="stat-label">Completadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">
              {typeof stats.average_evaluation_score === 'number' && !isNaN(stats.average_evaluation_score) 
                ? stats.average_evaluation_score.toFixed(1) 
                : '0.0'}
            </div>
            <div className="stat-label">Promedio</div>
          </div>
        </div>

        {stats.completed_evaluations > 0 && stats.highest_evaluation && stats.highest_evaluation.standard_name !== 'N/A' && (
          <>
            {/* Si solo hay 1 evaluación, mostrar solo "Mejor" si aprobó o "Menor" si no aprobó */}
            {stats.completed_evaluations === 1 ? (
              <>
                {report.meets_threshold ? (
                  <div className="stat-card">
                    <div className="stat-icon stat-icon--success">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="stat-value">{stats.highest_evaluation?.score?.toFixed(1) || '0.0'}</div>
                      <div className="stat-label">Mejor: {stats.highest_evaluation?.standard_name || 'N/A'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="stat-card">
                    <div className="stat-icon stat-icon--warning">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="stat-value">{stats.lowest_evaluation?.score?.toFixed(1) || '0.0'}</div>
                      <div className="stat-label">Menor: {stats.lowest_evaluation?.standard_name || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Si hay 2 o más evaluaciones, mostrar ambos */
              <>
                <div className="stat-card">
                  <div className="stat-icon stat-icon--success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.highest_evaluation?.score?.toFixed(1) || '0.0'}</div>
                    <div className="stat-label">Mejor: {stats.highest_evaluation?.standard_name || 'N/A'}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon--warning">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.lowest_evaluation?.score?.toFixed(1) || '0.0'}</div>
                    <div className="stat-label">Menor: {stats.lowest_evaluation?.standard_name || 'N/A'}</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* AI Analysis Section */}
      {aiError && (
        <div className="ai-error-banner">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{aiError}</span>
          <button onClick={() => { handleAIAnalysis().catch(() => {}); }} className="retry-btn-inline">
            Reintentar
          </button>
        </div>
      )}

      {analysis && (
        <AIAnalysisDisplay analysis={analysis} onClose={clearAnalysis} />
      )}

      {/* Modal para seleccionar secciones del análisis IA */}
      {showPDFModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowPDFModal(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowPDFModal(false); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="modal-header">
              <h3 id="modal-title">Seleccionar Secciones del Análisis IA para PDF</h3>
              <button className="modal-close-btn" onClick={() => setShowPDFModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">
                Selecciona las secciones del análisis de IA que deseas incluir en el reporte PDF:
              </p>
              
              <div className="checkbox-list">
                <label className="checkbox-item" htmlFor="section-general">
                  <input
                    id="section-general"
                    type="checkbox"
                    checked={selectedSections.general}
                    onChange={() => toggleSection('general')}
                    aria-label="Análisis General"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-icon"><HiOutlineDocumentText size={24} /></span>
                    <div>
                      <div className="checkbox-title">Análisis General</div>
                      <div className="checkbox-subtitle">Evaluación comprensiva del estado actual</div>
                    </div>
                  </div>
                </label>

                <label className="checkbox-item" htmlFor="section-strengths">
                  <input
                    id="section-strengths"
                    type="checkbox"
                    checked={selectedSections.strengths}
                    onChange={() => toggleSection('strengths')}
                    aria-label="Fortalezas"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-icon"><HiOutlineCheckCircle size={24} /></span>
                    <div>
                      <div className="checkbox-title">Fortalezas</div>
                      <div className="checkbox-subtitle">Aspectos positivos identificados</div>
                    </div>
                  </div>
                </label>

                <label className="checkbox-item" htmlFor="section-weaknesses">
                  <input
                    id="section-weaknesses"
                    type="checkbox"
                    checked={selectedSections.weaknesses}
                    onChange={() => toggleSection('weaknesses')}
                    aria-label="Áreas de Mejora"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-icon"><HiOutlineExclamationCircle size={24} /></span>
                    <div>
                      <div className="checkbox-title">Áreas de Mejora</div>
                      <div className="checkbox-subtitle">Debilidades y oportunidades</div>
                    </div>
                  </div>
                </label>

                <label className="checkbox-item" htmlFor="section-recommendations">
                  <input
                    id="section-recommendations"
                    type="checkbox"
                    checked={selectedSections.recommendations}
                    onChange={() => toggleSection('recommendations')}
                    aria-label="Recomendaciones"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-icon"><HiOutlineLightBulb size={24} /></span>
                    <div>
                      <div className="checkbox-title">Recomendaciones</div>
                      <div className="checkbox-subtitle">Sugerencias priorizadas de mejora</div>
                    </div>
                  </div>
                </label>

                <label className="checkbox-item" htmlFor="section-risks">
                  <input
                    id="section-risks"
                    type="checkbox"
                    checked={selectedSections.risks}
                    onChange={() => toggleSection('risks')}
                    aria-label="Riesgos"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-icon"><HiExclamation size={24} /></span>
                    <div>
                      <div className="checkbox-title">Riesgos</div>
                      <div className="checkbox-subtitle">Riesgos identificados</div>
                    </div>
                  </div>
                </label>

                <label className="checkbox-item" htmlFor="section-nextSteps">
                  <input
                    id="section-nextSteps"
                    type="checkbox"
                    checked={selectedSections.nextSteps}
                    onChange={() => toggleSection('nextSteps')}
                    aria-label="Plan de Acción"
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-icon"><HiOutlineCalendar size={24} /></span>
                    <div>
                      <div className="checkbox-title">Plan de Acción</div>
                      <div className="checkbox-subtitle">Próximos pasos recomendados</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowPDFModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluations List */}
      <div className="evaluations-section">
        <h2 className="section-title">Evaluaciones del Proyecto</h2>
        <p className="section-subtitle">
          {report.evaluations.length} evaluación(es) completada(s) incluida(s) en este proyecto
        </p>
        
        <div className="evaluations-grid">
          {report.evaluations.map((evaluation) => (
            <EvaluationCard
              key={evaluation.evaluation_id}
              evaluation={{
                evaluation_id: evaluation.evaluation_id,
                project_id: report.project_id,
                project_name: report.project_name,
                standard_name: evaluation.standard_name,
                created_at: evaluation.created_at,
                final_score: evaluation.final_score,
                has_results: true
              }}
            />
          ))}
        </div>

        {report.evaluations.length === 0 && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No hay evaluaciones completadas para este proyecto</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectReportPageWrapper() {
  return (
    <ProtectedRoute requiredRole="any">
      <ProjectReportPage />
    </ProtectedRoute>
  );
}

export default ProjectReportPageWrapper;
