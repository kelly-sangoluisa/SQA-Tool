'use client';

import { useState, useEffect } from 'react';
import { Criterion } from '@/api/parameterization/parameterization-api';
import { configEvaluationApi, CriterionWithMetrics, Metric } from '@/api/config-evaluation/config-evaluation-api';
import { SelectedCriterion } from '@/types/configurationEvaluation.types';
import { Button } from '../shared';
import AlertBanner from '../shared/AlertBanner';
import styles from './MetricsSelection.module.css';

interface MetricsSelectionProps {
  selectedCriteria: Criterion[];
  selectedSubCriteria: SelectedCriterion[];
  onNext: (selectedMetrics: Map<number, number[]>) => void;
  onBack: () => void;
}

export function MetricsSelection({
  selectedCriteria,
  selectedSubCriteria,
  onNext,
  onBack,
}: MetricsSelectionProps) {
  const [criteriaWithMetrics, setCriteriaWithMetrics] = useState<Map<number, CriterionWithMetrics>>(new Map());
  const [selectedMetrics, setSelectedMetrics] = useState<Map<number, Set<number>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'success'>('error');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const metricsMap = new Map<number, CriterionWithMetrics>();

        for (const criterion of selectedCriteria) {
          try {
            const criterionData = await configEvaluationApi.getMetricsByCriterionId(criterion.id);
            metricsMap.set(criterion.id, criterionData);
          } catch (err) {
            console.error(`Error loading metrics for criterion ${criterion.id} (${criterion.name}):`, err);
            throw new Error(`No se pudieron cargar las métricas para el criterio "${criterion.name}" (ID: ${criterion.id}). Por favor, verifica que el criterio tenga subcriterios y métricas configuradas.`);
          }
        }

        setCriteriaWithMetrics(metricsMap);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar las métricas';
        console.error('Error loading metrics:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [selectedCriteria]);

  const handleMetricToggle = (criterionId: number, metricId: number) => {
    const newSelected = new Map(selectedMetrics);
    const metrics = newSelected.get(criterionId) || new Set();

    if (metrics.has(metricId)) {
      metrics.delete(metricId);
    } else {
      metrics.add(metricId);
    }

    if (metrics.size > 0) {
      newSelected.set(criterionId, metrics);
    } else {
      newSelected.delete(criterionId);
    }

    setSelectedMetrics(newSelected);
  };

  const handleSelectAllForSubCriterion = (criterionId: number, subCriterionMetrics: Metric[]) => {
    const newSelected = new Map(selectedMetrics);
    const currentMetrics = newSelected.get(criterionId) || new Set();
    const metricIds = subCriterionMetrics.map(m => m.id);

    const allSelected = metricIds.every(id => currentMetrics.has(id));

    if (allSelected) {
      metricIds.forEach(id => currentMetrics.delete(id));
    } else {
      metricIds.forEach(id => currentMetrics.add(id));
    }

    if (currentMetrics.size > 0) {
      newSelected.set(criterionId, currentMetrics);
    } else {
      newSelected.delete(criterionId);
    }

    setSelectedMetrics(newSelected);
  };

  const isMetricSelected = (criterionId: number, metricId: number): boolean => {
    return selectedMetrics.get(criterionId)?.has(metricId) || false;
  };

  const getSelectedCount = (): number => {
    let count = 0;
    selectedMetrics.forEach((metrics) => {
      count += metrics.size;
    });
    return count;
  };

  // Helper function to get selected sub-criteria IDs for a specific criterion
  const getSelectedSubCriteriaIds = (criterionId: number): number[] => {
    const selectedCriterion = selectedSubCriteria.find(sc => sc.criterionId === criterionId);
    return selectedCriterion?.subCriteriaIds || [];
  };

  const handleNext = () => {
    // Prevenir doble clic
    if (isProcessing) {
      console.warn('Ya se está procesando la solicitud, ignorando clic duplicado');
      return;
    }

    if (selectedMetrics.size === 0 || getSelectedCount() === 0) {
      setAlertMessage('Debe seleccionar al menos una métrica para continuar.');
      setAlertType('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setAlertMessage(null);
    const metricsMap = new Map<number, number[]>();
    selectedMetrics.forEach((metricIds, criterionId) => {
      metricsMap.set(criterionId, Array.from(metricIds));
    });
    setIsProcessing(true);
    onNext(metricsMap);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando métricas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
        </div>
      </div>
    );
  }

  const totalSelected = getSelectedCount();
  const hasSelection = totalSelected > 0;

  return (
    <div className={styles.pageWrapper}>
      {/* Banner de alerta */}
      {alertMessage && (
        <div className={styles.alertContainer}>
          <AlertBanner
            type={alertType}
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
            visible={!!alertMessage}
          />
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Seleccione las Métricas</h2>
          <p className={styles.subtitle}>
            Para cada criterio seleccionado, elija las métricas que desea evaluar
          </p>
          {hasSelection && (
            <div className={styles.selectionSummary}>
              <span className={styles.badge}>{totalSelected} métricas seleccionadas</span>
            </div>
          )}
        </div>

      <div className={styles.criteriaList}>
        {selectedCriteria.map((criterion) => {
          const criterionData = criteriaWithMetrics.get(criterion.id);

          if (!criterionData) return null;

          return (
            <div key={criterion.id} className={styles.criterionCard}>
              <div className={styles.criterionHeader}>
                <h3 className={styles.criterionName}>{criterionData.name}</h3>
              </div>

              {criterionData.description && (
                <p className={styles.criterionDescription}>{criterionData.description}</p>
              )}

              {criterionData.sub_criteria && criterionData.sub_criteria.length > 0 ? (
                <div className={styles.subCriteriaList}>
                  {criterionData.sub_criteria
                    .filter((subCriterion) => {
                      // Filtrar solo los subcriterios que fueron seleccionados en el paso anterior
                      const selectedSubCriteriaIds = getSelectedSubCriteriaIds(criterion.id);
                      return selectedSubCriteriaIds.includes(subCriterion.id);
                    })
                    .map((subCriterion) => {
                    const subMetrics = subCriterion.metrics || [];

                    if (subMetrics.length === 0) return null;

                    const allSelected = subMetrics.every(m =>
                      isMetricSelected(criterion.id, m.id)
                    );

                    return (
                      <div key={subCriterion.id} className={styles.subCriterionSection}>
                        <div className={styles.subCriterionHeader}>
                          <h4 className={styles.subCriterionName}>{subCriterion.name}</h4>
                          <button
                            type="button"
                            className={styles.selectAllButton}
                            onClick={() => handleSelectAllForSubCriterion(criterion.id, subMetrics)}
                          >
                            {allSelected ? 'Desmarcar todas' : 'Seleccionar todas'}
                          </button>
                        </div>

                        <div className={styles.metricsList}>
                          {subMetrics.map((metric) => (
                            <div key={metric.id} className={styles.metricItem}>
                              <label className={styles.checkboxLabel}>
                                <input
                                  type="checkbox"
                                  className={styles.checkbox}
                                  checked={isMetricSelected(criterion.id, metric.id)}
                                  onChange={() => handleMetricToggle(criterion.id, metric.id)}
                                />
                                <div className={styles.metricContent}>
                                  <span className={styles.metricName}>{metric.name}</span>
                                  {metric.formula && (
                                    <p className={styles.metricFormula}>Fórmula: {metric.formula}</p>
                                  )}
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.noMetrics}>Este criterio no tiene métricas disponibles</p>
              )}
            </div>
          );
        })}
      </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
            Atrás
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            {isProcessing ? 'Creando evaluación...' : 'Finalizar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  );
}
