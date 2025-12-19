import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EvaluationVariableService } from '../../src/modules/entry-data/services/evaluation-variable.service';
import { EvaluationVariable } from '../../src/modules/entry-data/entities/evaluation_variable.entity';
import { EvaluationMetric } from '../../src/modules/config-evaluation/entities/evaluation_metric.entity';
import { FormulaVariable } from '../../src/modules/parameterization/entities/formula-variable.entity';

import { 
  mockEvaluationVariable,
  mockEvaluationMetric,
  mockFormulaVariable,
  createMockRepository
} from './entry-data-mocks';

describe('EvaluationVariableService', () => {
  let service: EvaluationVariableService;
  let evaluationVariableRepo: Repository<EvaluationVariable>;
  let evaluationMetricRepo: Repository<EvaluationMetric>;
  let formulaVariableRepo: Repository<FormulaVariable>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationVariableService,
        {
          provide: getRepositoryToken(EvaluationVariable),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(EvaluationMetric),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(FormulaVariable),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<EvaluationVariableService>(EvaluationVariableService);
    evaluationVariableRepo = module.get<Repository<EvaluationVariable>>(
      getRepositoryToken(EvaluationVariable),
    );
    evaluationMetricRepo = module.get<Repository<EvaluationMetric>>(
      getRepositoryToken(EvaluationMetric),
    );
    formulaVariableRepo = module.get<Repository<FormulaVariable>>(
      getRepositoryToken(FormulaVariable),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdate', () => {
    const createDto = {
      eval_metric_id: 1,
      variable_id: 1,
      value: 10.5
    };

    beforeEach(() => {
      // Mock successful validation
      jest.spyOn(evaluationMetricRepo, 'findOneBy').mockResolvedValue(mockEvaluationMetric as any);
      jest.spyOn(formulaVariableRepo, 'findOneBy').mockResolvedValue(mockFormulaVariable as any);
    });

    it('should create new variable when it does not exist', async () => {
      // Arrange
      jest.spyOn(evaluationVariableRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(evaluationVariableRepo, 'create').mockReturnValue(mockEvaluationVariable as any);
      jest.spyOn(evaluationVariableRepo, 'save').mockResolvedValue(mockEvaluationVariable as any);

      // Act
      const result = await service.createOrUpdate(createDto);

      // Assert
      expect(evaluationVariableRepo.create).toHaveBeenCalledWith(createDto);
      expect(evaluationVariableRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEvaluationVariable);
    });

    it('should update existing variable when it exists', async () => {
      // Arrange
      const existingVariable = { ...mockEvaluationVariable, value: 5 };
      jest.spyOn(evaluationVariableRepo, 'findOne').mockResolvedValue(existingVariable as any);
      jest.spyOn(evaluationVariableRepo, 'save').mockResolvedValue({
        ...existingVariable,
        value: createDto.value
      } as any);

      // Act
      const result = await service.createOrUpdate(createDto);

      // Assert
      expect(evaluationVariableRepo.save).toHaveBeenCalledWith({
        ...existingVariable,
        value: createDto.value
      });
      expect(result.value).toBe(createDto.value);
    });

    it('should throw error when evaluation metric does not exist', async () => {
      // Arrange
      jest.spyOn(evaluationMetricRepo, 'findOneBy').mockResolvedValue(null);

      // Act & Assert
      await expect(service.createOrUpdate(createDto))
        .rejects.toThrow('EvaluationMetric with ID 1 not found');
    });

    it('should throw error when formula variable does not exist', async () => {
      // Arrange
      jest.spyOn(formulaVariableRepo, 'findOneBy').mockResolvedValue(null);

      // Act & Assert
      await expect(service.createOrUpdate(createDto))
        .rejects.toThrow('FormulaVariable with ID 1 not found');
    });
  });

  describe('findByEvaluationMetric', () => {
    it('should return variables for given evaluation metric', async () => {
      // Arrange
      const evalMetricId = 1;
      const expectedVariables = [mockEvaluationVariable];
      jest.spyOn(evaluationVariableRepo, 'find').mockResolvedValue(expectedVariables as any);

      // Act
      const result = await service.findByEvaluationMetric(evalMetricId);

      // Assert
      expect(evaluationVariableRepo.find).toHaveBeenCalledWith({
        where: { eval_metric_id: evalMetricId },
        relations: ['variable']
      });
      expect(result).toEqual(expectedVariables);
    });

    it('should return empty array when no variables found', async () => {
      // Arrange
      const evalMetricId = 999;
      jest.spyOn(evaluationVariableRepo, 'find').mockResolvedValue([]);

      // Act
      const result = await service.findByEvaluationMetric(evalMetricId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByEvaluation', () => {
    it('should return variables for given evaluation', async () => {
      // Arrange
      const evaluationId = 1;
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockEvaluationVariable]),
      };
      jest.spyOn(evaluationVariableRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findByEvaluation(evaluationId);

      // Assert
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('ev.evaluation_metric', 'em');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('em.evaluation_criterion', 'ec');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ec.evaluation_id = :evaluationId', { evaluationId });
      expect(result).toEqual([mockEvaluationVariable]);
    });
  });

  describe('remove', () => {
    it('should remove variable when it exists', async () => {
      // Arrange
      const evalMetricId = 1;
      const variableId = 1;
      jest.spyOn(evaluationVariableRepo, 'findOne').mockResolvedValue(mockEvaluationVariable as any);
      jest.spyOn(evaluationVariableRepo, 'remove').mockResolvedValue(mockEvaluationVariable as any);

      // Act
      await service.remove(evalMetricId, variableId);

      // Assert
      expect(evaluationVariableRepo.findOne).toHaveBeenCalledWith({
        where: { eval_metric_id: evalMetricId, variable_id: variableId }
      });
      expect(evaluationVariableRepo.remove).toHaveBeenCalledWith(mockEvaluationVariable);
    });

    it('should throw error when variable does not exist', async () => {
      // Arrange
      const evalMetricId = 1;
      const variableId = 999;
      jest.spyOn(evaluationVariableRepo, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(evalMetricId, variableId))
        .rejects.toThrow(`EvaluationVariable not found for metric ${evalMetricId} and variable ${variableId}`);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});