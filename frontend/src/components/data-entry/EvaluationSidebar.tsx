'use client';

import { useState, useEffect } from 'react';
import styles from './EvaluationSidebar.module.css';

// Interfaces para el sidebar
interface Variable {
  id: number;
  metric_id: number;
  symbol: string;
  description: string;
  state: string;
}

interface Metric {
  id: number;
  name: string;
  description: string;
  formula: string;
  variables?: Variable[];
}

interface Subcriterion {
  id: number;
  name: string;
  description?: string;
  criterion_id: number;
  state: string;
  metrics?: Metric[];
  created_at: string;
  updated_at: string;
}

interface Evaluation {
  id: number;
  project_id: number;
  standard_id: number;
  creation_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  standard: {
    id: number;
    name: string;
    version: string;
  };
  evaluation_criteria: Array<{
    id: number;
    evaluation_id: number;
    criterion_id: number;
    importance_level: string;
    importance_percentage: number;
    criterion: {
      id: number;
      name: string;
      description?: string;
      state?: 'active' | 'inactive';
      subcriteria?: Array<{
        id: number;
        name: string;
        description?: string;
        criterion_id: number;
        state: string;
        metrics?: Metric[];
        created_at: string;
        updated_at: string;
      }>;
    };
  }>;
}

interface EvaluationSidebarProps {
  evaluations: Evaluation[];
  currentMetricIndex: number;
  allMetrics: Metric[];
  variableValues: Record<string, string>;
  onMetricSelect: (evaluationIndex: number, metricGlobalIndex: number) => void;
}

