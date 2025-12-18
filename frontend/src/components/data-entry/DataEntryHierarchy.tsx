'use client';

import { MultiLevelHierarchy, BaseGroup, BaseLevel2Item, BaseLevel3Item, BaseLevel4Item } from '../shared/hierarchy/MultiLevelHierarchy';

// Interfaces específicas que extienden las interfaces base
interface EvaluationGroup extends BaseGroup {
  id: number;
  name: string;
  version: string;
  standard_id: number;
  project_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
}

interface EvaluationCriterion extends BaseLevel2Item {
  id: number;
  name: string;
  description?: string;
  importance_level: string;
  importance_percentage: number;
}

interface EvaluationSubcriterion extends BaseLevel3Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
  state: string;
}

interface EvaluationMetric extends BaseLevel4Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
  formula: string;
  variables?: Array<{
    id: number;
    metric_id: number;
    symbol: string;
    description: string;
    state: string;
  }>;
}

// Interfaces completas del sistema
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

/* Unused interface removed - Subcriterion */

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

interface DataEntryHierarchyProps {
  evaluations: Evaluation[];
  currentMetricIndex: number;
  allMetrics: Metric[];
  variableValues: Record<string, string>;
  onMetricSelect: (evaluationIndex: number, metricGlobalIndex: number) => void;
  finalizedEvaluations?: Set<number>;
}

/**
 * Componente wrapper que usa MultiLevelHierarchy para el módulo de Data Entry
 */
