import { Test, TestingModule } from '@nestjs/testing';
import { ParameterizationController } from '../../src/modules/parameterization/controllers/parameterization.controller';
import { ParameterizationService } from '../../src/modules/parameterization/services/parameterization.service';
import { CreateStandardDto } from '../../src/modules/parameterization/dto/standard.dto';
import { CreateCriterionDto } from '../../src/modules/parameterization/dto/criterion.dto';
import { CreateSubCriterionDto } from '../../src/modules/parameterization/dto/sub-criterion.dto';
import { CreateMetricDto } from '../../src/modules/parameterization/dto/metric.dto';
import { CreateFormulaVariableDto } from '../../src/modules/parameterization/dto/formula-variable.dto';
import { UpdateStateDto } from '../../src/modules/parameterization/dto/update-state.dto';
import { FindAllQueryDto } from '../../src/modules/parameterization/dto/find-all-query.dto';
import { ItemStatus } from '../../src/modules/parameterization/types/parameterization.types';

const mockParameterizationService = {
  // Standards
  createStandard: jest.fn(),
  findAllStandards: jest.fn(),
  findOneStandard: jest.fn(),
  updateStandard: jest.fn(),
  updateStandardState: jest.fn(),

  // Criteria
  createCriterion: jest.fn(),
  findAllCriteria: jest.fn(),
  findOneCriterion: jest.fn(),
  updateCriterion: jest.fn(),
  updateCriterionState: jest.fn(),
  
  // SubCriteria
  createSubCriterion: jest.fn(),
  findAllSubCriteria: jest.fn(),
  findOneSubCriterion: jest.fn(),
  updateSubCriterion: jest.fn(),
  updateSubCriterionState: jest.fn(),

  // Metrics
  createMetric: jest.fn(),
  findAllMetrics: jest.fn(),
  findOneMetric: jest.fn(),
  updateMetric: jest.fn(),
  updateMetricState: jest.fn(),

  // Variables
  createVariable: jest.fn(),
  findAllVariables: jest.fn(),
  findOneVariable: jest.fn(),
  updateVariable: jest.fn(),
  updateVariableState: jest.fn(),
};


