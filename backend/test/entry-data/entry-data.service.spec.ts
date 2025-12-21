import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { EntryDataService } from '../../src/modules/entry-data/services/entry-data.service';
import { EvaluationCalculationService } from '../../src/modules/entry-data/services/evaluation-calculation.service';

// Entities
import { EvaluationVariable } from '../../src/modules/entry-data/entities/evaluation_variable.entity';
import { EvaluationMetricResult } from '../../src/modules/entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriteriaResult } from '../../src/modules/entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationResult } from '../../src/modules/entry-data/entities/evaluation_result.entity';
import { ProjectResult } from '../../src/modules/entry-data/entities/project_result.entity';

import { 
  mockEvaluationVariable,
  mockMetricResult,
  mockCriteriaResult,
  mockEvaluationResult,
  mockProjectResult,
  mockEvaluationVariables,
  mockMetricResults,
  mockCriteriaResults,
  mockEvaluationResults,
  createMockRepository
} from './entry-data-mocks';

describe('EntryDataService', () => {
  let service: EntryDataService;
  let evaluationCalculationService: EvaluationCalculationService;
  let evaluationVariableRepo: Repository<EvaluationVariable>;
  let evaluationMetricResultRepo: Repository<EvaluationMetricResult>;
  let evaluationCriteriaResultRepo: Repository<EvaluationCriteriaResult>;
  let evaluationResultRepo: Repository<EvaluationResult>;
  let projectResultRepo: Repository<ProjectResult>;

  beforeEach(async () => {
    const mockCalculationService = {
      processEvaluationData: jest.fn(),
      calculateMetricResult: jest.fn(),
      calculateCriteriaResults: jest.fn(),
      calculateEvaluationResult: jest.fn(),
      calculateProjectResult: jest.fn(),
      updateEvaluationStatus: jest.fn(),
      updateProjectStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryDataService,
        {
          provide: EvaluationCalculationService,
          useValue: mockCalculationService,
        },
        {
          provide: getRepositoryToken(EvaluationVariable),
          useValue: createMockRepository(),
        },
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
      ],
    }).compile();

    service = module.get<EntryDataService>(EntryDataService);
    evaluationCalculationService = module.get<EvaluationCalculationService>(EvaluationCalculationService);
    evaluationVariableRepo = module.get<Repository<EvaluationVariable>>(
      getRepositoryToken(EvaluationVariable),
    );
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('receiveEvaluationData', () => {
    it('should process evaluation data successfully', async () => {
      // Arrange
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
      const expectedResponse = {
        message: 'Evaluation data processed successfully',
        variables_saved: 1
      };
      
      jest.spyOn(evaluationCalculationService, 'processEvaluationData')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await service.receiveEvaluationData(evaluationId, testData);

      // Assert
      expect(evaluationCalculationService.processEvaluationData)
        .toHaveBeenCalledWith(evaluationId, testData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('finalizeEvaluation', () => {
    it('should finalize evaluation successfully', async () => {
      // Arrange
      const evaluationId = 1;
      const mockMetrics = [{ eval_metric_id: 1 }];
      
      // Configurar el mock repository para que tenga el método query
      const mockRepo = evaluationVariableRepo as any;
      mockRepo.query = jest.fn().mockResolvedValue(mockMetrics);
      
      jest.spyOn(evaluationCalculationService, 'calculateMetricResult')
        .mockResolvedValue(mockMetricResult as any);
      jest.spyOn(evaluationCalculationService, 'calculateCriteriaResults')
        .mockResolvedValue([mockCriteriaResult] as any);
      jest.spyOn(evaluationCalculationService, 'calculateEvaluationResult')
        .mockResolvedValue(mockEvaluationResult as any);
      jest.spyOn(evaluationCalculationService, 'updateEvaluationStatus')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.finalizeEvaluation(evaluationId);

      // Assert
      expect(result).toEqual({
        message: 'Evaluation finalized successfully',
        evaluation_id: evaluationId,
        metric_results: 1,
        criteria_results: 1,
        final_score: mockEvaluationResult.evaluation_score,
        finalized_at: mockEvaluationResult.created_at
      });
      expect(evaluationCalculationService.updateEvaluationStatus)
        .toHaveBeenCalledWith(evaluationId, 'completed');
    });
  });

  describe('finalizeProject', () => {
    it('should finalize project successfully', async () => {
      // Arrange
      const projectId = 1;
      
      jest.spyOn(evaluationCalculationService, 'calculateProjectResult')
        .mockResolvedValue(mockProjectResult as any);
      jest.spyOn(evaluationCalculationService, 'updateProjectStatus')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.finalizeProject(projectId);

      // Assert
      expect(result).toEqual({
        message: 'Project finalized successfully',
        project_id: projectId,
        final_score: mockProjectResult.final_project_score,
        score_level: mockProjectResult.score_level,
        satisfaction_grade: mockProjectResult.satisfaction_grade,
        finalized_at: mockProjectResult.created_at
      });
      expect(evaluationCalculationService.updateProjectStatus)
        .toHaveBeenCalledWith(projectId, 'completed');
    });
  });

  describe('getEvaluationVariables', () => {
    it('should return evaluation variables', async () => {
      // Arrange
      const evaluationId = 1;
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockEvaluationVariables),
      };
      
      jest.spyOn(evaluationVariableRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getEvaluationVariables(evaluationId);

      // Assert
      expect(result).toEqual(mockEvaluationVariables);
    });
  });

  describe('getMetricResults', () => {
    it('should return metric results', async () => {
      // Arrange
      const evaluationId = 1;
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockMetricResults),
      };
      
      jest.spyOn(evaluationMetricResultRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getMetricResults(evaluationId);

      // Assert
      expect(result).toEqual(mockMetricResults);
    });
  });

  describe('getEvaluationResult', () => {
    it('should return evaluation result when found', async () => {
      // Arrange
      const evaluationId = 1;
      
      jest.spyOn(evaluationResultRepo, 'findOne')
        .mockResolvedValue(mockEvaluationResult as any);

      // Act
      const result = await service.getEvaluationResult(evaluationId);

      // Assert
      expect(result).toEqual(mockEvaluationResult);
    });

    it('should throw error when evaluation result not found', async () => {
      // Arrange
      const evaluationId = 999;
      
      jest.spyOn(evaluationResultRepo, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getEvaluationResult(evaluationId))
        .rejects.toThrow(`No result found for evaluation ${evaluationId}`);
    });
  });

  describe('getProjectResult', () => {
    it('should return project result when found', async () => {
      // Arrange
      const projectId = 1;
      
      jest.spyOn(projectResultRepo, 'findOne')
        .mockResolvedValue(mockProjectResult as any);

      // Act
      const result = await service.getProjectResult(projectId);

      // Assert
      expect(result).toEqual(mockProjectResult);
    });

    it('should throw error when project result not found', async () => {
      // Arrange
      const projectId = 999;
      
      jest.spyOn(projectResultRepo, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProjectResult(projectId))
        .rejects.toThrow(`No result found for project ${projectId}`);
    });
  });

  describe('getEvaluationSummary', () => {
    it('should return complete evaluation summary when evaluation is completed', async () => {
      // Arrange
      const evaluationId = 1;
      
      jest.spyOn(service, 'getEvaluationVariables')
        .mockResolvedValue(mockEvaluationVariables);
      jest.spyOn(service, 'getMetricResults')
        .mockResolvedValue(mockMetricResults);
      jest.spyOn(service, 'getEvaluationResult')
        .mockResolvedValue(mockEvaluationResult);

      // Act
      const result = await service.getEvaluationSummary(evaluationId);

      // Assert
      expect(result).toEqual({
        evaluation_id: evaluationId,
        variables: {
          count: mockEvaluationVariables.length,
          data: mockEvaluationVariables
        },
        metric_results: {
          count: mockMetricResults.length,
          data: mockMetricResults
        },
        final_result: mockEvaluationResult,
        status: 'completed'
      });
    });

    it('should return summary with in_progress status when evaluation not completed', async () => {
      // Arrange
      const evaluationId = 1;
      
      jest.spyOn(service, 'getEvaluationVariables')
        .mockResolvedValue(mockEvaluationVariables);
      jest.spyOn(service, 'getMetricResults')
        .mockResolvedValue(mockMetricResults);
      jest.spyOn(service, 'getEvaluationResult')
        .mockRejectedValue(new NotFoundException('Not found'));

      // Act
      const result = await service.getEvaluationSummary(evaluationId);

      // Assert
      expect(result.status).toBe('in_progress');
      expect(result.final_result).toBeNull();
    });
  });

  describe('deleteVariable', () => {
    it('should delete variable successfully', async () => {
      // Arrange
      const evalMetricId = 1;
      const variableId = 1;
      
      jest.spyOn(evaluationVariableRepo, 'findOne')
        .mockResolvedValue(mockEvaluationVariable as any);
      jest.spyOn(evaluationVariableRepo, 'remove')
        .mockResolvedValue(mockEvaluationVariable as any);

      // Act
      await service.deleteVariable(evalMetricId, variableId);

      // Assert
      expect(evaluationVariableRepo.remove).toHaveBeenCalledWith(mockEvaluationVariable);
    });

    it('should throw error when variable not found', async () => {
      // Arrange
      const evalMetricId = 1;
      const variableId = 999;
      
      jest.spyOn(evaluationVariableRepo, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteVariable(evalMetricId, variableId))
        .rejects.toThrow(`Variable not found for metric ${evalMetricId} and variable ${variableId}`);
    });
  });

  describe('resetEvaluation', () => {
    it('should reset evaluation successfully', async () => {
      // Arrange
      const evaluationId = 1;
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      
      jest.spyOn(evaluationResultRepo, 'delete').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(evaluationCriteriaResultRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(evaluationMetricResultRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(evaluationVariableRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.resetEvaluation(evaluationId);

      // Assert
      expect(evaluationResultRepo.delete).toHaveBeenCalledWith({ evaluation_id: evaluationId });
      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(3); // criteria, metrics, variables
    });
  });

  describe('getProjectCompleteResults', () => {
    it('should return complete project results', async () => {
      // Arrange
      const projectId = 1;
      const testCriteriaResults = mockCriteriaResults;
      const testVariables = mockEvaluationVariables;
      const testMetricResults = mockMetricResults;
      
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn()
      };

      // Mock project result (can be null)
      jest.spyOn(service, 'getProjectResult').mockRejectedValue(new Error('Not found'));

      // Mock project evaluation results
      mockQueryBuilder.getMany.mockResolvedValueOnce(mockEvaluationResults);
      jest.spyOn(evaluationResultRepo, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      // Mock project criteria results 
      mockQueryBuilder.getMany.mockResolvedValueOnce(testCriteriaResults);
      jest.spyOn(evaluationCriteriaResultRepo, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      // Mock project metric results
      mockQueryBuilder.getMany.mockResolvedValueOnce(testMetricResults);
      jest.spyOn(evaluationMetricResultRepo, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      // Mock project variables
      mockQueryBuilder.getMany.mockResolvedValueOnce(testVariables);
      jest.spyOn(evaluationVariableRepo, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      // Act
      const result = await service.getProjectCompleteResults(projectId);

      // Assert
      expect(result).toEqual({
        project_id: projectId,
        project_result: null,
        evaluation_results: {
          count: mockEvaluationResults.length,
          data: mockEvaluationResults
        },
        criteria_results: {
          count: testCriteriaResults.length,
          data: testCriteriaResults
        },
        metric_results: {
          count: testMetricResults.length,
          data: testMetricResults
        },
        evaluation_variables: {
          count: testVariables.length,
          data: testVariables
        },
        status: 'in_progress'
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});