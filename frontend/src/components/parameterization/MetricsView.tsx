import React from 'react';
import { SubCriterion, Metric, parameterizationApi } from '../../api/parameterization/parameterization-api';
import styles from './MetricsView.module.css';

interface MetricsViewProps {
  subCriterion: SubCriterion;
  metrics: Metric[];
  loading: boolean;
  onEditMetric: (metric: Metric) => void;
  onCreateMetric: () => void;
  onRefreshMetrics?: () => void;
  onMetricStateChange?: (updatedMetric: Metric) => void;
}

export function MetricsView({
  subCriterion,
  metrics,
  loading,
  onEditMetric,
  onCreateMetric,
  onRefreshMetrics,
  onMetricStateChange
}: MetricsViewProps) {
  const handleToggleMetricState = async (metric: Metric) => {
    // Si el subcriterio está inactivo, no permitir activar métricas
    if (subCriterion.state === 'inactive' && metric.state === 'inactive') {
      console.warn('No se puede activar una métrica cuando el subcriterio está inactivo');
      return;
    }
    
    try {
      const newState = metric.state === 'active' ? 'inactive' : 'active';
      
      // Cambio optimista: notificar al padre inmediatamente
      const updatedMetric: Metric = { ...metric, state: newState as 'active' | 'inactive' };
      onMetricStateChange?.(updatedMetric);
      
      // Actualizar en el servidor
      await parameterizationApi.updateMetricState(metric.id, { state: newState });
    } catch (error) {
      console.error('Error updating metric state:', error);
      
      // Si falla, revertir el cambio
      onMetricStateChange?.(metric);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{subCriterion.name}</h2>
            <span className={`${styles.status} ${styles[subCriterion.state]}`}>
              {subCriterion.state}
            </span>
          </div>
          {subCriterion.description && (
            <p className={styles.description}>{subCriterion.description}</p>
          )}
        </div>
        
        <button
          type="button"
          onClick={onCreateMetric}
          className={styles.createButton}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Nueva Métrica
        </button>
      </div>

      <div className={styles.content}>
        {metrics.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📏</div>
            <h3>No hay métricas definidas</h3>
            <p>Comienza agregando la primera métrica para este sub-criterio.</p>
            <button
              type="button"
              onClick={onCreateMetric}
              className={styles.emptyButton}
            >
              Crear Primera Métrica
            </button>
          </div>
        ) : (
          <div className={styles.metricsList}>
            {metrics.map((metric) => (
              <div key={metric.id} className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <div className={styles.metricInfo}>
                    <div className={styles.metricTitle}>
                      {metric.code && (
                        <span className={styles.metricCode}>{metric.code}</span>
                      )}
                      <span className={styles.metricName}>{metric.name}</span>
                    </div>
                    
                    <div className={styles.metricActions}>
                      <button
                        type="button"
                        onClick={() => handleToggleMetricState(metric)}
                        className={`${styles.toggleButton} ${metric.state === 'active' ? styles.active : styles.inactive}`}
                        disabled={subCriterion.state === 'inactive' && metric.state === 'inactive'}
                        title={
                          subCriterion.state === 'inactive' && metric.state === 'inactive'
                            ? 'No se puede activar cuando el subcriterio está inactivo'
                            : `${metric.state === 'active' ? 'Desactivar' : 'Activar'} métrica`
                        }
                      >
                        <div className={styles.toggleSlider}></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.metricDetails}>
                  {metric.description && (
                    <p className={styles.metricDescription}>{metric.description}</p>
                  )}
                  
                  <div className={styles.metricData}>
                    {metric.desired_threshold !== null && (
                      <div className={styles.threshold}>
                        <span className={styles.thresholdIcon}>🎯</span>
                        <span className={styles.thresholdLabel}>Umbral:</span>
                        <span className={styles.thresholdValue}>
                          {metric.desired_threshold > 1 
                            ? `${metric.desired_threshold}%` 
                            : `${(metric.desired_threshold * 100).toFixed(1)}%`
                          }
                        </span>
                      </div>
                    )}
                    
                    {metric.formula && (
                      <div className={styles.formula}>
                        <span className={styles.formulaLabel}>Fórmula:</span>
                        <code className={styles.formulaCode}>{metric.formula}</code>
                      </div>
                    )}
                    
                    {metric.variables && metric.variables.length > 0 && (
                      <div className={styles.variables}>
                        <span className={styles.variablesLabel}>Variables:</span>
                        <div className={styles.variablesList}>
                          {metric.variables.map((variable) => (
                            <span key={variable.id} className={styles.variableChip}>
                              <span className={styles.variableSymbol}>{variable.symbol}</span>
                              <span className={styles.variableDescription}>{variable.description}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.metricFooter}>
                  <button
                    type="button"
                    onClick={() => onEditMetric(metric)}
                    className={styles.editButton}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12.146 2.146a.5.5 0 0 1 .708 0l1 1a.5.5 0 0 1 0 .708L4.707 12.5H2v-2.707L10.646 1.146a.5.5 0 0 1 .708 0L12.146 2.146z"
                        fill="currentColor"
                      />
                      <path
                        d="M2 13.5V16h2.5"
                        stroke="currentColor"
                        strokeLinecap="round"
                      />
                    </svg>
                    Editar
                  </button>
                  
                  <span className={`${styles.metricStatus} ${styles[metric.state]}`}>
                    {metric.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}