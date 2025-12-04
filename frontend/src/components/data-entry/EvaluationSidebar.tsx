import { useState } from 'react';

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
      subcriteria?: Subcriterion[];
    };
  }>;
}

interface EvaluationSidebarProps {
  evaluations: Evaluation[];
  currentEvaluationIndex: number;
  currentMetricIndex: number;
  allMetrics: Metric[];
  variableValues: Record<string, string>;
  onMetricSelect: (evaluationIndex: number, metricGlobalIndex: number) => void;
}

export function EvaluationSidebar({ 
  evaluations,
  currentEvaluationIndex,
  currentMetricIndex,
  allMetrics,
  variableValues,
  onMetricSelect 
}: EvaluationSidebarProps) {
  // Expandir automáticamente la primera evaluación y su primer criterio
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (evaluations.length > 0) {
      initial.add(0); // Expandir la primera evaluación
    }
    return initial;
  });

  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (evaluations.length > 0 && evaluations[0].evaluation_criteria.length > 0) {
      initial.add(`0-${evaluations[0].evaluation_criteria[0].criterion.id}`); // Expandir el primer criterio
    }
    return initial;
  });

  const [expandedSubcriteria, setExpandedSubcriteria] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (evaluations.length > 0 && 
        evaluations[0].evaluation_criteria.length > 0 &&
        evaluations[0].evaluation_criteria[0].criterion.subcriteria &&
        evaluations[0].evaluation_criteria[0].criterion.subcriteria.length > 0) {
      const firstCriterion = evaluations[0].evaluation_criteria[0].criterion;
      const firstSubcriterio = firstCriterion.subcriteria![0]; // Usamos ! porque ya validamos que existe
      initial.add(`0-${firstCriterion.id}-${firstSubcriterio.id}`); // Expandir el primer subcriterio
    }
    return initial;
  });

  const toggleEvaluation = (evaluationIndex: number) => {
    const newExpanded = new Set(expandedEvaluations);
    if (newExpanded.has(evaluationIndex)) {
      newExpanded.delete(evaluationIndex);
    } else {
      newExpanded.add(evaluationIndex);
    }
    setExpandedEvaluations(newExpanded);
  };

  const toggleCriterion = (evaluationIndex: number, criterionId: number) => {
    const key = `${evaluationIndex}-${criterionId}`;
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCriteria(newExpanded);
  };

  const toggleSubcriterion = (evaluationIndex: number, criterionId: number, subcriterionId: number) => {
    const key = `${evaluationIndex}-${criterionId}-${subcriterionId}`;
    const newExpanded = new Set(expandedSubcriteria);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubcriteria(newExpanded);
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge completed">✓ Completada</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">🔄 En progreso</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">❌ Cancelada</span>;
      default:
        return <span className="status-badge unknown">❓ Desconocido</span>;
    }
  };

  // Debug: log de las evaluaciones para verificar los datos
  console.log('🔍 [EvaluationSidebar] Evaluaciones recibidas:', evaluations);
  console.log('🔍 [EvaluationSidebar] AllMetrics:', allMetrics);

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="evaluation-sidebar">
        <div className="sidebar-header">
          <h3>No hay evaluaciones</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-sidebar">
      <div className="sidebar-header">
        <h3>Evaluaciones del Proyecto</h3>
        <p>{evaluations.length} evaluación{evaluations.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="sidebar-content">
        {evaluations.map((evaluation, evaluationIndex) => {
          const isEvaluationExpanded = expandedEvaluations.has(evaluationIndex);
          
          return (
            <div key={evaluation.id} className="evaluation-group">
              <button
                className={`evaluation-button ${isEvaluationExpanded ? 'expanded' : ''}`}
                onClick={() => toggleEvaluation(evaluationIndex)}
              >
                <span className="expand-icon">
                  {isEvaluationExpanded ? '▼' : '▶'}
                </span>
                <div className="evaluation-info">
                  <span className="evaluation-title">
                    {evaluation.standard.name} v{evaluation.standard.version}
                  </span>
                  {getStatusBadge(evaluation.status)}
                </div>
              </button>

              {isEvaluationExpanded && (
                <div className="criteria-container">
                  {evaluation.evaluation_criteria.map((evalCriterion) => {
                    const criterion = evalCriterion.criterion;
                    const criterionKey = `${evaluationIndex}-${criterion.id}`;
                    const isCriterionExpanded = expandedCriteria.has(criterionKey);

                    return (
                      <div key={evalCriterion.id} className="criterion-group">
                        <button
                          className={`criterion-button ${isCriterionExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleCriterion(evaluationIndex, criterion.id)}
                        >
                          <span className="expand-icon">
                            {isCriterionExpanded ? '▼' : '▶'}
                          </span>
                          <div className="criterion-info">
                            <span className="criterion-name">{criterion.name}</span>
                            <span className="importance-percentage">
                              {evalCriterion.importance_percentage}%
                            </span>
                          </div>
                        </button>

                        {isCriterionExpanded && (
                          <div className="subcriteria-container">
                            {criterion.subcriteria && criterion.subcriteria.length > 0 ? (
                              criterion.subcriteria.map((subcriterion) => {
                              const subcriterionKey = `${evaluationIndex}-${criterion.id}-${subcriterion.id}`;
                              const isSubcriterionExpanded = expandedSubcriteria.has(subcriterionKey);

                              return (
                                <div key={subcriterion.id} className="subcriterion-group">
                                  <button
                                    className={`subcriterion-button ${isSubcriterionExpanded ? 'expanded' : ''}`}
                                    onClick={() => toggleSubcriterion(evaluationIndex, criterion.id, subcriterion.id)}
                                  >
                                    <span className="expand-icon">
                                      {isSubcriterionExpanded ? '▼' : '▶'}
                                    </span>
                                    <div className="subcriterion-info">
                                      <span className="subcriterion-name">{subcriterion.name}</span>
                                      <span className="metrics-count">
                                        {(subcriterion.metrics?.length || 0)} métrica{(subcriterion.metrics?.length || 0) !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </button>

                                  {isSubcriterionExpanded && (
                                    <div className="metrics-container">
                                      {subcriterion.metrics && subcriterion.metrics.length > 0 ? (
                                        subcriterion.metrics.map((metric) => {
                                        const metricGlobalIndex = getMetricGlobalIndex(metric);
                                        const isCompleted = isMetricCompleted(metric);
                                        const isActive = metricGlobalIndex === currentMetricIndex;

                                        return (
                                          <button
                                            key={metric.id}
                                            className={`metric-button ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                            onClick={() => onMetricSelect(evaluationIndex, metricGlobalIndex)}
                                          >
                                            <div className="metric-info">
                                              <span className="metric-name">{metric.name}</span>
                                              <span className="metric-status">
                                                {isCompleted ? '✓' : '○'}
                                              </span>
                                            </div>
                                          </button>
                                        );
                                        })
                                      ) : (
                                        <div style={{ padding: '0.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
                                          No hay métricas configuradas
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                              })
                            ) : (
                              <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                                Este criterio no tiene subcriteria configurados.
                                <br />
                                <small>Las métricas se configurarán directamente en el criterio.</small>
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