export function EvaluationSidebar({ 
  evaluations,
  currentMetricIndex,
  allMetrics,
  variableValues,
  onMetricSelect 
}: EvaluationSidebarProps) {
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<number>>(new Set());
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set());
  const [expandedSubcriteria, setExpandedSubcriteria] = useState<Set<number>>(new Set());

  const getMetricGlobalIndex = (metric: Metric): number => {
    return allMetrics.findIndex(m => m.id === metric.id);
  };

  const isMetricCompleted = (metric: Metric): boolean => {
    if (!metric.variables) return false;
    
    return metric.variables.every(variable => {
      const key = `metric-${metric.id}-${variable.symbol}`;
      const value = variableValues[key];
      return value !== undefined && value !== '';
    });
  };

  const getCompletedMetricsInEvaluation = (evaluation: Evaluation): number => {
    let completedCount = 0;
    evaluation.evaluation_criteria.forEach(ec => {
      ec.criterion.subcriteria?.forEach(sc => {
        sc.metrics?.forEach(metric => {
          if (isMetricCompleted(metric)) {
            completedCount++;
          }
        });
      });
    });
    return completedCount;
  };

  const getTotalMetricsInEvaluation = (evaluation: Evaluation): number => {
    let totalCount = 0;
    evaluation.evaluation_criteria.forEach(ec => {
      ec.criterion.subcriteria?.forEach(sc => {
        totalCount += sc.metrics?.length || 0;
      });
    });
    return totalCount;
  };

  const toggleEvaluation = (evaluationId: number) => {
    const newExpanded = new Set(expandedEvaluations);
    if (newExpanded.has(evaluationId)) {
      newExpanded.delete(evaluationId);
    } else {
      newExpanded.add(evaluationId);
    }
    setExpandedEvaluations(newExpanded);
  };

  const toggleCriterion = (criterionId: number) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId);
    } else {
      newExpanded.add(criterionId);
    }
    setExpandedCriteria(newExpanded);
  };

  const toggleSubcriterion = (subcriterionId: number) => {
    const newExpanded = new Set(expandedSubcriteria);
    if (newExpanded.has(subcriterionId)) {
      newExpanded.delete(subcriterionId);
    } else {
      newExpanded.add(subcriterionId);
    }
    setExpandedSubcriteria(newExpanded);
  };

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2 className={styles.title}>Evaluaciones</h2>
        </div>
        <div className={styles.navigation}>
          <div className={styles.emptyMetrics}>
            No hay evaluaciones disponibles
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Evaluaciones</h2>
      </div>

      <div className={styles.navigation}>
        {/* Mapear todas las evaluaciones */}
        {evaluations.map((evaluation, evalIndex) => {
          const isEvaluationExpanded = expandedEvaluations.has(evaluation.id);
          const completedCount = getCompletedMetricsInEvaluation(evaluation);
          const totalCount = getTotalMetricsInEvaluation(evaluation);

          return (
            <div key={evaluation.id} className={styles.evaluationGroup}>
              <button
                className={`${styles.evaluationButton} ${isEvaluationExpanded ? styles.activeEvaluation : ''}`}
                onClick={() => toggleEvaluation(evaluation.id)}
              >
                <span className={styles.standardIcon}>
                  {isEvaluationExpanded ? '▼' : '▶'}
                </span>
                <span className={styles.evaluationName}>
                  {evaluation.standard.name} v{evaluation.standard.version}
                </span>
                <span className={styles.progressIndicator}>
                  ({completedCount}/{totalCount})
                </span>
              </button>

              {isEvaluationExpanded && (
                <div className={styles.criteriaList}>
                  {evaluation.evaluation_criteria.map((evalCriterion) => {
                    const criterion = evalCriterion.criterion;
                    const isCriterionExpanded = expandedCriteria.has(criterion.id);

                    return (
                      <div key={evalCriterion.id} className={styles.criterionGroup}>
                        <button
                          className={`${styles.criterionButton} ${isCriterionExpanded ? styles.activeCriterion : ''}`}
                          onClick={() => toggleCriterion(criterion.id)}
                        >
                          <span className={styles.standardIcon}>
                            {isCriterionExpanded ? '▼' : '▶'}
                          </span>
                          <span className={styles.criterionName}>
                            {criterion.name}
                          </span>
                        </button>

                        {isCriterionExpanded && (
                          <div className={styles.subcriteriaContainer}>
                            {criterion.subcriteria && criterion.subcriteria.length > 0 ? (
                              criterion.subcriteria.map((subcriterion) => {
                                const isSubcriterionExpanded = expandedSubcriteria.has(subcriterion.id);

                                return (
                                  <div key={subcriterion.id} className={styles.subcriterionGroup}>
                                    <button
                                      className={`${styles.subcriterionButton} ${isSubcriterionExpanded ? styles.activeSubcriterion : ''}`}
                                      onClick={() => toggleSubcriterion(subcriterion.id)}
                                    >
                                      <span className={styles.standardIcon}>
                                        {isSubcriterionExpanded ? '▼' : '▶'}
                                      </span>
                                      <span className={styles.subcriterionName}>
                                        {subcriterion.name}
                                      </span>
                                    </button>

                                    {isSubcriterionExpanded && (
                                      <div className={styles.metricsSubContainer}>
                                        {subcriterion.metrics && subcriterion.metrics.length > 0 ? (
                                          subcriterion.metrics.map((metric, metricLocalIndex) => {
                                            const metricGlobalIndex = getMetricGlobalIndex(metric);
                                            const isCompleted = isMetricCompleted(metric);
                                            const isActive = metricGlobalIndex === currentMetricIndex;

                                            return (
                                              <button
                                                key={metric.id}
                                                className={`${styles.metricButton} ${isActive ? styles.activeMetric : ''} ${isCompleted ? styles.completedMetric : ''}`}
                                                onClick={() => onMetricSelect(evalIndex, metricGlobalIndex)}
                                              >
                                                <span className={`${styles.metricNumber} ${isCompleted ? styles.completedNumber : ''}`}>
                                                  {isCompleted ? '✓' : metricLocalIndex + 1}
                                                </span>
                                                <span className={styles.metricName}>{metric.name}</span>
                                              </button>
                                            );
                                          })
                                        ) : (
                                          <div className={styles.emptyMetrics}>
                                            No hay métricas configuradas
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className={styles.emptySubcriteria}>
                                Este criterio no tiene subcriterios configurados
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}