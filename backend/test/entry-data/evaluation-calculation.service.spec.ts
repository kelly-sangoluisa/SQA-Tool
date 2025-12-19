import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { EvaluationCalculationService } from '../../src/modules/entry-data/services/evaluation-calculation.service';
import { FormulaEvaluationService } from '../../src/modules/entry-data/services/formula-evaluation.service';
import { EvaluationVariableService } from '../../src/modules/entry-data/services/evaluation-variable.service';
import { MetricScoringService } from '../../src/modules/entry-data/services/metric-scoring.service';
import { ThresholdParserService } from '../../src/modules/entry-data/services/threshold-parser.service';

// Entities
import { EvaluationMetricResult } from '../../src/modules/entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriteriaResult } from '../../src/modules/entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationResult } from '../../src/modules/entry-data/entities/evaluation_result.entity';
import { ProjectResult } from '../../src/modules/entry-data/entities/project_result.entity';
import { EvaluationMetric } from '../../src/modules/config-evaluation/entities/evaluation_metric.entity';
import { Evaluation } from '../../src/modules/config-evaluation/entities/evaluation.entity';
import { Project } from '../../src/modules/config-evaluation/entities/project.entity';

import { 
  mockEvaluationVariable,
  mockEvaluationMetric,
  mockEvaluation,
  mockProject,
  mockMetricResult,
  mockCriteriaResult,
  mockEvaluationResult,
  mockProjectResult,
  mockEvaluationCriterion,
  createMockRepository,
  mockDataSource
} from './entry-data-mocks';

