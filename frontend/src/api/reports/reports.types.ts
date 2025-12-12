/**
 * Tipos para el módulo de Resultados/Reportes
 */

export interface ProjectSummary {
  project_id: number;
  project_name: string;
  project_description: string | null;
  minimum_threshold: number | null;
  final_project_score: number | null;
  meets_threshold: boolean;
  status: string;
  evaluation_count: number;
  created_at: string;
  updated_at: string;
}

export interface EvaluationListItem {
  evaluation_id: number;
  project_id: number;
  project_name: string;
  standard_name: string;
  created_at: string;
  final_score: number | null;
  has_results: boolean;
}

export interface VariableResult {
  symbol: string;
  description: string;
  value: number;
}

export interface MetricResult {
  metric_name: string;
  metric_code: string;
  metric_description: string;
  formula: string;
  calculated_value: number;
  weighted_value: number;
  desired_threshold: number;
  meets_threshold: boolean;
  variables: VariableResult[];
}

export interface CriterionResult {
  criterion_name: string;
  criterion_description: string;
  importance_level: 'A' | 'M' | 'B' | 'NA'; // A=Alta, M=Media, B=Baja, NA=No Aplicable
  importance_percentage: number;
  final_score: number;
  metrics: MetricResult[];
}

export interface EvaluationReport {
  evaluation_id: number;
  project_id: number;
  project_name: string;
  created_by_name: string;
  standard_name: string;
  created_at: string;
  final_score: number;
  project_threshold: number;
  meets_threshold: boolean;
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
/**
 * Project Report Types - For project-level results
 */
export interface ProjectEvaluationSummary {
  evaluation_id: number;
  standard_name: string;
  created_at: string;
  final_score: number;
  meets_evaluation_threshold: boolean;
}

export interface ProjectReport {
  project_id: number;
  project_name: string;
  project_description: string | null;
  created_by_name: string;
  created_at: string;
  final_project_score: number;
  minimum_threshold: number;
  meets_threshold: boolean;
  status: string;
  evaluations: ProjectEvaluationSummary[];
}

export interface ProjectStats {
  total_evaluations: number;
  completed_evaluations: number;
  average_evaluation_score: number;
  highest_evaluation: {
    standard_name: string;
    score: number;
  };
  lowest_evaluation: {
    standard_name: string;
    score: number;
  };
}