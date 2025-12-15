import React, { useState } from 'react';
import { SubCriterionSearchResult, MetricSearchResult } from '../../types/parameterization-search.types';
import styles from './MetricSelectorModal.module.css';

interface MetricSelectorModalProps {
  subCriterion: SubCriterionSearchResult;
  onSelect: (metric: MetricSearchResult) => void;
  onCancel: () => void;
}

/**
 * Modal para seleccionar una métrica cuando un subcriterio tiene múltiples métricas asociadas
 * Este es el "Caso B - Escenario 2" de los requerimientos
 */
export function MetricSelectorModal({
  subCriterion,
  onSelect,
  onCancel,
}: MetricSelectorModalProps) {
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedMetricId === null) return;
    
    const selectedMetric = subCriterion.metrics.find(
      (m) => m.metric_id === selectedMetricId
    );
    
    if (selectedMetric) {
      onSelect(selectedMetric);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Seleccionar Métrica</h2>
          <p className={styles.modalSubtitle}>
            El subcriterio seleccionado tiene {subCriterion.metrics_count} métricas
            asociadas. Por favor, selecciona cuál deseas utilizar:
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
                selectedMetricId === metric.metric_id ? styles.selected : ''
              }`}
              onClick={() => setSelectedMetricId(metric.metric_id)}
            >
              <div className={styles.metricHeader}>
                <input
                  type="radio"
                  name="metric"
                  value={metric.metric_id}
                  checked={selectedMetricId === metric.metric_id}
                  onChange={() => setSelectedMetricId(metric.metric_id)}
                  className={styles.radioButton}
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

              {(metric.formula || metric.desired_threshold !== null || (metric.variables && metric.variables.length > 0)) && (
                <div className={styles.metricDetails}>
                  {metric.formula && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Fórmula:</span>
                      <span className={styles.detailValue}>{metric.formula}</span>
                    </div>
                  )}
                  {metric.desired_threshold !== null && (
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
            disabled={selectedMetricId === null}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            Usar Métrica Seleccionada
          </button>
        </div>
      </div>
    </div>
  );
}
