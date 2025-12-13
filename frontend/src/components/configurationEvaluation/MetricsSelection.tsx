'use client';

import { useState, useEffect } from 'react';
import { configEvaluationApi, CriterionWithMetrics, Metric } from '@/api/config-evaluation/config-evaluation-api';
import { Button } from '../shared';
import styles from './MetricsSelection.module.css';

interface EvaluationCriterionData {
  id: number;
  criterionId: number;
  criterionName: string;
}

interface MetricsSelectionProps {
  evaluationCriteria: EvaluationCriterionData[];
  onNext: (selectedMetrics: Map<number, number[]>) => void;
  onBack: () => void;
}

export function MetricsSelection({
  evaluationCriteria,
  onNext,
  onBack,
}: MetricsSelectionProps) {
  const [criteriaWithMetrics, setCriteriaWithMetrics] = useState<Map<number, CriterionWithMetrics>>(new Map());
  const [selectedMetrics, setSelectedMetrics] = useState<Map<number, Set<number>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const metricsMap = new Map<number, CriterionWithMetrics>();

        for (const evalCriterion of evaluationCriteria) {
          try {
            const criterionData = await configEvaluationApi.getMetricsByCriterionId(evalCriterion.criterionId);
            metricsMap.set(evalCriterion.id, criterionData);
          } catch (err) {
            console.error(`Error loading metrics for criterion ${evalCriterion.criterionId} (${evalCriterion.criterionName}):`, err);
            throw new Error(`No se pudieron cargar las métricas para el criterio "${evalCriterion.criterionName}" (ID: ${evalCriterion.criterionId}). Por favor, verifica que el criterio tenga subcriterios y métricas configuradas.`);
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
  }, [evaluationCriteria]);

  const handleMetricToggle = (evaluationCriterionId: number, metricId: number) => {
    const newSelected = new Map(selectedMetrics);
    const metrics = newSelected.get(evaluationCriterionId) || new Set();

    if (metrics.has(metricId)) {
      metrics.delete(metricId);
    } else {
      metrics.add(metricId);
    }

    if (metrics.size > 0) {
      newSelected.set(evaluationCriterionId, metrics);
    } else {
      newSelected.delete(evaluationCriterionId);
    }

    setSelectedMetrics(newSelected);
  };

  const handleSelectAllForSubCriterion = (evaluationCriterionId: number, subCriterionMetrics: Metric[]) => {
    const newSelected = new Map(selectedMetrics);
    const currentMetrics = newSelected.get(evaluationCriterionId) || new Set();
    const metricIds = subCriterionMetrics.map(m => m.id);

    const allSelected = metricIds.every(id => currentMetrics.has(id));

    if (allSelected) {
      metricIds.forEach(id => currentMetrics.delete(id));
    } else {
      metricIds.forEach(id => currentMetrics.add(id));
    }

    if (currentMetrics.size > 0) {
      newSelected.set(evaluationCriterionId, currentMetrics);
    } else {
      newSelected.delete(evaluationCriterionId);
    }

    setSelectedMetrics(newSelected);
  };

  const isMetricSelected = (evaluationCriterionId: number, metricId: number): boolean => {
    return selectedMetrics.get(evaluationCriterionId)?.has(metricId) || false;
  };

  const getSelectedCount = (): number => {
    let count = 0;
    selectedMetrics.forEach((metrics) => {
      count += metrics.size;
    });
    return count;
  };

  const handleNext = () => {
    const metricsMap = new Map<number, number[]>();
    selectedMetrics.forEach((metricIds, evaluationCriterionId) => {
      metricsMap.set(evaluationCriterionId, Array.from(metricIds));
    });
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
        {evaluationCriteria.map((evalCriterion) => {
          const criterionData = criteriaWithMetrics.get(evalCriterion.id);

          if (!criterionData) return null;

          return (
            <div key={evalCriterion.id} className={styles.criterionCard}>
              <div className={styles.criterionHeader}>
                <h3 className={styles.criterionName}>{criterionData.name}</h3>
              </div>

              {criterionData.description && (
                <p className={styles.criterionDescription}>{criterionData.description}</p>
              )}

              {criterionData.sub_criteria && criterionData.sub_criteria.length > 0 ? (
                <div className={styles.subCriteriaList}>
                  {criterionData.sub_criteria.map((subCriterion) => {
                    const subMetrics = subCriterion.metrics || [];

                    if (subMetrics.length === 0) return null;

                    const allSelected = subMetrics.every(m =>
                      isMetricSelected(evalCriterion.id, m.id)
                    );

                    return (
                      <div key={subCriterion.id} className={styles.subCriterionSection}>
                        <div className={styles.subCriterionHeader}>
                          <h4 className={styles.subCriterionName}>{subCriterion.name}</h4>
                          <button
                            type="button"
                            className={styles.selectAllButton}
                            onClick={() => handleSelectAllForSubCriterion(evalCriterion.id, subMetrics)}
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
                                  checked={isMetricSelected(evalCriterion.id, metric.id)}
                                  onChange={() => handleMetricToggle(evalCriterion.id, metric.id)}
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
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="button" variant="primary" onClick={handleNext} disabled={!hasSelection}>
          Finalizar Configuración
        </Button>
      </div>
    </div>
  );
}