describe('EvaluationCalculationService', () => {
  let service: EvaluationCalculationService;
  let formulaEvaluationService: FormulaEvaluationService;
  let evaluationVariableService: EvaluationVariableService;
  let metricScoringService: MetricScoringService;
  let evaluationMetricResultRepo: Repository<EvaluationMetricResult>;
  let evaluationCriteriaResultRepo: Repository<EvaluationCriteriaResult>;
  let evaluationResultRepo: Repository<EvaluationResult>;
  let projectResultRepo: Repository<ProjectResult>;
  let evaluationMetricRepo: Repository<EvaluationMetric>;
  let evaluationRepo: Repository<Evaluation>;
  let projectRepo: Repository<Project>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const mockFormulaService = {
      evaluateFormula: jest.fn(),
    };

    const mockVariableService = {
      createOrUpdate: jest.fn(),
      findByEvaluationMetric: jest.fn(),
    };

    const mockScoringService = {
      calculateScore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationCalculationService,
        {
          provide: FormulaEvaluationService,
          useValue: mockFormulaService,
        },
        {
          provide: EvaluationVariableService,
          useValue: mockVariableService,
        },
        {
          provide: MetricScoringService,
          useValue: mockScoringService,
        },
        ThresholdParserService,
        {
          provide: getRepositoryToken(EvaluationMetricResult),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EvaluationCriteriaResult),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EvaluationResult),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ProjectResult),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EvaluationMetric),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Evaluation),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Project),
          useValue: createMockRepository(),
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<EvaluationCalculationService>(EvaluationCalculationService);
    formulaEvaluationService = module.get<FormulaEvaluationService>(FormulaEvaluationService);
    evaluationVariableService = module.get<EvaluationVariableService>(EvaluationVariableService);
    metricScoringService = module.get<MetricScoringService>(MetricScoringService);
    evaluationMetricResultRepo = module.get<Repository<EvaluationMetricResult>>(
      getRepositoryToken(EvaluationMetricResult),
    );
    evaluationCriteriaResultRepo = module.get<Repository<EvaluationCriteriaResult>>(
      getRepositoryToken(EvaluationCriteriaResult),
    );
    evaluationResultRepo = module.get<Repository<EvaluationResult>>(
      getRepositoryToken(EvaluationResult),
    );
    projectResultRepo = module.get<Repository<ProjectResult>>(
      getRepositoryToken(ProjectResult),
    );
    evaluationMetricRepo = module.get<Repository<EvaluationMetric>>(
      getRepositoryToken(EvaluationMetric),
    );
    evaluationRepo = module.get<Repository<Evaluation>>(
      getRepositoryToken(Evaluation),
    );
    projectRepo = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processEvaluationData', () => {
    const evaluationId = 1;
    const testData = {
      evaluation_variables: [
        {
          eval_metric_id: 1,
          variable_id: 1,
          value: 10.5
        }
      ]
    };

    it('should process evaluation data successfully', async () => {
      // Arrange
      jest.spyOn(evaluationRepo, 'findOneBy').mockResolvedValue(mockEvaluation as any);
      jest.spyOn(evaluationMetricRepo, 'findOne').mockResolvedValue(mockEvaluationMetric as any);
      jest.spyOn(evaluationVariableService, 'createOrUpdate').mockResolvedValue(mockEvaluationVariable as any);
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb: any) => 
        await cb({})
      );

      // Act
      const result = await service.processEvaluationData(evaluationId, testData);

      // Assert
      expect(result).toEqual({
        message: 'Evaluation data processed successfully',
        variables_saved: 1
      });
      expect(evaluationRepo.findOneBy).toHaveBeenCalledWith({ id: evaluationId });
      expect(evaluationVariableService.createOrUpdate).toHaveBeenCalledWith(testData.evaluation_variables[0]);
    });

    it('should throw error when evaluation does not exist', async () => {
      // Arrange
      jest.spyOn(evaluationRepo, 'findOneBy').mockResolvedValue(null);

      // Act & Assert
      await expect(service.processEvaluationData(evaluationId, testData))
        .rejects.toThrow(`Evaluation with ID ${evaluationId} not found`);
    });

    it('should throw error when metric does not belong to evaluation', async () => {
      // Arrange
      jest.spyOn(evaluationRepo, 'findOneBy').mockResolvedValue(mockEvaluation as any);
      
      const wrongEvaluationMetric = {
        ...mockEvaluationMetric,
        evaluation_criterion: {
          ...mockEvaluationCriterion,
          evaluation: { id: 999 } // ID diferente
        }
      };
      
      jest.spyOn(evaluationMetricRepo, 'findOne').mockResolvedValue(wrongEvaluationMetric as any);
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb: any) => 
        await cb({})
      );

      // Act & Assert
      await expect(service.processEvaluationData(evaluationId, testData))
        .rejects.toThrow(`EvaluationMetric 1 does not belong to evaluation ${evaluationId}`);
    });
  });

  describe('calculateMetricResult', () => {
    const evalMetricId = 1;

    it('should calculate metric result successfully', async () => {
      // Arrange
      const scoreResult = {
        calculated_value: 15.5,
        weighted_value: 77.5
      };
      
      jest.spyOn(evaluationMetricRepo, 'findOne').mockResolvedValue(mockEvaluationMetric as any);
      jest.spyOn(evaluationVariableService, 'findByEvaluationMetric').mockResolvedValue([mockEvaluationVariable] as any);
      jest.spyOn(metricScoringService, 'calculateScore').mockReturnValue(scoreResult);
      jest.spyOn(evaluationMetricResultRepo, 'create').mockReturnValue(mockMetricResult as any);
      jest.spyOn(evaluationMetricResultRepo, 'save').mockResolvedValue(mockMetricResult as any);

      // Act
      const result = await service.calculateMetricResult(evalMetricId);

      // Assert
      expect(metricScoringService.calculateScore).toHaveBeenCalledWith(
        mockEvaluationMetric.metric.formula,
        expect.arrayContaining([
          expect.objectContaining({
            symbol: mockEvaluationVariable.variable.symbol,
            value: expect.any(Number)
          })
        ]),
        mockEvaluationMetric.metric.desired_threshold,
        mockEvaluationMetric.metric.worst_case
      );
      expect(evaluationMetricResultRepo.create).toHaveBeenCalledWith({
        eval_metric_id: evalMetricId,
        calculated_value: scoreResult.calculated_value,
        weighted_value: scoreResult.weighted_value
      });
      expect(result).toEqual(mockMetricResult);
    });

    it('should throw error when no variables found', async () => {
      // Arrange
      jest.spyOn(evaluationMetricRepo, 'findOne').mockResolvedValue(mockEvaluationMetric as any);
      jest.spyOn(evaluationVariableService, 'findByEvaluationMetric').mockResolvedValue([]);

      // Act & Assert
      await expect(service.calculateMetricResult(evalMetricId))
        .rejects.toThrow(`No variables found for evaluation metric ${evalMetricId}`);
    });

    it('should throw error when evaluation metric not found', async () => {
      // Arrange
      jest.spyOn(evaluationMetricRepo, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.calculateMetricResult(evalMetricId))
        .rejects.toThrow(`EvaluationMetric with ID ${evalMetricId} not found`);
    });
  });

  describe('calculateCriteriaResults', () => {
    const evaluationId = 1;

    it('should calculate criteria results successfully', async () => {
      // Arrange
      const evaluationWithCriteria = {
        ...mockEvaluation,
        evaluation_criteria: [mockEvaluationCriterion]
      };
      
      jest.spyOn(evaluationRepo, 'findOne').mockResolvedValue(evaluationWithCriteria as any);
      jest.spyOn(evaluationMetricResultRepo, 'find').mockResolvedValue([mockMetricResult] as any);
      jest.spyOn(evaluationCriteriaResultRepo, 'create').mockReturnValue(mockCriteriaResult as any);
      jest.spyOn(evaluationCriteriaResultRepo, 'save').mockResolvedValue(mockCriteriaResult as any);
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb: any) => 
        await cb({})
      );

      // Act
      const result = await service.calculateCriteriaResults(evaluationId);

      // Assert
      expect(result).toEqual([mockCriteriaResult]);
      
      // final_score = AVG(weighted_values) × (importance_percentage / 100)
      // = 77.5 × (30 / 100) = 77.5 × 0.3 = 23.25
      const expectedFinalScore = mockMetricResult.weighted_value * (mockEvaluationCriterion.importance_percentage / 100);
      
      expect(evaluationCriteriaResultRepo.create).toHaveBeenCalledWith({
        eval_criterion_id: mockEvaluationCriterion.id,
        final_score: expectedFinalScore // 23.25
      });
    });

    it('should throw error when no metric results found for criterion', async () => {
      // Arrange
      const evaluationWithCriteria = {
        ...mockEvaluation,
        evaluation_criteria: [mockEvaluationCriterion]
      };
      
      jest.spyOn(evaluationRepo, 'findOne').mockResolvedValue(evaluationWithCriteria as any);
      jest.spyOn(evaluationMetricResultRepo, 'find').mockResolvedValue([]);
      jest.spyOn(dataSource, 'transaction').mockImplementation(async (cb: any) => 
        await cb({})
      );

      // Act & Assert
      await expect(service.calculateCriteriaResults(evaluationId))
        .rejects.toThrow(`No metric results found for criterion ${mockEvaluationCriterion.id}`);
    });
  });

  describe('calculateEvaluationResult', () => {
    const evaluationId = 1;

    it('should calculate evaluation result successfully', async () => {
      // Arrange
      const evaluationWithCriteria = {
        ...mockEvaluation,
        evaluation_criteria: [mockEvaluationCriterion]
      };
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCriteriaResult])
      };
      
      jest.spyOn(evaluationRepo, 'findOne').mockResolvedValue(evaluationWithCriteria as any);
      jest.spyOn(evaluationCriteriaResultRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(evaluationResultRepo, 'create').mockReturnValue(mockEvaluationResult as any);
      jest.spyOn(evaluationResultRepo, 'save').mockResolvedValue(mockEvaluationResult as any);

      // Act
      const result = await service.calculateEvaluationResult(evaluationId);

      // Assert
      expect(result).toEqual(mockEvaluationResult);
      expect(evaluationRepo.findOne).toHaveBeenCalledWith({
        where: { id: evaluationId },
        relations: ['evaluation_criteria', 'evaluation_criteria.evaluation_metrics']
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'cr.eval_criterion_id IN (:...criterionIds)',
        { criterionIds: [mockEvaluationCriterion.id] }
      );
      expect(evaluationResultRepo.create).toHaveBeenCalledWith({
        evaluation_id: evaluationId,
        evaluation_score: mockCriteriaResult.final_score,
        conclusion: 'Evaluación calculada automáticamente'
      });
    });

    it('should throw error when no criteria results found', async () => {
      // Arrange
      const evaluationWithCriteria = {
        ...mockEvaluation,
        evaluation_criteria: [mockEvaluationCriterion]
      };
      
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([])
      };
      
      jest.spyOn(evaluationRepo, 'findOne').mockResolvedValue(evaluationWithCriteria as any);
      jest.spyOn(evaluationCriteriaResultRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act & Assert
      await expect(service.calculateEvaluationResult(evaluationId))
        .rejects.toThrow(`No criteria results found for evaluation ${evaluationId}`);
    });
  });

  describe('calculateProjectResult', () => {
    const projectId = 1;

    it('should calculate project result successfully', async () => {
      // Arrange
      jest.spyOn(evaluationResultRepo, 'find').mockResolvedValue([mockEvaluationResult] as any);
      jest.spyOn(projectResultRepo, 'create').mockReturnValue(mockProjectResult as any);
      jest.spyOn(projectResultRepo, 'save').mockResolvedValue(mockProjectResult as any);

      // Act
      const result = await service.calculateProjectResult(projectId);

      // Assert
      expect(result).toEqual(mockProjectResult);
      expect(projectResultRepo.create).toHaveBeenCalledWith({
        project_id: projectId,
        final_project_score: mockEvaluationResult.evaluation_score // Simple average
      });
    });

    it('should throw error when no evaluation results found', async () => {
      // Arrange
      jest.spyOn(evaluationResultRepo, 'find').mockResolvedValue([]);

      // Act & Assert
      await expect(service.calculateProjectResult(projectId))
        .rejects.toThrow(`No evaluation results found for project ${projectId}`);
    });
  });

  describe('updateEvaluationStatus', () => {
    it('should update evaluation status successfully', async () => {
      // Arrange
      const evaluationId = 1;
      const status = 'completed' as any;
      
      jest.spyOn(evaluationRepo, 'update').mockResolvedValue({} as any);

      // Act
      await service.updateEvaluationStatus(evaluationId, status);

      // Assert
      expect(evaluationRepo.update).toHaveBeenCalledWith(evaluationId, { status });
    });
  });

  describe('updateProjectStatus', () => {
    it('should update project status successfully', async () => {
      // Arrange
      const projectId = 1;
      const status = 'completed' as any;
      
      jest.spyOn(projectRepo, 'update').mockResolvedValue({} as any);

      // Act
      await service.updateProjectStatus(projectId, status);

      // Assert
      expect(projectRepo.update).toHaveBeenCalledWith(projectId, { status });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});