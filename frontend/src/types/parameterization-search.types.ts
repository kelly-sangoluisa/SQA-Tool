/**
 * Tipos para búsqueda y autocompletado inteligente
 */

export interface SearchQuery {
  search?: string;
}

export interface FormulaVariableSearchResult {
  variable_id: number;
  symbol: string;
  description: string;
}

export interface CriterionSearchResult {
  criterion_id: number;
  name: string;
  description?: string;
  standard_id: number;
  standard_name: string;
}

export interface MetricSearchResult {
  metric_id: number;
  code?: string;
  name: string;
  description?: string;
  formula?: string;
  desired_threshold?: number;
  variables?: FormulaVariableSearchResult[];
}

export interface SubCriterionSearchResult {
  sub_criterion_id: number;
  name: string;
  description?: string;
  criterion_id: number;
  criterion_name: string;
  standard_id: number;
  standard_name: string;
  metrics: MetricSearchResult[];
  metrics_count: number;
}