export function DataEntryHierarchy({
  evaluations,
  currentMetricIndex,
  allMetrics,
  variableValues,
  onMetricSelect,
  finalizedEvaluations = new Set()
}: DataEntryHierarchyProps) {
  
  // Convertir evaluations a grupos
  const groups: EvaluationGroup[] = evaluations.map(evaluation => ({
    id: evaluation.id,
    name: evaluation.standard.name,
    version: evaluation.standard.version,
    standard_id: evaluation.standard_id,
    project_id: evaluation.project_id,
    status: evaluation.status
  }));

  // Función para obtener criterios de una evaluación
  const getLevel2Items = (group: EvaluationGroup): EvaluationCriterion[] => {
    const evaluation = evaluations.find(e => e.id === group.id);
    if (!evaluation) return [];

    return evaluation.evaluation_criteria.map(ec => ({
      id: ec.criterion.id,
      name: ec.criterion.name,
      description: ec.criterion.description,
      importance_level: ec.importance_level,
      importance_percentage: ec.importance_percentage
    }));
  };

  // Función para obtener subcriterios de un criterio
  const getLevel3Items = (criterion: EvaluationCriterion): EvaluationSubcriterion[] => {
    // Buscar el criterio en todas las evaluaciones
    for (const evaluation of evaluations) {
      const evalCriterion = evaluation.evaluation_criteria.find(
        ec => ec.criterion.id === criterion.id
      );
      
      if (evalCriterion?.criterion.subcriteria) {
        return evalCriterion.criterion.subcriteria.map(sc => ({
          id: sc.id,
          name: sc.name,
          description: sc.description,
          parent_id: sc.criterion_id,
          state: sc.state
        }));
      }
    }
    return [];
  };

  // Función para obtener métricas de un subcriterio
  const getLevel4Items = (subcriterion: EvaluationSubcriterion): EvaluationMetric[] => {
    // Buscar el subcriterio en todas las evaluaciones
    for (const evaluation of evaluations) {
      for (const evalCriterion of evaluation.evaluation_criteria) {
        const sc = evalCriterion.criterion.subcriteria?.find(
          s => s.id === subcriterion.id
        );
        
        if (sc?.metrics) {
          return sc.metrics.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            parent_id: sc.id,
            formula: m.formula,
            variables: m.variables
          }));
        }
      }
    }
    return [];
  };

  // Función para determinar si una métrica está completada
  const isMetricCompleted = (metric: EvaluationMetric): boolean => {
    if (!metric.variables || metric.variables.length === 0) return false;
    
    return metric.variables.every(variable => {
      const key = `metric-${metric.id}-${variable.symbol}`;
      const value = variableValues[key];
      return value !== undefined && value !== '';
    });
  };

  // Función auxiliar para verificar si todas las variables de una métrica tienen valores
  const hasAllVariableValues = (metric: Metric): boolean => {
    if (!metric.variables) return false;
    
    return metric.variables.every(v => {
      const key = `metric-${metric.id}-${v.symbol}`;
      return variableValues[key];
    });
  };

  // Tipo para subcriterio con métricas
  type SubcriterionWithMetrics = NonNullable<Evaluation['evaluation_criteria'][0]['criterion']['subcriteria']>[0];

  // Función auxiliar para contar métricas de un subcriterio
  const countSubcriterionMetrics = (sc: SubcriterionWithMetrics): { completed: number; total: number } => {
    if (!sc.metrics) return { completed: 0, total: 0 };
    
    const total = sc.metrics.length;
    const completed = sc.metrics.filter(hasAllVariableValues).length;
    
    return { completed, total };
  };

  // Función auxiliar para contar métricas de un criterio
  const countCriterionMetrics = (ec: Evaluation['evaluation_criteria'][0]): { completed: number; total: number } => {
    if (!ec.criterion.subcriteria) return { completed: 0, total: 0 };
    
    return ec.criterion.subcriteria.reduce((acc, sc) => {
      const counts = countSubcriterionMetrics(sc);
      return {
        completed: acc.completed + counts.completed,
        total: acc.total + counts.total
      };
    }, { completed: 0, total: 0 });
  };

  // Función para calcular progreso de una evaluación
  const getGroupProgress = (group: EvaluationGroup): { completed: number; total: number } => {
    const evaluation = evaluations.find(e => e.id === group.id);
    if (!evaluation) return { completed: 0, total: 0 };

    return evaluation.evaluation_criteria.reduce((acc, ec) => {
      const counts = countCriterionMetrics(ec);
      return {
        completed: acc.completed + counts.completed,
        total: acc.total + counts.total
      };
    }, { completed: 0, total: 0 });
  };

  // Callback cuando se selecciona una métrica
  const handleMetricSelect = (groupIndex: number, metric: EvaluationMetric) => {
    const metricGlobalIndex = allMetrics.findIndex(m => m.id === metric.id);
    if (metricGlobalIndex !== -1) {
      onMetricSelect(groupIndex, metricGlobalIndex);
    }
  };

  // Verificar si un grupo (evaluación) está completamente llenado Y finalizado
  const isGroupCompleted = (group: EvaluationGroup): boolean => {
    // Debe estar finalizada en el backend (confirmado en modal)
    return finalizedEvaluations.has(group.id);
  };

  // Obtener el ID de la métrica activa actual
  const activeMetricId = allMetrics[currentMetricIndex]?.id;

  return (
    <MultiLevelHierarchy<EvaluationGroup, EvaluationCriterion, EvaluationSubcriterion, EvaluationMetric>
      groups={groups}
      getLevel2Items={getLevel2Items}
      getLevel3Items={getLevel3Items}
      getLevel4Items={getLevel4Items}
      onLevel4Select={handleMetricSelect}
      activeLevel4ItemId={activeMetricId}
      isItemCompleted={isMetricCompleted}
      getGroupProgress={getGroupProgress}
      isGroupCompleted={isGroupCompleted}
      labels={{
        header: 'Evaluaciones',
        level1: 'Evaluación',
        level2: 'Criterio',
        level3: 'Subcriterio',
        level4: 'Métrica',
        emptyGroups: 'No hay evaluaciones disponibles',
        emptyLevel2: 'No hay criterios configurados',
        emptyLevel3: 'No hay subcriterios configurados',
        emptyLevel4: 'No hay métricas configuradas'
      }}
      showLevel4={true}
    />
  );
}
