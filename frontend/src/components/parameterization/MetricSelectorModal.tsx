import React, { useState } from 'react';
import { SubCriterionSearchResult, MetricSearchResult } from '../../types/parameterization-search.types';
import styles from './MetricSelectorModal.module.css';

interface MetricSelectorModalProps {
  subCriterion: SubCriterionSearchResult;
  onSelect: (metrics: MetricSearchResult[]) => void;
  onCancel: () => void;
}

/**
 * Modal para seleccionar múltiples métricas cuando un subcriterio tiene métricas asociadas
 * Este es el "Caso B - Escenario 2" de los requerimientos
 */
export function MetricSelectorModal({
  subCriterion,
  onSelect,
  onCancel,
}: MetricSelectorModalProps) {
  const [selectedMetricIds, setSelectedMetricIds] = useState<number[]>([]);

  const handleToggleMetric = (metricId: number) => {
    setSelectedMetricIds(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleConfirm = () => {
    if (selectedMetricIds.length === 0) return;
    
    const selectedMetrics = subCriterion.metrics.filter(
      (m) => selectedMetricIds.includes(m.metric_id)
    );
    
    if (selectedMetrics.length > 0) {
      onSelect(selectedMetrics);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Seleccionar Métricas</h2>
          <p className={styles.modalSubtitle}>
            El subcriterio seleccionado tiene {subCriterion.metrics_count} métricas
            asociadas. Puedes seleccionar una o más métricas para copiar:
          </p>
        </div>

        <div className={styles.subCriterionInfo}>
          <div className={styles.subCriterionName}>{subCriterion.name}</div>
          <div className={styles.subCriterionMeta}>
            {subCriterion.criterion_name} • {subCriterion.standard_name}
          </div>
        </div>

        <div className={styles.metricsGrid}>
          {subCriterion.metrics.map((metric) => (
            <div
              key={metric.metric_id}
              className={`${styles.metricCard} ${
                selectedMetricIds.includes(metric.metric_id) ? styles.selected : ''
              }`}
              onClick={() => handleToggleMetric(metric.metric_id)}
            >
              <div className={styles.metricHeader}>
                <input
                  type="checkbox"
                  name="metric"
                  value={metric.metric_id}
                  checked={selectedMetricIds.includes(metric.metric_id)}
                  onChange={() => handleToggleMetric(metric.metric_id)}
                  className={styles.checkbox}
                />
                <div className={styles.metricInfo}>
                  <div className={styles.metricName}>
                    {metric.name}
                    {metric.code && (
                      <span className={styles.metricCode}>{metric.code}</span>
                    )}
                  </div>
                  {metric.description && (
                    <p className={styles.metricDescription}>
                      {metric.description}
                    </p>
                  )}
                </div>
              </div>

              {(metric.formula || metric.desired_threshold || (metric.variables && metric.variables.length > 0)) && (
                <div className={styles.metricDetails}>
                  {metric.formula && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Fórmula:</span>
                      <span className={styles.detailValue}>{metric.formula}</span>
                    </div>
                  )}
                  {metric.desired_threshold && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Umbral:</span>
                      <span className={styles.detailValue}>
                        {metric.desired_threshold}
                      </span>
                    </div>
                  )}
                  {metric.variables && metric.variables.length > 0 && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Variables:</span>
                      <span className={styles.detailValue}>
                        {metric.variables.length} variable{metric.variables.length !== 1 ? 's' : ''} ({metric.variables.map(v => v.symbol).join(', ')})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedMetricIds.length === 0}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            Usar {selectedMetricIds.length > 0 ? `${selectedMetricIds.length} ` : ''}Métrica{selectedMetricIds.length !== 1 ? 's' : ''} Seleccionada{selectedMetricIds.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
