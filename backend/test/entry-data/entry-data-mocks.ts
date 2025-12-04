// Imports de enums y tipos necesarios
import { ProjectStatus } from '../../src/modules/config-evaluation/entities/project.entity';
import { ImportanceLevel } from '../../src/modules/config-evaluation/entities/evaluation-criterion.entity';
import { ItemStatus } from '../../src/modules/parameterization/types/parameterization.types';

// Imports de las entidades para tipado
import { ProjectResult } from '../../src/modules/entry-data/entities/project_result.entity';
import { EvaluationResult } from '../../src/modules/entry-data/entities/evaluation_result.entity';
import { EvaluationCriteriaResult } from '../../src/modules/entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../../src/modules/entry-data/entities/evaluation_metric_result.entity';
import { EvaluationVariable } from '../../src/modules/entry-data/entities/evaluation_variable.entity';

// ============================================================================
//  MOCK DATA FOR ENTRY DATA SERVICE TESTS
// ============================================================================

export const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  minimum_threshold: 85.0,
  creator_user_id: 1,
  status: ProjectStatus.IN_PROGRESS, // ✅ Usando el enum correcto
  created_at: new Date('2023-01-01T10:00:00Z'),
  updated_at: new Date('2023-01-01T10:00:00Z'),
  creator: {} as any,
  evaluations: [],
};
export const mockStandard = {
  id: 1,
  name: 'Test Standard',
  description: 'Test Standard Description',
  version: '1.0',
  state: ItemStatus.ACTIVE,
  created_at: new Date('2023-01-01T09:00:00Z'),
  updated_at: new Date('2023-01-01T09:00:00Z'),
  criteria: [],
};

export const mockEvaluation = {
  id: 1,
  project_id: 1,
  standard_id: 1,
  created_at: new Date('2023-01-01T10:00:00Z'),
  updated_at: new Date('2023-01-01T10:00:00Z'),
  project: mockProject,
  standard: mockStandard,
  evaluation_criteria: [],
};

export const mockCriterion = {
  id: 1,
  name: 'Test Criterion',
  description: 'Test Criterion Description',
  standard_id: 1,
  state: ItemStatus.ACTIVE,
  created_at: new Date('2023-01-01T09:00:00Z'),
  updated_at: new Date('2023-01-01T09:00:00Z'),
  standard: mockStandard,
  sub_criteria: [],
};

export const mockEvaluationCriterion = {
  id: 1,
  evaluation_id: 1,
  criterion_id: 1,
  importance_level: ImportanceLevel.HIGH, // ✅ Usando el enum correcto
  importance_percentage: 30,
  created_at: new Date('2023-01-01T10:00:00Z'),
  updated_at: new Date('2023-01-01T10:00:00Z'),
  evaluation: mockEvaluation,
  criterion: mockCriterion,
  evaluation_metrics: [],
};

export const mockMetric = {
  id: 1,
  name: 'Test Metric',
  code: 'MET-001',
  description: 'Test Metric Description',
  formula: 'a/b',
  desired_threshold: 100,
  sub_criterion_id: 1,
  state: ItemStatus.ACTIVE,
  created_at: new Date('2023-01-01T09:00:00Z'),
  updated_at: new Date('2023-01-01T09:00:00Z'),
  sub_criterion: {} as any,
  variables: [],
};

export const mockEvaluationMetric = {
  id: 1,
  eval_criterion_id: 1,
  metric_id: 1,
  created_at: new Date('2023-01-01T10:00:00Z'),
  updated_at: new Date('2023-01-01T10:00:00Z'),
  evaluation_criterion: mockEvaluationCriterion,
  metric: mockMetric,
};

export const mockFormulaVariable = {
  id: 1,
  symbol: 'a',
  description: 'Test Variable A',
  metric_id: 1,
  state: ItemStatus.ACTIVE,
  created_at: new Date('2023-01-01T09:00:00Z'),
  updated_at: new Date('2023-01-01T09:00:00Z'),
  metric: mockMetric,
};

// ============================================================================
// MOCK RESULTS (Entry Data Entities) - CON TIPADO CORRECTO
// ============================================================================

export const mockProjectResult: ProjectResult = {
  id: 1,
  project_id: 1,
  final_project_score: 85.5,
  created_at: new Date('2023-01-01T12:00:00Z'),
  updated_at: new Date('2023-01-01T12:00:00Z'),
  project: mockProject,
};

export const mockEvaluationResult: EvaluationResult = {
  id: 1,
  evaluation_id: 1,
  evaluation_score: 78.5,
  conclusion: 'Test conclusion for evaluation',
  created_at: new Date('2023-01-01T11:00:00Z'),
  updated_at: new Date('2023-01-01T11:00:00Z'),
  evaluation: mockEvaluation,
};

export const mockCriteriaResult: EvaluationCriteriaResult = {
  id: 1,
  eval_criterion_id: 1,
  final_score: 85.0,
  created_at: new Date('2023-01-01T11:30:00Z'),
  updated_at: new Date('2023-01-01T11:30:00Z'),
  evaluation_criterion: mockEvaluationCriterion,
};

export const mockMetricResult: EvaluationMetricResult = {
  id: 1,
  eval_metric_id: 1,
  calculated_value: 15.5,
  weighted_value: 77.5,
  created_at: new Date('2023-01-01T11:45:00Z'),
  updated_at: new Date('2023-01-01T11:45:00Z'),
  evaluation_metric: mockEvaluationMetric,
};

export const mockEvaluationVariable: EvaluationVariable = {
  id: 1,
  eval_metric_id: 1,
  variable_id: 1,
  value: 10.5,
  created_at: new Date('2023-01-01T11:40:00Z'),
  updated_at: new Date('2023-01-01T11:40:00Z'),
  evaluation_metric: mockEvaluationMetric,
  variable: mockFormulaVariable,
};

// ============================================================================
// MOCK ARRAYS FOR TESTING
// ============================================================================

export const mockProjectResults: ProjectResult[] = [mockProjectResult];
export const mockEvaluationResults: EvaluationResult[] = [mockEvaluationResult];
export const mockCriteriaResults: EvaluationCriteriaResult[] = [mockCriteriaResult];
export const mockMetricResults: EvaluationMetricResult[] = [mockMetricResult];
export const mockEvaluationVariables: EvaluationVariable[] = [mockEvaluationVariable];

// ============================================================================
// MOCK REPOSITORY FACTORY
// ============================================================================

export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    execute: jest.fn(),
  })),
});

// ============================================================================
// MOCK DATASOURCE
// ============================================================================

export const mockDataSource = {
  transaction: jest.fn(),
  createQueryBuilder: jest.fn(),
  getRepository: jest.fn(),
};

// ============================================================================
// MOCK DATA COMBINATIONS FOR COMPLEX TESTS
// ============================================================================

export const mockCompleteProjectResults = {
  project_results: mockProjectResults,
  evaluation_results: mockEvaluationResults,
  criteria_results: mockCriteriaResults,
  metric_results: mockMetricResults,
  evaluation_variables: mockEvaluationVariables,
};

export const mockCompleteEvaluationResults = {
  evaluation_results: mockEvaluationResults,
  criteria_results: mockCriteriaResults,
  metric_results: mockMetricResults,
  evaluation_variables: mockEvaluationVariables,
};