describe('ParameterizationController', () => {
  let controller: ParameterizationController;
  let service: typeof mockParameterizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParameterizationController],
      providers: [
        {
          provide: ParameterizationService,
          useValue: mockParameterizationService,
        },
      ],
    }).compile();

    controller = module.get<ParameterizationController>(ParameterizationController);
    service = module.get(ParameterizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --- Pruebas para Endpoints de Standards ---
  describe('Standards Endpoints', () => {
    it('POST /standards -> debería llamar a service.createStandard', () => {
      const dto: CreateStandardDto = { name: 'Test Standard' };
      controller.createStandard(dto);
      expect(service.createStandard).toHaveBeenCalledWith(dto);
    });

    it('GET /standards -> debería llamar a service.findAllStandards con query', () => {
      const query: FindAllQueryDto = { state: ItemStatus.ACTIVE, page: 1, limit: 10 };
      controller.findAllStandards(query);
      expect(service.findAllStandards).toHaveBeenCalledWith(query);
    });

    it('GET /standards/:id -> debería llamar a service.findOneStandard con el ID correcto', () => {
      const id = 1;
      controller.findOneStandard(id);
      expect(service.findOneStandard).toHaveBeenCalledWith(id);
    });

    it('PATCH /standards/:id/state -> debería llamar a service.updateStandardState', () => {
      const id = 1;
      const updateStateDto: UpdateStateDto = { state: ItemStatus.INACTIVE };
      controller.updateStandardState(id, updateStateDto);
      expect(service.updateStandardState).toHaveBeenCalledWith(id, updateStateDto);
    });
  });

  // --- Pruebas para Endpoints de Criteria ---
  describe('Criteria Endpoints', () => {
    it('POST /criteria -> debería llamar a service.createCriterion', () => {
      const dto: CreateCriterionDto = { name: 'Test Criterion', standard_id: 1 };
      controller.createCriterion(dto);
      expect(service.createCriterion).toHaveBeenCalledWith(dto);
    });

    it('GET /standards/:standard_id/criteria -> debería llamar a service.findAllCriteria con el standard_id y query', () => {
      const standardId = 5;
      const query: FindAllQueryDto = { state: ItemStatus.ACTIVE };
      controller.findAllCriteriaForStandard(standardId, query);
      expect(service.findAllCriteria).toHaveBeenCalledWith(query, standardId);
    });

    it('PATCH /criteria/:id/state -> debería llamar a service.updateCriterionState', () => {
      const id = 1;
      const updateStateDto: UpdateStateDto = { state: ItemStatus.INACTIVE };
      controller.updateCriterionState(id, updateStateDto);
      expect(service.updateCriterionState).toHaveBeenCalledWith(id, updateStateDto);
    });
  });

  // --- Pruebas para Endpoints de Sub-criteria ---
  describe('SubCriteria Endpoints', () => {
    it('POST /sub-criteria -> debería llamar a service.createSubCriterion', () => {
      const dto: CreateSubCriterionDto = { name: 'Test SubCriterion', criterion_id: 1 };
      controller.createSubCriterion(dto);
      expect(service.createSubCriterion).toHaveBeenCalledWith(dto);
    });

    it('GET /criteria/:criterionId/sub-criteria -> debería llamar a service.findAllSubCriteria con query', () => {
      const criterionId = 10;
      const query: FindAllQueryDto = { state: ItemStatus.ACTIVE };
      controller.findAllSubCriteriaForCriterion(criterionId, query);
      expect(service.findAllSubCriteria).toHaveBeenCalledWith(query, criterionId);
    });

    it('PATCH /sub-criteria/:id/state -> debería llamar a service.updateSubCriterionState', () => {
      const id = 1;
      const updateStateDto: UpdateStateDto = { state: ItemStatus.INACTIVE };
      controller.updateSubCriterionState(id, updateStateDto);
      expect(service.updateSubCriterionState).toHaveBeenCalledWith(id, updateStateDto);
    });
  });

  // --- Pruebas para Endpoints de Metrics ---
  describe('Metrics Endpoints', () => {
    it('POST /metrics -> debería llamar a service.createMetric', () => {
      const dto: CreateMetricDto = { name: 'Test Metric', sub_criterion_id: 1 };
      controller.createMetric(dto);
      expect(service.createMetric).toHaveBeenCalledWith(dto);
    });

    it('GET /sub-criteria/:subCriterionId/metrics -> debería llamar a service.findAllMetrics con query', () => {
      const subCriterionId = 15;
      const query: FindAllQueryDto = { state: ItemStatus.ACTIVE };
      controller.findAllMetricsForSubCriterion(subCriterionId, query);
      expect(service.findAllMetrics).toHaveBeenCalledWith(query, subCriterionId);
    });

    it('PATCH /metrics/:id/state -> debería llamar a service.updateMetricState', () => {
      const id = 1;
      const updateStateDto: UpdateStateDto = { state: ItemStatus.INACTIVE };
      controller.updateMetricState(id, updateStateDto);
      expect(service.updateMetricState).toHaveBeenCalledWith(id, updateStateDto);
    });
  });

  // --- Pruebas para Endpoints de Variables ---
  describe('Variables Endpoints', () => {
    it('POST /variables -> debería llamar a service.createVariable', () => {
      const dto: CreateFormulaVariableDto = { symbol: 'X', metric_id: 1 };
      controller.createVariable(dto);
      expect(service.createVariable).toHaveBeenCalledWith(dto);
    });

    it('GET /metrics/:metricId/variables -> debería llamar a service.findAllVariables con query', () => {
      const metricId = 20;
      const query: FindAllQueryDto = { state: ItemStatus.ACTIVE };
      controller.findAllVariablesForMetric(metricId, query);
      expect(service.findAllVariables).toHaveBeenCalledWith(query, metricId);
    });

    it('PATCH /variables/:id/state -> debería llamar a service.updateVariableState', () => {
      const id = 1;
      const updateStateDto: UpdateStateDto = { state: ItemStatus.INACTIVE };
      controller.updateVariableState(id, updateStateDto);
      expect(service.updateVariableState).toHaveBeenCalledWith(id, updateStateDto);
    });
  });
});