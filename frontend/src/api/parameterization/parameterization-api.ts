import { apiClient } from '../shared/api-client';

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
}

export interface QueryParams {
  state?: 'active' | 'inactive' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * API service for parameterization endpoints
 */
export const parameterizationApi = {
  /**
   * Get all standards (only active by default)
   */
  async getStandards(params: QueryParams = { state: 'active' }): Promise<Standard[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
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
   * Get criteria for a specific standard (only active by default)
   */
  async getCriteriaByStandard(
    standardId: number,
    params: QueryParams = { state: 'active' }
  ): Promise<Criterion[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
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
   * Get sub-criteria for a specific criterion (only active by default)
   */
  async getSubCriteriaByCriterion(
    criterionId: number,
    params: QueryParams = { state: 'active' }
  ): Promise<SubCriterion[]> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
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
};
