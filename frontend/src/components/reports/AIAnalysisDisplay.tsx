'use client';

import { useState } from 'react';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import type { AIAnalysisResponse } from '@/api/reports/ai-analysis.types';
import '@/styles/reports/ai-analysis-display.css';

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResponse;
  onClose?: () => void;
}

export function AIAnalysisDisplay({ analysis, onClose }: Readonly<AIAnalysisDisplayProps>) {
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
              <span className="score-value">{analysis.metadata.score?.toFixed(1) || '0.0'}</span>
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
                {(analysis.fortalezas || []).map((fortaleza) => (
                  <li key={fortaleza}>{fortaleza}</li>
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
                {(analysis.debilidades || []).map((debilidad) => (
                  <li key={debilidad}>{debilidad}</li>
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
                {(analysis.recomendaciones || []).map((rec) => (
                  <div key={rec.titulo} className="recommendation-card">
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
                {(analysis.riesgos || []).map((riesgo) => (
                  <li key={riesgo}>{riesgo}</li>
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
                  <li key={paso}>
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{paso}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}