import { apiClient } from '../shared/api-client';
import { 
  CriterionSearchResult, 
  SubCriterionSearchResult, 
  MetricSearchResult 
} from '../../types/parameterization-search.types';

// Types
export interface Standard {
  id: number;
  name: string;
  description: string | null;
  version: string;
  state: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  criteria?: Criterion[];
}

export interface Criterion {
  id: number;
  standard_id: number;
  name: string;
  description: string | null;
  state: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  sub_criteria?: SubCriterion[];
}

export interface SubCriterion {
  id: number;
  criterion_id: number;
  name: string;
  description: string | null;
  state: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  metrics?: Metric[];
}

export interface Metric {
  id: number;
  sub_criterion_id: number;
  name: string;
  description: string | null;
  code: string | null;
  formula: string | null;
  desired_threshold: number | null;
  state: 'active' | 'inactive';
  variables?: FormulaVariable[];
}

export interface FormulaVariable {
  id: number;
  metric_id: number;
  symbol: string;
  description: string;
  state: 'active' | 'inactive';
}

export interface QueryParams {
  state?: 'active' | 'inactive' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

// DTOs
export interface CreateStandardDto {
  name: string;
  description?: string;
  version?: string;
}

export type UpdateStandardDto = Partial<CreateStandardDto>;

export interface CreateCriterionDto {
  name: string;
  description?: string;
  standard_id: number;
}

export type UpdateCriterionDto = Partial<CreateCriterionDto>;

export interface CreateSubCriterionDto {
  name: string;
  description?: string;
  criterion_id: number;
}

export type UpdateSubCriterionDto = Partial<CreateSubCriterionDto>;

export interface CreateMetricDto {
  name: string;
  description?: string;
  sub_criterion_id: number;
  code?: string;
  formula?: string;
  desired_threshold?: number;
}

export type UpdateMetricDto = Partial<CreateMetricDto>;

export interface CreateFormulaVariableDto {
  symbol: string;
  description?: string;
  metric_id: number;
}

export type UpdateFormulaVariableDto = Partial<CreateFormulaVariableDto>;

export interface UpdateStateDto {
  state: 'active' | 'inactive';
}

/**
 * API service for parameterization endpoints
 */
export const parameterizationApi = {
  // === Standards Endpoints ===
  
  /**
   * Create a new standard
   */
  async createStandard(data: CreateStandardDto): Promise<Standard> {
    return apiClient.post('/parameterization/standards', data);
  },

  /**
   * Get all standards (only active by default)
   */
  async getStandards(params: QueryParams = { state: 'active' }): Promise<Standard[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    return apiClient.get(`/parameterization/standards${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get standard by ID
   */
  async getStandardById(id: number): Promise<Standard> {
    return apiClient.get(`/parameterization/standards/${id}`);
  },

  /**
   * Update an existing standard
   */
  async updateStandard(id: number, data: UpdateStandardDto): Promise<Standard> {
    return apiClient.patch(`/parameterization/standards/${id}`, data);
  },

  /**
   * Update standard state (active/inactive) - causes cascade effect
   */
  async updateStandardState(id: number, data: UpdateStateDto): Promise<void> {
    return apiClient.patch(`/parameterization/standards/${id}/state`, data);
  },

  // === Criteria Endpoints ===

  /**
   * Create a new criterion
   */
  async createCriterion(data: CreateCriterionDto): Promise<Criterion> {
    return apiClient.post('/parameterization/criteria', data);
  },

  /**
   * Get criteria for a specific standard (only active by default)
   */
  async getCriteriaByStandard(
    standardId: number,
    params: QueryParams = { state: 'active' }
  ): Promise<Criterion[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    return apiClient.get(
      `/parameterization/standards/${standardId}/criteria${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get criterion by ID
   */
  async getCriterionById(id: number): Promise<Criterion> {
    return apiClient.get(`/parameterization/criteria/${id}`);
  },

  /**
   * Update an existing criterion
   */
  async updateCriterion(id: number, data: UpdateCriterionDto): Promise<Criterion> {
    return apiClient.patch(`/parameterization/criteria/${id}`, data);
  },

  /**
   * Update criterion state (active/inactive) - causes cascade effect
   */
  async updateCriterionState(id: number, data: UpdateStateDto): Promise<void> {
    return apiClient.patch(`/parameterization/criteria/${id}/state`, data);
  },

  // === Sub-Criteria Endpoints ===

  /**
   * Create a new sub-criterion
   */
  async createSubCriterion(data: CreateSubCriterionDto): Promise<SubCriterion> {
    return apiClient.post('/parameterization/sub-criteria', data);
  },

  /**
   * Get sub-criteria for a specific criterion (only active by default)
   */
  async getSubCriteriaByCriterion(
    criterionId: number,
    params: QueryParams = { state: 'active' }
  ): Promise<SubCriterion[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    return apiClient.get(
      `/parameterization/criteria/${criterionId}/sub-criteria${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get sub-criterion by ID
   */
  async getSubCriterionById(id: number): Promise<SubCriterion> {
    return apiClient.get(`/parameterization/sub-criteria/${id}`);
  },

  /**
   * Update an existing sub-criterion
   */
  async updateSubCriterion(id: number, data: UpdateSubCriterionDto): Promise<SubCriterion> {
    return apiClient.patch(`/parameterization/sub-criteria/${id}`, data);
  },

  /**
   * Update sub-criterion state (active/inactive) - causes cascade effect
   */
  async updateSubCriterionState(id: number, data: UpdateStateDto): Promise<void> {
    return apiClient.patch(`/parameterization/sub-criteria/${id}/state`, data);
  },

  // === Metrics Endpoints ===

  /**
   * Create a new metric
   */
  async createMetric(data: CreateMetricDto): Promise<Metric> {
    return apiClient.post('/parameterization/metrics', data);
  },

  /**
   * Get metrics for a specific sub-criterion (only active by default)
   */
  async getMetricsBySubCriterion(
    subCriterionId: number,
    params?: QueryParams
  ): Promise<Metric[]> {
    const effectiveParams = params ?? { state: 'active' };
    const queryString = new URLSearchParams(
      Object.entries(effectiveParams)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const baseUrl = `/parameterization/sub-criteria/${subCriterionId}/metrics`;
    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    return apiClient.get(fullUrl);
  },

  /**
   * Get metric by ID
   */
  async getMetricById(id: number): Promise<Metric> {
    return apiClient.get(`/parameterization/metrics/${id}`);
  },

  /**
   * Update an existing metric
   */
  async updateMetric(id: number, data: UpdateMetricDto): Promise<Metric> {
    return apiClient.patch(`/parameterization/metrics/${id}`, data);
  },

  /**
   * Update metric state (active/inactive) - causes cascade effect
   */
  async updateMetricState(id: number, data: UpdateStateDto): Promise<void> {
    return apiClient.patch(`/parameterization/metrics/${id}/state`, data);
  },

  // === Formula Variables Endpoints ===

  /**
   * Create a new formula variable
   */
  async createVariable(data: CreateFormulaVariableDto): Promise<FormulaVariable> {
    return apiClient.post('/parameterization/variables', data);
  },

  /**
   * Get variables for a specific metric (only active by default)
   */
  async getVariablesByMetric(
    metricId: number,
    params?: QueryParams
  ): Promise<FormulaVariable[]> {
    const effectiveParams = params ?? { state: 'active' };
    const queryString = new URLSearchParams(
      Object.entries(effectiveParams)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const baseUrl = `/parameterization/metrics/${metricId}/variables`;
    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    return apiClient.get(fullUrl);
  },

  /**
   * Get variable by ID
   */
  async getVariableById(id: number): Promise<FormulaVariable> {
    return apiClient.get(`/parameterization/variables/${id}`);
  },

  /**
   * Update an existing variable
   */
  async updateVariable(id: number, data: UpdateFormulaVariableDto): Promise<FormulaVariable> {
    return apiClient.patch(`/parameterization/variables/${id}`, data);
  },

  /**
   * Update variable state (active/inactive)
   */
  async updateVariableState(id: number, data: UpdateStateDto): Promise<void> {
    return apiClient.patch(`/parameterization/variables/${id}/state`, data);
  },

  /**
   * Deactivate a variable (legacy method for compatibility)
   * @deprecated Use updateVariableState instead
   */
  async deleteVariable(id: number): Promise<void> {
    return this.updateVariableState(id, { state: 'inactive' });
  },

  // === SEARCH ENDPOINTS FOR INTELLIGENT AUTOCOMPLETE ===

  /**
   * Search criteria by name (for autocomplete)
   * Returns criteria from any standard for reuse
   */
  async searchCriteria(search: string): Promise<CriterionSearchResult[]> {
    if (!search || search.trim().length < 2) {
      return [];
    }
    const queryString = new URLSearchParams({ search: search.trim() }).toString();
    return apiClient.get(`/parameterization/search/criteria?${queryString}`);
  },

  /**
   * Search sub-criteria by name (for autocomplete)
   * Returns sub-criteria WITH their associated metrics for intelligent selection
   */
  async searchSubCriteria(search: string): Promise<SubCriterionSearchResult[]> {
    if (!search || search.trim().length < 2) {
      return [];
    }
    const queryString = new URLSearchParams({ search: search.trim() }).toString();
    return apiClient.get(`/parameterization/search/sub-criteria?${queryString}`);
  },

  /**
   * Search metrics by name (for autocomplete)
   * Returns metrics from any standard for reuse
   */
  async searchMetrics(search: string): Promise<MetricSearchResult[]> {
    if (!search || search.trim().length < 2) {
      return [];
    }
    const queryString = new URLSearchParams({ search: search.trim() }).toString();
    return apiClient.get(`/parameterization/search/metrics?${queryString}`);
  }
};
