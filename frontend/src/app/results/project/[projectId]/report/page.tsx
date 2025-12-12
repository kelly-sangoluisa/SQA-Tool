'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ScoreGauge } from '@/components/reports/ScoreGauge';
import { EvaluationCard } from '@/components/reports/EvaluationCard';
import { AIAnalysisDisplay } from '@/components/reports/AIAnalysisDisplay';
import { getProjectReport, getProjectStats } from '@/api/reports/reports.api';
import type { ProjectReport, ProjectStats } from '@/api/reports/reports.types';
import { generateProjectPDF } from '@/utils/projectPDFGenerator';
import { formatDate } from '@/lib/shared/formatters';
import { useAIAnalysis } from '@/hooks/shared/useAIAnalysis';

export default function ProjectReportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [report, setReport] = useState<ProjectReport | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [includeCertificate, setIncludeCertificate] = useState(true);

  // AI Analysis
  const { analysis, loading: aiLoading, error: aiError, analyzeProject, clearAnalysis } = useAIAnalysis();

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

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
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!report || !stats) return;

    try {
      setIsExporting(true);
      await generateProjectPDF({ report, stats, includeCertificate });
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!projectId) return;

    try {
      await analyzeProject(projectId);
    } catch (error) {
      // Error already handled in hook
      console.error('AI Analysis error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando resultados del proyecto...</p>
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
        <p>{error || 'No se encontraron los resultados del proyecto'}</p>
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
    <div className="project-report-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <button onClick={() => router.push('/results')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
        </div>
        
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
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
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
              <button 
                className="export-pdf-btn"
                onClick={handleExportPDF}
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
              
              <button 
                className="ai-analysis-btn"
                onClick={handleAIAnalysis}
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

        {stats.completed_evaluations > 0 && stats.highest_evaluation.standard_name !== 'N/A' && (
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
                      <div className="stat-value">{stats.highest_evaluation.score.toFixed(1)}</div>
                      <div className="stat-label">Mejor: {stats.highest_evaluation.standard_name}</div>
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
                      <div className="stat-value">{stats.lowest_evaluation.score.toFixed(1)}</div>
                      <div className="stat-label">Menor: {stats.lowest_evaluation.standard_name}</div>
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
                    <div className="stat-value">{stats.highest_evaluation.score.toFixed(1)}</div>
                    <div className="stat-label">Mejor: {stats.highest_evaluation.standard_name}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon--warning">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="stat-value">{stats.lowest_evaluation.score.toFixed(1)}</div>
                    <div className="stat-label">Menor: {stats.lowest_evaluation.standard_name}</div>
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
          <button onClick={() => handleAIAnalysis()} className="retry-btn-inline">
            Reintentar
          </button>
        </div>
      )}

      {analysis && (
        <AIAnalysisDisplay analysis={analysis} onClose={clearAnalysis} />
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

      <style jsx>{`
        .project-report-page {
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
          margin: 0 0 1rem 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-badge--success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .status-badge--warning {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .export-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
        }

        .export-pdf-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          min-width: 180px;
        }

        .export-pdf-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .export-pdf-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ai-analysis-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgb(102 126 234 / 30%);
          min-width: 180px;
        }

        .ai-analysis-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgb(102 126 234 / 40%);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .ai-analysis-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ai-error-banner {
          max-width: 1200px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 12px;
          color: #991b1b;
          font-weight: 600;
        }

        .ai-error-banner svg {
          flex-shrink: 0;
          color: #ef4444;
        }

        .ai-error-banner span {
          flex: 1;
        }

        .retry-btn-inline {
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-btn-inline:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .certificate-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #475569;
          cursor: pointer;
          user-select: none;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
        }

        .certificate-checkbox:hover {
          background: #f1f5f9;
        }

        .certificate-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--color-primary);
        }

        .certificate-checkbox input[type="checkbox"]:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .certificate-checkbox span {
          font-weight: 500;
        }

        .certificate-checkbox:hover span {
          color: var(--color-primary);
        }

        .header-score {
          /* ScoreGauge wrapper */
        }

        .stats-section {
          max-width: 1200px;
          margin: 0 auto 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .stat-icon--primary {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
        }

        .stat-icon--success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .stat-icon--secondary {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .stat-icon--warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .evaluations-section {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        .section-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .evaluations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          border: 2px dashed #e5e7eb;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: #9ca3af;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .project-report-page {
            padding: 1rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .header-actions {
            flex-direction: column;
          }

          .evaluations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
