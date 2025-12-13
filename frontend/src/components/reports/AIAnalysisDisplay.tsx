import { useState } from 'react';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import type { AIAnalysisResponse } from '@/api/reports/ai-analysis.types';

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResponse;
  onClose?: () => void;
}

export function AIAnalysisDisplay({ analysis, onClose }: AIAnalysisDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    strengths: false,
    weaknesses: false,
    recommendations: false,
    risks: false,
    nextSteps: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const getPriorityColor = (priority: 'Alta' | 'Media' | 'Baja') => {
    switch (priority) {
      case 'Alta': return '#ef4444';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: 'Alta' | 'Media' | 'Baja') => {
    switch (priority) {
      case 'Alta':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'Media':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'Baja':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="ai-analysis-wrapper">
      <div className="ai-analysis-container">
        <div className="ai-analysis-header">
          <div className="header-title">
            <div className="ai-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Análisis Generado por IA</span>
            </div>
            <p className="analysis-date">
              Generado el {new Date(analysis.generatedAt).toLocaleString('es-ES', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="close-btn" aria-label="Cerrar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Metadata Badge */}
        {analysis.metadata && (
          <div className={`metadata-badge ${analysis.metadata.meetsThreshold ? 'approved' : 'rejected'}`}>
            <div className="metadata-score">
              <span className="score-value">{analysis.metadata.score?.toFixed(1) || '0.0'}%</span>
              <span className="score-label">Puntuación</span>
            </div>
            <div className="metadata-divider" />
            <div className="metadata-status">
              {analysis.metadata.meetsThreshold ? (
                <>
                  <HiCheckCircle size={24} style={{ marginRight: '0.5rem' }} />
                  Aprobado
                </>
              ) : (
                <>
                  <HiExclamationCircle size={24} style={{ marginRight: '0.5rem' }} />
                  No Aprobado
                </>
              )}
            </div>
          </div>
        )}

        {/* Análisis General - Desplegable */}
        <section className="analysis-section collapsible">
          <button 
            className="section-header"
            onClick={() => toggleSection('general')}
            aria-expanded={expandedSections.general}
          >
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Análisis General
            </h3>
            <svg 
              className={`chevron ${expandedSections.general ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.general && (
            <div className="section-content">
              <div className="analysis-content">
                <p className="general-analysis">{analysis.analisis_general}</p>
              </div>
            </div>
          )}
        </section>

        {/* Fortalezas - Desplegable */}
        <section className="analysis-section collapsible">
          <button 
            className="section-header"
            onClick={() => toggleSection('strengths')}
            aria-expanded={expandedSections.strengths}
          >
            <h3 className="section-title strengths">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fortalezas ({analysis.fortalezas?.length || 0})
            </h3>
            <svg 
              className={`chevron ${expandedSections.strengths ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.strengths && (
            <div className="section-content">
              <ul className="list-items strengths-list">
                {(analysis.fortalezas || []).map((fortaleza, index) => (
                  <li key={index}>{fortaleza}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Debilidades - Desplegable */}
        <section className="analysis-section collapsible">
          <button 
            className="section-header"
            onClick={() => toggleSection('weaknesses')}
            aria-expanded={expandedSections.weaknesses}
          >
            <h3 className="section-title weaknesses">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Áreas de Mejora ({analysis.debilidades?.length || 0})
            </h3>
            <svg 
              className={`chevron ${expandedSections.weaknesses ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.weaknesses && (
            <div className="section-content">
              <ul className="list-items weaknesses-list">
                {(analysis.debilidades || []).map((debilidad, index) => (
                  <li key={index}>{debilidad}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Recomendaciones Priorizadas - Desplegable */}
        <section className="analysis-section collapsible">
          <button 
            className="section-header"
            onClick={() => toggleSection('recommendations')}
            aria-expanded={expandedSections.recommendations}
          >
            <h3 className="section-title recommendations">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
              </svg>
              Recomendaciones Priorizadas ({analysis.recomendaciones?.length || 0})
            </h3>
            <svg 
              className={`chevron ${expandedSections.recommendations ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.recommendations && (
            <div className="section-content">
              <div className="recommendations-grid">
                {(analysis.recomendaciones || []).map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-header">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(rec.prioridad) }}
                      >
                        {getPriorityIcon(rec.prioridad)}
                        {rec.prioridad}
                      </span>
                      {rec.categoria && (
                        <span className="category-badge">{rec.categoria}</span>
                      )}
                    </div>
                    <h4 className="recommendation-title">{rec.titulo}</h4>
                    <p className="recommendation-description">{rec.descripcion}</p>
                    <div className="recommendation-impact">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <strong>Impacto:</strong> {rec.impacto}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Riesgos - Desplegable */}
        <section className="analysis-section collapsible">
          <button 
            className="section-header"
            onClick={() => toggleSection('risks')}
            aria-expanded={expandedSections.risks}
          >
            <h3 className="section-title risks">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Riesgos Identificados ({analysis.riesgos?.length || 0})
            </h3>
            <svg 
              className={`chevron ${expandedSections.risks ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.risks && (
            <div className="section-content">
              <ul className="list-items risks-list">
                {(analysis.riesgos || []).map((riesgo, index) => (
                  <li key={index}>{riesgo}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Próximos Pasos - Desplegable */}
        <section className="analysis-section collapsible">
          <button 
            className="section-header"
            onClick={() => toggleSection('nextSteps')}
            aria-expanded={expandedSections.nextSteps}
          >
            <h3 className="section-title next-steps">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Plan de Acción ({analysis.proximos_pasos?.length || 0} pasos)
            </h3>
            <svg 
              className={`chevron ${expandedSections.nextSteps ? 'expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSections.nextSteps && (
            <div className="section-content">
              <ol className="next-steps-list">
                {analysis.proximos_pasos.map((paso, index) => (
                  <li key={index}>
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{paso}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .ai-analysis-wrapper {
          display: flex;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .ai-analysis-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
          overflow: hidden;
          animation: slideIn 0.4s ease;
          max-width: 1200px;
          width: 100%;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ai-analysis-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem 2rem;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-title {
          flex: 1;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .analysis-date {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .metadata-badge {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .metadata-badge.approved {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        }

        .metadata-badge.rejected {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        }

        .metadata-score {
          display: flex;
          flex-direction: column;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          color: var(--color-primary-dark);
        }

        .score-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
        }

        .metadata-divider {
          width: 2px;
          height: 40px;
          background: #d1d5db;
        }

        .metadata-status {
          display: flex;
          align-items: center;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .analysis-section {
          border-bottom: 1px solid #f3f4f6;
        }

        .analysis-section:last-child {
          border-bottom: none;
        }

        .analysis-section.collapsible {
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .section-header:hover {
          background: #f9fafb;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0;
        }

        .section-title.strengths { color: #10b981; }
        .section-title.weaknesses { color: #ef4444; }
        .section-title.recommendations { color: #667eea; }
        .section-title.risks { color: #f59e0b; }
        .section-title.next-steps { color: #8b5cf6; }

        .chevron {
          transition: transform 0.3s ease;
          color: #9ca3af;
        }

        .chevron.expanded {
          transform: rotate(180deg);
        }

        .section-content {
          padding: 0 2rem 1.5rem 2rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 5000px;
          }
        }

        .analysis-content {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid var(--color-primary);
        }

        .general-analysis {
          color: #374151;
          line-height: 1.8;
          font-size: 1rem;
          margin: 0;
          white-space: pre-line;
        }

        .list-items {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .list-items li {
          padding: 1rem;
          border-radius: 8px;
          line-height: 1.6;
          color: #374151;
          position: relative;
          padding-left: 2.5rem;
        }

        .list-items li::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 1.25rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .strengths-list li {
          background: #ecfdf5;
          border-left: 3px solid #10b981;
        }

        .strengths-list li::before {
          background: #10b981;
        }

        .weaknesses-list li {
          background: #fef2f2;
          border-left: 3px solid #ef4444;
        }

        .weaknesses-list li::before {
          background: #ef4444;
        }

        .risks-list li {
          background: #fffbeb;
          border-left: 3px solid #f59e0b;
        }

        .risks-list li::before {
          background: #f59e0b;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .recommendation-card {
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .recommendation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary);
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-badge {
          padding: 0.375rem 0.75rem;
          background: #e0e7ff;
          color: #4338ca;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .recommendation-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin: 0 0 0.75rem 0;
        }

        .recommendation-description {
          color: #4b5563;
          line-height: 1.6;
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
        }

        .recommendation-impact {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .recommendation-impact svg {
          flex-shrink: 0;
          color: #10b981;
          margin-top: 2px;
        }

        .recommendation-impact strong {
          color: var(--color-primary-dark);
          margin-right: 0.25rem;
        }

        .next-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          counter-reset: step-counter;
        }

        .next-steps-list li {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border-left: 4px solid #8b5cf6;
          transition: all 0.2s ease;
        }

        .next-steps-list li:hover {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          transform: translateX(4px);
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .step-text {
          flex: 1;
          color: #374151;
          line-height: 1.6;
          padding-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .ai-analysis-wrapper {
            padding: 1rem 0.5rem;
          }

          .ai-analysis-header {
            padding: 1rem;
          }

          .section-header {
            padding: 1rem;
          }

          .section-content {
            padding: 0 1rem 1rem 1rem;
          }

          .metadata-badge {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .metadata-divider {
            width: 100%;
            height: 2px;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
