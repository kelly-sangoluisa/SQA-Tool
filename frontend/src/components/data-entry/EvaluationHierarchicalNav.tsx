import { useState, useCallback } from 'react';
import { HierarchicalNavigation, BaseCriterion, BaseSubCriterion } from '../shared/HierarchicalNavigation';

// Tipos extendidos que cumplen con las interfaces base
export interface EvaluationCriterion extends BaseCriterion {
  description?: string;
  importance_level: string;
  importance_percentage: number;
  evaluation_id: number;
  criterion_id: number;
}

export interface EvaluationSubCriterion extends BaseSubCriterion {
  description?: string;
  metrics?: Metric[];
  created_at: string;
  updated_at: string;
}

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
      state: 'active' | 'inactive';
      subcriteria?: Array<{
        id: number;
        name: string;
        description?: string;
        criterion_id: number;
        state: 'active' | 'inactive';
        metrics?: Metric[];
        created_at: string;
        updated_at: string;
      }>;
    };
  }>;
}

interface EvaluationHierarchicalNavProps {
  evaluation: Evaluation;
  currentMetricIndex: number;
  allMetrics: Metric[];
  variableValues: Record<string, string>;
  onMetricSelect: (metricGlobalIndex: number) => void;
}

export function EvaluationHierarchicalNav({
  evaluation,
  currentMetricIndex,
  allMetrics,
  variableValues,
  onMetricSelect
}: EvaluationHierarchicalNavProps) {
  const [selectedCriterion, setSelectedCriterion] = useState<EvaluationCriterion | null>(null);
  const [selectedSubCriterion, setSelectedSubCriterion] = useState<EvaluationSubCriterion | null>(null);

  // Convertir evaluation_criteria a criterios compatibles con HierarchicalNavigation
  const criteria: EvaluationCriterion[] = evaluation.evaluation_criteria.map(ec => ({
    id: ec.criterion.id,
    name: ec.criterion.name,
    description: ec.criterion.description,
    state: ec.criterion.state || 'active',
    importance_level: ec.importance_level,
    importance_percentage: ec.importance_percentage,
    evaluation_id: ec.evaluation_id,
    criterion_id: ec.criterion_id
  }));

  // Función para cargar subcriterios de un criterio
  const loadSubCriteria = useCallback(async (criterionId: number): Promise<EvaluationSubCriterion[]> => {
    const evalCriterion = evaluation.evaluation_criteria.find(
      ec => ec.criterion.id === criterionId
    );

    if (!evalCriterion?.criterion.subcriteria) {
      return [];
    }

    return evalCriterion.criterion.subcriteria.map(sc => ({
      id: sc.id,
      name: sc.name,
      description: sc.description,
      state: sc.state || 'active',
      criterion_id: sc.criterion_id,
      metrics: sc.metrics,
      created_at: sc.created_at,
      updated_at: sc.updated_at
    }));
  }, [evaluation]);

  // Funciones dummy para actualizar estado (no se permite en data-entry)
  const updateCriterionState = useCallback(async (criterionId: number, state: 'active' | 'inactive') => {
    console.log('State update not allowed in data-entry mode:', criterionId, state);
  }, []);

  const updateSubCriterionState = useCallback(async (subCriterionId: number, state: 'active' | 'inactive') => {
    console.log('State update not allowed in data-entry mode:', subCriterionId, state);
  }, []);

  // Handlers para selección
  const handleCriterionSelect = useCallback((criterion: EvaluationCriterion) => {
    setSelectedCriterion(criterion);
    setSelectedSubCriterion(null);
  }, []);

  const handleSubCriterionSelect = useCallback((criterion: EvaluationCriterion, subCriterion: EvaluationSubCriterion) => {
    setSelectedCriterion(criterion);
    setSelectedSubCriterion(subCriterion);
  }, []);

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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con información de la evaluación */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid rgb(229 231 235)',
        background: 'var(--color-white)'
      }}>
        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: 'var(--color-primary)' 
        }}>
          {evaluation.standard.name} v{evaluation.standard.version}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '0.375rem',
            background: evaluation.status === 'completed' ? '#dcfce7' : 
                       evaluation.status === 'in_progress' ? '#dbeafe' : '#fee2e2',
            color: evaluation.status === 'completed' ? '#166534' : 
                   evaluation.status === 'in_progress' ? '#1e40af' : '#991b1b',
            fontWeight: '500'
          }}>
            {evaluation.status === 'completed' ? '✓ Completada' :
             evaluation.status === 'in_progress' ? '🔄 En progreso' : '❌ Cancelada'}
          </span>
        </div>
      </div>

      {/* Navegación jerárquica */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <HierarchicalNavigation<EvaluationCriterion, EvaluationSubCriterion>
          criteria={criteria}
          loading={false}
          parentId={evaluation.id}
          loadSubCriteria={loadSubCriteria}
          updateCriterionState={updateCriterionState}
          updateSubCriterionState={updateSubCriterionState}
          onCriterionSelect={handleCriterionSelect}
          onSubCriterionSelect={handleSubCriterionSelect}
          headerTitle="Criterios de Evaluación"
          showCreateButton={false}
          allowEdit={false}
          showStateToggles={false}
          emptyMessage="No hay criterios en esta evaluación"
          emptySubCriteriaMessage="No hay subcriterios configurados"
          subCriteriaTitle="Subcriterios"
        />
      </div>

      {/* Panel de métricas si hay un subcriterio seleccionado */}
      {selectedSubCriterion && selectedSubCriterion.metrics && (
        <div style={{ 
          borderTop: '2px solid var(--color-primary)',
          background: 'rgb(249 250 251)',
          maxHeight: '40%',
          overflow: 'auto'
        }}>
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'var(--color-white)',
            borderBottom: '1px solid rgb(229 231 235)',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: '0.875rem', 
              fontWeight: '600',
              color: 'var(--color-secondary)'
            }}>
              Métricas de: {selectedSubCriterion.name}
            </h4>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '0.75rem', 
              color: 'rgb(107 114 128)' 
            }}>
              {selectedSubCriterion.metrics.length} métrica{selectedSubCriterion.metrics.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div style={{ padding: '0.5rem' }}>
            {selectedSubCriterion.metrics.length === 0 ? (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: 'rgb(107 114 128)',
                fontSize: '0.875rem'
              }}>
                No hay métricas configuradas para este subcriterio
              </div>
            ) : (
              selectedSubCriterion.metrics.map((metric) => {
                const metricGlobalIndex = getMetricGlobalIndex(metric);
                const isCompleted = isMetricCompleted(metric);
                const isActive = metricGlobalIndex === currentMetricIndex;

                return (
                  <button
                    key={metric.id}
                    onClick={() => onMetricSelect(metricGlobalIndex)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      marginBottom: '0.25rem',
                      background: isActive ? 'var(--color-primary)' : 'var(--color-white)',
                      color: isActive ? 'white' : 'var(--color-text)',
                      border: isActive ? '2px solid var(--color-primary-dark)' : '1px solid rgb(229 231 235)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? '600' : '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgb(243 244 246)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-white)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <span style={{ flex: 1 }}>{metric.name}</span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isCompleted 
                        ? (isActive ? 'rgba(255,255,255,0.3)' : '#10b981')
                        : (isActive ? 'rgba(255,255,255,0.2)' : 'rgb(229 231 235)'),
                      color: isCompleted 
                        ? (isActive ? 'white' : 'white')
                        : (isActive ? 'white' : 'rgb(107 114 128)'),
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {isCompleted ? '✓' : '○'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
