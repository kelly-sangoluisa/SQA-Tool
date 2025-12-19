import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ConfigEvaluationService } from '../../src/modules/config-evaluation/services/config-evaluation.service';
import { Project, ProjectStatus } from '../../src/modules/config-evaluation/entities/project.entity';
import { Evaluation, EvaluationStatus } from '../../src/modules/config-evaluation/entities/evaluation.entity';
import { EvaluationCriterion, ImportanceLevel } from '../../src/modules/config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../../src/modules/config-evaluation/entities/evaluation_metric.entity';
import { Standard } from '../../src/modules/parameterization/entities/standard.entity';
import { Criterion } from '../../src/modules/parameterization/entities/criterion.entity';
import { Metric } from '../../src/modules/parameterization/entities/metric.entity';
import { User } from '../../src/users/entities/user.entity';

// Factory para crear un mock genérico de un repositorio de TypeORM
const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
  getRepository: jest.fn(),
});

// Mock para DataSource con transacciones
const mockDataSource = () => ({
  transaction: jest.fn(),
});

// Mock para el manager de transacciones
const mockTransactionManager = () => ({
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
  getRepository: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
});

// Tipo explícito para nuestro mock de repositorio
type MockRepository<T = any> = {
  find: jest.Mock;
  findOne: jest.Mock;
  findOneBy: jest.Mock;
  findBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  merge: jest.Mock;
  delete: jest.Mock;
  getRepository: jest.Mock;
};

type MockDataSource = {
  transaction: jest.Mock;
};

