/**
 * Types and interfaces for Data Entry module
 */

export interface Variable {
  id: number;
  metric_id: number;
  symbol: string;
  description: string;
  state: string;
  [key: string]: unknown;
}

export interface Metric {
  id: number;
  name: string;
  description: string;
  formula: string;
  code?: string;
  variables?: Variable[];
}

export interface Subcriterion {
  id: number;
  name: string;
  description?: string;
  criterion_id: number;
  state: string;
  metrics?: Metric[];
  created_at: string;
  updated_at: string;
}

// API response types
export interface EvaluationMetricAPI {
  id?: number;
  metric?: {
    id: number;
    name: string;
    description: string;
    formula: string;
    code?: string;
    sub_criterion_id?: number;
    variables?: Array<{
      id: number;
      symbol: string;
      description: string;
      state: string;
    }>;
  };
}

export interface EvaluationCriterionAPI {
  id: number;
  evaluation_id: number;
  criterion_id: number;
  importance_level: string;
  importance_percentage: number;
  criterion?: {
    id: number;
    name: string;
    description?: string;
    sub_criteria?: Array<{
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
  evaluation_metrics?: EvaluationMetricAPI[];
}

export interface EvaluationDataAPI {
  id: number;
  project_id: number;
  standard_id: number;
  creation_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  standard?: {
    id: number;
    name: string;
    version: string;
  };
  evaluation_criteria?: EvaluationCriterionAPI[];
}

export interface Evaluation {
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
      sub_criteria?: Array<{
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
    evaluation_metrics?: EvaluationMetricAPI[];
  }>;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
}

export interface SubcriterionInput {
  id: number;
  name: string;
  description?: string;
  criterion_id: number;
  state: string;
  metrics?: Metric[];
  created_at: string;
  updated_at: string;
}
