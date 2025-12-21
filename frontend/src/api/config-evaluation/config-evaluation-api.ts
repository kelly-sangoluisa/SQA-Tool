import { apiClient } from '../shared/api-client';

// Types
export type ImportanceLevel = 'A' | 'M' | 'B';

export interface Project {
  id: number;
  name: string;
  description?: string;
  creator_user_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  final_project_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: number;
  project_id: number;
  standard_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface EvaluationCriterion {
  id: number;
  evaluation_id: number;
  criterion_id: number;
  importance_level: ImportanceLevel;
  importance_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: number;
  name: string;
  formula?: string;
  sub_criterion_id: number;
}

export interface SubCriterion {
  id: number;
  name: string;
  description?: string;
  metrics?: Metric[];
}

export interface CriterionWithMetrics {
  id: number;
  name: string;
  description?: string;
  sub_criteria: SubCriterion[];
}

// DTOs
export interface CreateProjectDto {
  name: string;
  description?: string;
  minimum_threshold?: number;
  creator_user_id: number;
}

export interface CreateEvaluationDto {
  project_id: number;
  standard_id: number;
}

export interface CreateEvaluationCriterionDto {
  evaluation_id: number;
  criterion_id: number;
  importance_level: ImportanceLevel;
  importance_percentage: number;
}

export interface BulkCreateEvaluationCriteriaDto {
  criteria: CreateEvaluationCriterionDto[];
}

export interface CreateEvaluationMetricDto {
  eval_criterion_id: number;
  metric_id: number;
}

export interface BulkCreateEvaluationMetricsDto {
  metrics: CreateEvaluationMetricDto[];
}

/**
 * API service for configuration evaluation endpoints
 */
export const configEvaluationApi = {
  /**
   * Create a new project
   * The creator_user_id is automatically set from the authenticated user
   */
  async createProject(data: CreateProjectDto): Promise<Project> {
    return apiClient.post('/config-evaluation/projects', data);
  },

  /**
   * Create a new evaluation
   * Should be called after creating the project
   */
  async createEvaluation(data: CreateEvaluationDto): Promise<Evaluation> {
    return apiClient.post('/config-evaluation/evaluations', data);
  },

  /**
   * Create a single evaluation criterion
   */
  async createEvaluationCriterion(data: CreateEvaluationCriterionDto): Promise<EvaluationCriterion> {
    return apiClient.post('/config-evaluation/evaluation-criteria', data);
  },

  /**
   * Create multiple evaluation criteria in bulk
   * Validates that the sum of percentages equals 100%
   */
  async bulkCreateEvaluationCriteria(
    data: BulkCreateEvaluationCriteriaDto
  ): Promise<EvaluationCriterion[]> {
    return apiClient.post('/config-evaluation/evaluation-criteria/bulk', data);
  },

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    return apiClient.get('/config-evaluation/projects');
  },

  /**
   * Get project by ID
   */
  async getProjectById(id: number): Promise<Project> {
    return apiClient.get(`/config-evaluation/projects/${id}`);
  },

  /**
   * Get evaluation by ID with relations
   */
  async getEvaluationById(id: number): Promise<Evaluation> {
    return apiClient.get(`/config-evaluation/evaluations/${id}`);
  },

  /**
   * Get evaluations by project ID
   */
  async getEvaluationsByProjectId(projectId: number): Promise<Evaluation[]> {
    return apiClient.get(`/config-evaluation/projects/${projectId}/evaluations`);
  },

  /**
   * Complete evaluation configuration flow
   * Creates project, evaluation, and criteria in order
   */
  async completeEvaluationConfiguration(data: {
    projectName: string;
    projectDescription?: string;
    minQualityThreshold?: number;
    standardId: number;
    creatorUserId: number;
    criteria: Array<{
      criterionId: number;
      importanceLevel: ImportanceLevel;
      importancePercentage: number;
    }>;
  }): Promise<{
    project: Project;
    evaluation: Evaluation;
    criteria: EvaluationCriterion[];
  }> {
    try {
      // Step 1: Create project
      const project = await this.createProject({
        name: data.projectName,
        description: data.projectDescription,
        minimum_threshold: data.minQualityThreshold,
        creator_user_id: data.creatorUserId,
      });

      // Step 2: Create evaluation
      const evaluation = await this.createEvaluation({
        project_id: project.id,
        standard_id: data.standardId,
      });

      // Step 3: Create evaluation criteria
      const criteria = await this.bulkCreateEvaluationCriteria({
        criteria: data.criteria.map((criterion) => ({
          evaluation_id: evaluation.id,
          criterion_id: criterion.criterionId,
          importance_level: criterion.importanceLevel,
          importance_percentage: criterion.importancePercentage,
        })),
      });

      return { project, evaluation, criteria };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error creating evaluation configuration');
    }
  },

  /**
   * Create evaluation for existing project
   * Creates evaluation and criteria for a project that already exists
   */
  async createEvaluationForExistingProject(data: {
    projectId: number;
    standardId: number;
    criteria: Array<{
      criterionId: number;
      importanceLevel: ImportanceLevel;
      importancePercentage: number;
    }>;
  }): Promise<{
    evaluation: Evaluation;
    criteria: EvaluationCriterion[];
  }> {
    try {
      // Step 1: Create evaluation
      const evaluation = await this.createEvaluation({
        project_id: data.projectId,
        standard_id: data.standardId,
      });

      // Step 2: Create evaluation criteria
      const criteria = await this.bulkCreateEvaluationCriteria({
        criteria: data.criteria.map((criterion) => ({
          evaluation_id: evaluation.id,
          criterion_id: criterion.criterionId,
          importance_level: criterion.importanceLevel,
          importance_percentage: criterion.importancePercentage,
        })),
      });

      return { evaluation, criteria };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error updating evaluation configuration');
    }
  },

  async getMetricsByCriterionId(criterionId: number): Promise<CriterionWithMetrics> {
    return apiClient.get(`/config-evaluation/criteria/${criterionId}/metrics`);
  },

  async bulkCreateEvaluationMetrics(data: BulkCreateEvaluationMetricsDto): Promise<void> {
    return apiClient.post('/config-evaluation/evaluation-metrics/bulk', data);
  },
};