describe('ConfigEvaluationService', () => {
  let service: ConfigEvaluationService;
  let projectRepo: MockRepository<Project>;
  let evaluationRepo: MockRepository<Evaluation>;
  let evaluationCriterionRepo: MockRepository<EvaluationCriterion>;
  let evaluationMetricRepo: MockRepository<EvaluationMetric>;
  let standardRepo: MockRepository<Standard>;
  let criterionRepo: MockRepository<Criterion>;
  let metricRepo: MockRepository<Metric>;
  let userRepo: MockRepository<User>;
  let dataSource: MockDataSource;
  let mockManager: any;

  beforeEach(async () => {
    mockManager = mockTransactionManager();
    const mockDataSourceInstance = mockDataSource();

    // Configuramos el mock de transaction para ejecutar el callback directamente
    mockDataSourceInstance.transaction.mockImplementation(async (callback) => {
      return await callback(mockManager);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigEvaluationService,
        { provide: getRepositoryToken(Project), useValue: mockRepository() },
        { provide: getRepositoryToken(Evaluation), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationCriterion), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationMetric), useValue: mockRepository() },
        { provide: getRepositoryToken(Standard), useValue: mockRepository() },
        { provide: getRepositoryToken(Criterion), useValue: mockRepository() },
        { provide: getRepositoryToken(Metric), useValue: mockRepository() },
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: DataSource, useValue: mockDataSourceInstance },
      ],
    }).compile();

    service = module.get<ConfigEvaluationService>(ConfigEvaluationService);
    projectRepo = module.get(getRepositoryToken(Project));
    evaluationRepo = module.get(getRepositoryToken(Evaluation));
    evaluationCriterionRepo = module.get(getRepositoryToken(EvaluationCriterion));
    evaluationMetricRepo = module.get(getRepositoryToken(EvaluationMetric));
    standardRepo = module.get(getRepositoryToken(Standard));
    criterionRepo = module.get(getRepositoryToken(Criterion));
    metricRepo = module.get(getRepositoryToken(Metric));
    userRepo = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para Projects ---
  describe('Projects', () => {
    it('createProject debería crear y guardar un nuevo proyecto', async () => {
      const createDto = {
        name: 'Test Project',
        description: 'Test Description',
        minimum_threshold: 70,
        creator_user_id: 1,
      };
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      const expectedProject = {
        id: 1,
        ...createDto,
        status: ProjectStatus.IN_PROGRESS,
        created_at: new Date(),
        updated_at: new Date(),
      };

      userRepo.findOneBy.mockResolvedValue(mockUser);

      const mockProjectRepo = mockRepository();
      mockProjectRepo.create.mockReturnValue(expectedProject);
      mockProjectRepo.save.mockResolvedValue(expectedProject);
      mockManager.getRepository.mockReturnValue(mockProjectRepo);

      const result = await service.createProject(createDto);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: createDto.creator_user_id });
      expect(mockProjectRepo.create).toHaveBeenCalled();
      expect(mockProjectRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expectedProject);
    });

    it('createProject debería lanzar NotFoundException si el usuario no existe', async () => {
      const createDto = {
        name: 'Test Project',
        description: 'Test Description',
        minimum_threshold: 70,
        creator_user_id: 999,
      };

      userRepo.findOneBy.mockResolvedValue(null);

      await expect(service.createProject(createDto)).rejects.toThrow(NotFoundException);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });

    it('findAllProjects debería retornar todos los proyectos', async () => {
      const expectedProjects = [
        { id: 1, name: 'Project 1', status: ProjectStatus.IN_PROGRESS },
        { id: 2, name: 'Project 2', status: ProjectStatus.COMPLETED },
      ];

      projectRepo.find.mockResolvedValue(expectedProjects);

      const result = await service.findAllProjects();

      expect(projectRepo.find).toHaveBeenCalledWith({
        relations: ['creator', 'evaluations'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(expectedProjects);
    });

    it('findProjectById debería retornar un proyecto por ID', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        status: ProjectStatus.IN_PROGRESS,
      };

      projectRepo.findOneBy.mockResolvedValue(mockProject);

      const result = await service.findProjectById(1);

      expect(projectRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockProject);
    });

    it('findProjectById debería lanzar NotFoundException si el proyecto no existe', async () => {
      projectRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findProjectById(999)).rejects.toThrow(NotFoundException);
      expect(projectRepo.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  // --- Pruebas para Evaluations ---
  describe('Evaluations', () => {
    it('createEvaluation debería crear y guardar una nueva evaluación', async () => {
      const createDto = {
        project_id: 1,
        standard_id: 1,
      };
      const mockProject = { id: 1, name: 'Test Project' } as Project;
      const mockStandard = { id: 1, name: 'ISO 25010' } as Standard;
      const expectedEvaluation = {
        id: 1,
        project_id: createDto.project_id,
        standard_id: createDto.standard_id,
        status: EvaluationStatus.IN_PROGRESS,
        created_at: new Date(),
      };

      projectRepo.findOneBy.mockResolvedValue(mockProject);
      standardRepo.findOneBy.mockResolvedValue(mockStandard);

      const mockEvaluationRepo = mockRepository();
      mockEvaluationRepo.create.mockReturnValue(expectedEvaluation);
      mockEvaluationRepo.save.mockResolvedValue(expectedEvaluation);
      mockManager.getRepository.mockReturnValue(mockEvaluationRepo);

      const result = await service.createEvaluation(createDto);

      expect(projectRepo.findOneBy).toHaveBeenCalledWith({ id: createDto.project_id });
      expect(standardRepo.findOneBy).toHaveBeenCalledWith({ id: createDto.standard_id });
      expect(mockEvaluationRepo.create).toHaveBeenCalled();
      expect(mockEvaluationRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expectedEvaluation);
    });

    it('createEvaluation debería lanzar NotFoundException si el proyecto no existe', async () => {
      const createDto = {
        project_id: 999,
        standard_id: 1,
      };

      projectRepo.findOneBy.mockResolvedValue(null);

      await expect(service.createEvaluation(createDto)).rejects.toThrow(NotFoundException);
      expect(projectRepo.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });

    it('createEvaluation debería lanzar NotFoundException si el estándar no existe', async () => {
      const createDto = {
        project_id: 1,
        standard_id: 999,
      };
      const mockProject = { id: 1, name: 'Test Project' } as Project;

      projectRepo.findOneBy.mockResolvedValue(mockProject);
      standardRepo.findOneBy.mockResolvedValue(null);

      await expect(service.createEvaluation(createDto)).rejects.toThrow(NotFoundException);
      expect(standardRepo.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });

    it('findAllEvaluations debería retornar todas las evaluaciones', async () => {
      const expectedEvaluations = [
        { id: 1, project_id: 1, standard_id: 1 },
        { id: 2, project_id: 2, standard_id: 1 },
      ];

      evaluationRepo.find.mockResolvedValue(expectedEvaluations);

      const result = await service.findAllEvaluations();

      expect(evaluationRepo.find).toHaveBeenCalledWith({
        relations: [
          'project',
          'standard',
          'evaluation_criteria',
          'evaluation_criteria.criterion',
          'evaluation_criteria.criteria_results',
          'evaluation_result',
        ],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(expectedEvaluations);
    });

    it('findEvaluationById debería retornar una evaluación con todas sus relaciones', async () => {
      const mockEvaluation = {
        id: 1,
        project_id: 1,
        standard_id: 1,
        evaluation_criteria: [],
      };

      evaluationRepo.findOne.mockResolvedValue(mockEvaluation);

      const result = await service.findEvaluationById(1);

      expect(evaluationRepo.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockEvaluation);
    });

    it('findEvaluationById debería lanzar NotFoundException si la evaluación no existe', async () => {
      evaluationRepo.findOne.mockResolvedValue(null);

      await expect(service.findEvaluationById(999)).rejects.toThrow(NotFoundException);
    });

    it('findEvaluationsByProjectId debería retornar evaluaciones de un proyecto', async () => {
      const projectId = 1;
      const expectedEvaluations = [
        { id: 1, project_id: projectId, standard_id: 1 },
        { id: 2, project_id: projectId, standard_id: 2 },
      ];

      evaluationRepo.find.mockResolvedValue(expectedEvaluations);

      const result = await service.findEvaluationsByProjectId(projectId);

      expect(evaluationRepo.find).toHaveBeenCalled();
      expect(result).toEqual(expectedEvaluations);
    });

    it('findEvaluationsByStandardId debería retornar evaluaciones de un estándar', async () => {
      const standardId = 1;
      const expectedEvaluations = [
        { id: 1, project_id: 1, standard_id: standardId },
        { id: 2, project_id: 2, standard_id: standardId },
      ];

      evaluationRepo.find.mockResolvedValue(expectedEvaluations);

      const result = await service.findEvaluationsByStandardId(standardId);

      expect(evaluationRepo.find).toHaveBeenCalled();
      expect(result).toEqual(expectedEvaluations);
    });
  });

  // --- Pruebas para Evaluation Criteria ---
  describe('Evaluation Criteria', () => {
    it('createEvaluationCriterion debería crear y guardar un criterio de evaluación', async () => {
      const createDto = {
        evaluation_id: 1,
        criterion_id: 1,
        importance_level: ImportanceLevel.HIGH,
        importance_percentage: 30.5,
      };
      const mockEvaluation = { id: 1 } as Evaluation;
      const mockCriterion = { id: 1, name: 'Test Criterion' } as Criterion;
      const expectedEvaluationCriterion = {
        id: 1,
        ...createDto,
      };

      evaluationRepo.findOneBy.mockResolvedValue(mockEvaluation);
      criterionRepo.findOneBy.mockResolvedValue(mockCriterion);

      const mockEvalCriterionRepo = mockRepository();
      mockEvalCriterionRepo.create.mockReturnValue(expectedEvaluationCriterion);
      mockEvalCriterionRepo.save.mockResolvedValue(expectedEvaluationCriterion);
      mockManager.getRepository.mockReturnValue(mockEvalCriterionRepo);

      const result = await service.createEvaluationCriterion(createDto);

      expect(evaluationRepo.findOneBy).toHaveBeenCalledWith({ id: createDto.evaluation_id });
      expect(criterionRepo.findOneBy).toHaveBeenCalledWith({ id: createDto.criterion_id });
      expect(mockEvalCriterionRepo.create).toHaveBeenCalled();
      expect(mockEvalCriterionRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expectedEvaluationCriterion);
    });

    it('bulkCreateEvaluationCriteria debería lanzar BadRequestException si los porcentajes no suman 100', async () => {
      const bulkDto = {
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
        ],
      };

      await expect(service.bulkCreateEvaluationCriteria(bulkDto)).rejects.toThrow(BadRequestException);
    });

    it('bulkCreateEvaluationCriteria debería crear múltiples criterios cuando los porcentajes suman 100', async () => {
      const bulkDto = {
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

      const mockEvaluation = { id: 1 } as Evaluation;
      const mockCriteria = [
        { id: 1, name: 'Criterion 1' },
        { id: 2, name: 'Criterion 2' },
        { id: 3, name: 'Criterion 3' },
      ];

      evaluationRepo.findOneBy.mockResolvedValue(mockEvaluation);
      criterionRepo.find.mockResolvedValue(mockCriteria);

      mockManager.create.mockImplementation((entity, dto) => ({ id: dto.criterion_id, ...dto }));
      mockManager.save.mockImplementation((entity, data) => Promise.resolve(data));

      const result = await service.bulkCreateEvaluationCriteria(bulkDto);

      expect(evaluationRepo.findOneBy).toHaveBeenCalled();
      expect(criterionRepo.find).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledTimes(3);
      expect(mockManager.save).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });
  });

  // --- Pruebas para Evaluation Metrics ---
  describe('Evaluation Metrics', () => {
    it('getMetricsByCriterionId debería retornar un criterio con sus subcriterios y métricas', async () => {
      const criterionId = 1;
      const mockCriterion = {
        id: criterionId,
        name: 'Test Criterion',
        sub_criteria: [
          {
            id: 1,
            name: 'Sub Criterion 1',
            state: 'active',
            metrics: [
              { id: 1, name: 'Metric 1', state: 'active' },
              { id: 2, name: 'Metric 2', state: 'active' },
            ],
          },
        ],
      };

      // Mock del query builder
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockCriterion),
      };

      criterionRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getMetricsByCriterionId(criterionId);

      expect(criterionRepo.createQueryBuilder).toHaveBeenCalledWith('criterion');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('criterion.sub_criteria', 'sub_criterion', 'sub_criterion.state = :state', { state: 'active' });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('sub_criterion.metrics', 'metric', 'metric.state = :state', { state: 'active' });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('criterion.id = :criterionId', { criterionId });
      expect(result).toEqual(mockCriterion);
    });

    it('getMetricsByCriterionId debería lanzar NotFoundException si el criterio no existe', async () => {
      // Mock del query builder que retorna null
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      criterionRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await expect(service.getMetricsByCriterionId(999)).rejects.toThrow(NotFoundException);
    });

    it('bulkCreateEvaluationMetrics debería crear múltiples métricas de evaluación', async () => {
      const bulkDto = {
        metrics: [
          {
            eval_criterion_id: 1,
            metric_id: 1,
          },
          {
            eval_criterion_id: 1,
            metric_id: 2,
          },
        ],
      };

      const mockEvalCriteria = [{ id: 1 } as EvaluationCriterion];
      const mockMetrics = [
        { id: 1, name: 'Metric 1' },
        { id: 2, name: 'Metric 2' },
      ];

      // Mock evaluationCriterionRepo.find para validar que los criterios existen
      evaluationCriterionRepo.find.mockResolvedValue(mockEvalCriteria);

      // Mock metricRepo.find para validar que las métricas existen
      metricRepo.find.mockResolvedValue(mockMetrics);

      // Mock manager create and save para crear las métricas de evaluación
      const mockCreatedMetrics = bulkDto.metrics.map((m, index) => ({
        id: index + 1,
        eval_criterion_id: m.eval_criterion_id,
        metric_id: m.metric_id,
      }));

      let createCallIndex = 0;
      mockManager.create.mockImplementation(() => mockCreatedMetrics[createCallIndex++]);
      mockManager.save.mockImplementation((entity, data) => Promise.resolve(data));

      const result = await service.bulkCreateEvaluationMetrics(bulkDto);

      expect(evaluationCriterionRepo.find).toHaveBeenCalledWith({
        where: [{ id: 1 }],
      });
      expect(metricRepo.find).toHaveBeenCalledWith({
        where: [{ id: 1 }, { id: 2 }],
      });
      expect(mockManager.create).toHaveBeenCalledTimes(2);
      expect(mockManager.save).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('bulkCreateEvaluationMetrics debería lanzar BadRequestException si un criterio de evaluación no existe', async () => {
      const bulkDto = {
        metrics: [
          {
            eval_criterion_id: 999,
            metric_id: 1,
          },
        ],
      };

      // Mock find para retornar array vacío (no se encontró el criterio)
      evaluationCriterionRepo.find.mockResolvedValue([]);

      await expect(service.bulkCreateEvaluationMetrics(bulkDto)).rejects.toThrow(BadRequestException);
    });

    it('bulkCreateEvaluationMetrics debería lanzar BadRequestException si una métrica no existe', async () => {
      const bulkDto = {
        metrics: [
          {
            eval_criterion_id: 1,
            metric_id: 999,
          },
        ],
      };

      const mockEvalCriteria = [{ id: 1 } as EvaluationCriterion];

      // Mock evaluationCriterionRepo.find para que encuentre el criterio
      evaluationCriterionRepo.find.mockResolvedValue(mockEvalCriteria);

      // Mock metricRepo.find para retornar array vacío (no se encontró la métrica)
      metricRepo.find.mockResolvedValue([]);

      await expect(service.bulkCreateEvaluationMetrics(bulkDto)).rejects.toThrow(BadRequestException);
    });
  });
});
