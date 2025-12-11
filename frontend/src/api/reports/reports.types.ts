/**
 * Tipos para el módulo de Resultados/Reportes
 */

export interface EvaluationListItem {
  evaluation_id: number;
  project_id: number;
  project_name: string;
  standard_name: string;
  created_at: string;
  final_score: number | null;
  has_results: boolean;
}

export interface MetricResult {
  metric_name: string;
  calculated_value: number;
  weighted_value: number;
  weight: number;
}

export interface CriterionResult {
  criterion_name: string;
  importance_level: 'A' | 'M' | 'B' | 'NA'; // A=Alta, M=Media, B=Baja, NA=No Aplicable
  importance_percentage: number;
  final_score: number;
  metrics: MetricResult[];
}

export interface EvaluationReport {
  evaluation_id: number;
  project_name: string;
  standard_name: string;
  created_at: string;
  final_score: number;
  conclusion: string;
  criteria_results: CriterionResult[];
}

export interface EvaluationStats {
  total_criteria: number;
  total_metrics: number;
  average_criteria_score: number;
  best_criterion: {
    name: string;
    score: number;
  };
  worst_criterion: {
    name: string;
    score: number;
  };
  score_by_importance: {
    high: number;
    medium: number;
    low: number;
  };
}
