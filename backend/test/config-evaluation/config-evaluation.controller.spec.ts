import { Test, TestingModule } from '@nestjs/testing';
import { ConfigEvaluationController } from '../../src/modules/config-evaluation/controllers/config-evaluation.controller';
import { ConfigEvaluationService } from '../../src/modules/config-evaluation/services/config-evaluation.service';
import { CreateProjectDto } from '../../src/modules/config-evaluation/dto/project.dto';
import { CreateEvaluationDto } from '../../src/modules/config-evaluation/dto/evaluation.dto';
import { CreateEvaluationCriterionDto, BulkCreateEvaluationCriteriaDto } from '../../src/modules/config-evaluation/dto/evaluation-criterion.dto';
import { BulkCreateEvaluationMetricsDto } from '../../src/modules/config-evaluation/dto/evaluation-metric.dto';
import { User } from '../../src/users/entities/user.entity';
import { ImportanceLevel } from '../../src/modules/config-evaluation/entities/evaluation-criterion.entity';

const mockConfigEvaluationService = {
  // Projects
  createProject: jest.fn(),
  findAllProjects: jest.fn(),
  findProjectById: jest.fn(),

  // Evaluations
  createEvaluation: jest.fn(),
  findAllEvaluations: jest.fn(),
  findEvaluationById: jest.fn(),
  findEvaluationsByProjectId: jest.fn(),
  findEvaluationsByStandardId: jest.fn(),

  // Evaluation Criteria
  createEvaluationCriterion: jest.fn(),
  bulkCreateEvaluationCriteria: jest.fn(),

  // Evaluation Metrics
  bulkCreateEvaluationMetrics: jest.fn(),
  getMetricsByCriterionId: jest.fn(),
};

describe('ConfigEvaluationController', () => {
  let controller: ConfigEvaluationController;
  let service: typeof mockConfigEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigEvaluationController],
      providers: [
        {
          provide: ConfigEvaluationService,
          useValue: mockConfigEvaluationService,
        },
      ],
    }).compile();

    controller = module.get<ConfigEvaluationController>(ConfigEvaluationController);
    service = module.get(ConfigEvaluationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // --- Pruebas para Endpoints de Projects ---
  describe('Projects Endpoints', () => {
    it('POST /config-evaluation/projects -> debería llamar a service.createProject', () => {
      const dto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        minimum_threshold: 70,
        creator_user_id: 1,
      };
      const mockUser = { id: 1 } as User;

      controller.createProject(dto, mockUser);

      expect(dto.creator_user_id).toBe(1);
      expect(service.createProject).toHaveBeenCalledWith(dto);
    });

    it('GET /config-evaluation/projects -> debería llamar a service.findAllProjects', () => {
      controller.findAllProjects();
      expect(service.findAllProjects).toHaveBeenCalled();
    });

    it('GET /config-evaluation/projects/:id -> debería llamar a service.findProjectById con el ID correcto', () => {
      const id = 1;
      controller.findProjectById(id);
      expect(service.findProjectById).toHaveBeenCalledWith(id);
    });
  });

  // --- Pruebas para Endpoints de Evaluations ---
  describe('Evaluations Endpoints', () => {
    it('POST /config-evaluation/evaluations -> debería llamar a service.createEvaluation', () => {
      const dto: CreateEvaluationDto = {
        project_id: 1,
        standard_id: 1,
      };
      controller.createEvaluation(dto);
      expect(service.createEvaluation).toHaveBeenCalledWith(dto);
    });

    it('GET /config-evaluation/evaluations -> debería llamar a service.findAllEvaluations', () => {
      controller.findAllEvaluations();
      expect(service.findAllEvaluations).toHaveBeenCalled();
    });

    it('GET /config-evaluation/evaluations/:id -> debería llamar a service.findEvaluationById con el ID correcto', () => {
      const id = 1;
      controller.findEvaluationById(id);
      expect(service.findEvaluationById).toHaveBeenCalledWith(id);
    });

    it('GET /config-evaluation/projects/:projectId/evaluations -> debería llamar a service.findEvaluationsByProjectId', () => {
      const projectId = 5;
      controller.findEvaluationsByProject(projectId);
      expect(service.findEvaluationsByProjectId).toHaveBeenCalledWith(projectId);
    });

    it('GET /config-evaluation/standards/:standardId/evaluations -> debería llamar a service.findEvaluationsByStandardId', () => {
      const standardId = 3;
      controller.findEvaluationsByStandard(standardId);
      expect(service.findEvaluationsByStandardId).toHaveBeenCalledWith(standardId);
    });
  });

  // --- Pruebas para Endpoints de Evaluation Criteria ---
  describe('Evaluation Criteria Endpoints', () => {
    it('POST /config-evaluation/evaluation-criteria -> debería llamar a service.createEvaluationCriterion', () => {
      const dto: CreateEvaluationCriterionDto = {
        evaluation_id: 1,
        criterion_id: 1,
        importance_level: ImportanceLevel.HIGH,
        importance_percentage: 30.5,
      };
      controller.createEvaluationCriterion(dto);
      expect(service.createEvaluationCriterion).toHaveBeenCalledWith(dto);
    });

    it('POST /config-evaluation/evaluation-criteria/bulk -> debería llamar a service.bulkCreateEvaluationCriteria', () => {
      const bulkDto: BulkCreateEvaluationCriteriaDto = {
        criteria: [
          {
            evaluation_id: 1,
            criterion_id: 1,
            importance_level: ImportanceLevel.HIGH,
            importance_percentage: 50,
          },
          {
            evaluation_id: 1,
            criterion_id: 2,
            importance_level: ImportanceLevel.MEDIUM,
            importance_percentage: 30,
          },
          {
            evaluation_id: 1,
            criterion_id: 3,
            importance_level: ImportanceLevel.LOW,
            importance_percentage: 20,
          },
        ],
      };
      controller.bulkCreateEvaluationCriteria(bulkDto);
      expect(service.bulkCreateEvaluationCriteria).toHaveBeenCalledWith(bulkDto);
    });
  });

  // --- Pruebas para Endpoints de Evaluation Metrics ---
  describe('Evaluation Metrics Endpoints', () => {
    it('GET /config-evaluation/criteria/:criterionId/metrics -> debería llamar a service.getMetricsByCriterionId', () => {
      const criterionId = 10;
      controller.getMetricsByCriterion(criterionId);
      expect(service.getMetricsByCriterionId).toHaveBeenCalledWith(criterionId);
    });

    it('POST /config-evaluation/evaluation-metrics/bulk -> debería llamar a service.bulkCreateEvaluationMetrics', () => {
      const bulkDto: BulkCreateEvaluationMetricsDto = {
        metrics: [
          {
            eval_criterion_id: 1,
            metric_id: 1,
          },
          {
            eval_criterion_id: 1,
            metric_id: 2,
          },
          {
            eval_criterion_id: 2,
            metric_id: 3,
          },
        ],
      };
      controller.bulkCreateEvaluationMetrics(bulkDto);
      expect(service.bulkCreateEvaluationMetrics).toHaveBeenCalledWith(bulkDto);
    });
  });
});
