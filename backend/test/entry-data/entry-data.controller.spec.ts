import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseAuthGuard } from '../../src/auth/guards/supabase-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';

import { EntryDataController } from '../../src/modules/entry-data/controllers/entry-data.controller';
import { EntryDataService } from '../../src/modules/entry-data/services/entry-data.service';
import { CreateEvaluationVariableDto } from '../../src/modules/entry-data/dto/evaluation-variable.dto';

import {
  mockEvaluationResult,
  mockProjectResult,
  mockEvaluationVariables,
  mockMetricResults,
  mockCriteriaResults,
  mockEvaluationResults,
} from './entry-data-mocks';

describe('EntryDataController', () => {
  let controller: EntryDataController;
  let service: EntryDataService;

  const mockEntryDataService = {
    receiveEvaluationData: jest.fn(),
    finalizeEvaluation: jest.fn(),
    finalizeProject: jest.fn(),
    getEvaluationSummary: jest.fn(),
    getProjectCompleteResults: jest.fn(),
    getEvaluationVariables: jest.fn(),
    getMetricResults: jest.fn(),
    getCriteriaResults: jest.fn(),
    getEvaluationResult: jest.fn(),
    getProjectResult: jest.fn(),
    getProjectEvaluationResults: jest.fn(),
    getProjectCriteriaResults: jest.fn(),
    getProjectMetricResults: jest.fn(),
    getProjectEvaluationVariables: jest.fn(),
    resetEvaluation: jest.fn(),
    deleteVariable: jest.fn(),
    getEvaluationStatus: jest.fn(),
    getProjectProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryDataController],
      providers: [
        {
          provide: EntryDataService,
          useValue: mockEntryDataService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EntryDataController>(EntryDataController);
    service = module.get<EntryDataService>(EntryDataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ==========================================================================
  // POST ENDPOINTS - FLUJO PRINCIPAL
  // ==========================================================================

  describe('submitEvaluationData', () => {
    const evaluationId = 1;
    const testData = {
      evaluation_variables: [
        {
          eval_metric_id: 1,
          variable_id: 1,
          value: 10.5
        } as CreateEvaluationVariableDto
      ]
    };

    it('should submit evaluation data successfully', async () => {
      // Arrange
      const expectedServiceResponse = {
        message: 'Evaluation data processed successfully',
        variables_saved: 1
      };
      
      mockEntryDataService.receiveEvaluationData.mockResolvedValue(expectedServiceResponse);

      // Act
      const result = await controller.submitEvaluationData(evaluationId, testData);

      // Assert
      expect(service.receiveEvaluationData).toHaveBeenCalledWith(evaluationId, testData);
      expect(result).toEqual({
        ...expectedServiceResponse,
        evaluation_id: evaluationId,
        timestamp: expect.any(String) // El timestamp es dinámico
      });
    });
  });

  describe('finalizeEvaluation', () => {
    it('should finalize evaluation successfully', async () => {
      // Arrange
      const evaluationId = 1;
      const expectedResponse = {
        message: 'Evaluation finalized successfully',
        evaluation_id: evaluationId,
        metric_results: 8,
        criteria_results: 3,
        final_score: 85.67,
        finalized_at: new Date('2024-01-15T10:30:00Z')
      };
      
      mockEntryDataService.finalizeEvaluation.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.finalizeEvaluation(evaluationId);

      // Assert
      expect(service.finalizeEvaluation).toHaveBeenCalledWith(evaluationId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('finalizeProject', () => {
    it('should finalize project successfully', async () => {
      // Arrange
      const projectId = 1;
      const expectedResponse = {
        message: 'Project finalized successfully',
        project_id: projectId,
        final_score: 88.23,
        finalized_at: new Date('2024-01-15T10:35:00Z')
      };
      
      mockEntryDataService.finalizeProject.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.finalizeProject(projectId);

      // Assert
      expect(service.finalizeProject).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(expectedResponse);
    });
  });

  // ==========================================================================
  // GET ENDPOINTS - CONSULTA DE RESULTADOS COMPLETOS
  // ==========================================================================

  describe('getEvaluationCompleteResults', () => {
    it('should return complete evaluation results', async () => {
      // Arrange
      const evaluationId = 1;
      const expectedResponse = {
        evaluation_id: evaluationId,
        variables: { count: 12, data: mockEvaluationVariables },
        metric_results: { count: 8, data: mockMetricResults },
        final_result: mockEvaluationResult,
        status: 'completed'
      };
      
      mockEntryDataService.getEvaluationSummary.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getEvaluationCompleteResults(evaluationId);

      // Assert
      expect(service.getEvaluationSummary).toHaveBeenCalledWith(evaluationId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProjectCompleteResults', () => {
    it('should return complete project results', async () => {
      // Arrange
      const projectId = 1;
      const expectedResponse = {
        project_id: projectId,
        project_result: mockProjectResult,
        evaluation_results: { count: 2, data: mockEvaluationResults },
        criteria_results: { count: 6, data: mockCriteriaResults },
        metric_results: { count: 16, data: mockMetricResults },
        evaluation_variables: { count: 24, data: mockEvaluationVariables },
        status: 'completed'
      };
      
      mockEntryDataService.getProjectCompleteResults.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getProjectCompleteResults(projectId);

      // Assert
      expect(service.getProjectCompleteResults).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(expectedResponse);
    });
  });

  // ==========================================================================
  // STATUS ENDPOINTS - INFORMACIÓN DE PROGRESO
  // ==========================================================================

  describe('getEvaluationStatus', () => {
    it('should return evaluation status', async () => {
      // Arrange
      const evaluationId = 1;
      const mockStatus = {
        evaluation_id: evaluationId,
        variables: { count: 12, data: mockEvaluationVariables },
        metric_results: { count: 8, data: mockMetricResults },
        final_result: mockEvaluationResult,
        status: 'completed'
      };
      
      mockEntryDataService.getEvaluationStatus.mockResolvedValue(mockStatus);

      // Act
      const result = await controller.getEvaluationStatus(evaluationId);

      // Assert
      expect(service.getEvaluationStatus).toHaveBeenCalledWith(evaluationId);
      expect(result).toEqual(mockStatus);
    });
  });

  describe('getProjectProgress', () => {
    it('should return project progress', async () => {
      // Arrange
      const projectId = 1;
      const mockProgress = {
        project_id: projectId,
        project_result: mockProjectResult,
        evaluation_results: { count: 2, data: mockEvaluationResults },
        criteria_results: { count: 6, data: mockCriteriaResults },
        metric_results: { count: 16, data: mockMetricResults },
        evaluation_variables: { count: 24, data: mockEvaluationVariables },
        status: 'completed'
      };
      
      mockEntryDataService.getProjectProgress.mockResolvedValue(mockProgress);

      // Act
      const result = await controller.getProjectProgress(projectId);

      // Assert
      expect(service.getProjectProgress).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockProgress);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});