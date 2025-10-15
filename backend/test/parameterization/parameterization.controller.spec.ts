import { Test, TestingModule } from '@nestjs/testing';
import { ParameterizationController } from '../../src/modules/parameterization/controllers/parameterization.controller';
import { ParameterizationService } from '../../src/modules/parameterization/services/parameterization.service';
import { CreateStandardDto } from '../../src/modules/parameterization/dto/standard.dto';
import { CreateCriterionDto } from '../../src/modules/parameterization/dto/criterion.dto';

const mockParameterizationService = {
  createStandard: jest.fn(),
  findAllStandards: jest.fn(),
  findOneStandard: jest.fn(),
  updateStandard: jest.fn(),
  removeStandard: jest.fn(),

  createCriterion: jest.fn(),
  findAllCriteria: jest.fn(),
  findOneCriterion: jest.fn(),
  updateCriterion: jest.fn(),
  removeCriterion: jest.fn(),
  
  createSubCriterion: jest.fn(),
  findAllSubCriteria: jest.fn(),
  findOneSubCriterion: jest.fn(),
  updateSubCriterion: jest.fn(),
  removeSubCriterion: jest.fn(),

  createMetric: jest.fn(),
  findAllMetrics: jest.fn(),
  findOneMetric: jest.fn(),
  updateMetric: jest.fn(),
  removeMetric: jest.fn(),

  createVariable: jest.fn(),
  findAllVariables: jest.fn(),
  findOneVariable: jest.fn(),
  updateVariable: jest.fn(),
  removeVariable: jest.fn(),
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

    it('GET /standards -> debería llamar a service.findAllStandards', () => {
      controller.findAllStandards();
      expect(service.findAllStandards).toHaveBeenCalled();
    });

    it('GET /standards/:id -> debería llamar a service.findOneStandard con el ID correcto', () => {
      const id = 1;
      controller.findOneStandard(id);
      expect(service.findOneStandard).toHaveBeenCalledWith(id);
    });

    it('DELETE /standards/:id -> debería llamar a service.removeStandard con el ID correcto', () => {
        const id = 1;
        controller.removeStandard(id);
        expect(service.removeStandard).toHaveBeenCalledWith(id);
      });
  });

  // --- Pruebas para Endpoints de Criteria ---
  describe('Criteria Endpoints', () => {
    it('POST /criteria -> debería llamar a service.createCriterion', () => {
      const dto: CreateCriterionDto = { name: 'Test Criterion', standard_id: 1 };
      controller.createCriterion(dto);
      expect(service.createCriterion).toHaveBeenCalledWith(dto);
    });

    it('GET /standards/:standard_id/criteria -> debería llamar a service.findAllCriteria con el standard_id', () => {
      const standardId = 5;
      controller.findAllCriteriaForStandard(standardId);
      expect(service.findAllCriteria).toHaveBeenCalledWith(standardId);
    });
  });

  // --- Pruebas para Endpoints de Sub-criteria ---
  describe('SubCriteria Endpoints', () => {
    it('GET /criteria/:criterionId/sub-criteria -> debería llamar a service.findAllSubCriteria', () => {
      const criterionId = 10;
      controller.findAllSubCriteriaForCriterion(criterionId);
      expect(service.findAllSubCriteria).toHaveBeenCalledWith(criterionId);
    });
  });

  // --- Pruebas para Endpoints de Metrics ---
  describe('Metrics Endpoints', () => {
    it('GET /sub-criteria/:subCriterionId/metrics -> debería llamar a service.findAllMetrics', () => {
      const subCriterionId = 15;
      controller.findAllMetricsForSubCriterion(subCriterionId);
      expect(service.findAllMetrics).toHaveBeenCalledWith(subCriterionId);
    });
  });

    // --- Pruebas para Endpoints de Variables ---
    describe('Variables Endpoints', () => {
        it('GET /metrics/:metricId/variables -> debería llamar a service.findAllVariables', () => {
          const metricId = 20;
          controller.findAllVariablesForMetric(metricId);
          expect(service.findAllVariables).toHaveBeenCalledWith(metricId);
        });
    
        it('DELETE /variables/:id -> debería llamar a service.removeVariable', () => {
          const id = 1;
          controller.removeVariable(id);
          expect(service.removeVariable).toHaveBeenCalledWith(id);
        });
      });
});