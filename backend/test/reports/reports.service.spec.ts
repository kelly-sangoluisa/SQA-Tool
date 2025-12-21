import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { ReportsService } from '../../src/modules/reports/services/reports.service';
import { Evaluation, EvaluationStatus } from '../../src/modules/config-evaluation/entities/evaluation.entity';
import { Project, ProjectStatus } from '../../src/modules/config-evaluation/entities/project.entity';
import { EvaluationResult } from '../../src/modules/entry-data/entities/evaluation_result.entity';
import { ProjectResult } from '../../src/modules/entry-data/entities/project_result.entity';
import { EvaluationCriteriaResult } from '../../src/modules/entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../../src/modules/entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriterion, ImportanceLevel } from '../../src/modules/config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../../src/modules/config-evaluation/entities/evaluation_metric.entity';
import { EvaluationVariable } from '../../src/modules/entry-data/entities/evaluation_variable.entity';
import { Standard } from '../../src/modules/parameterization/entities/standard.entity';
import { User } from '../../src/users/entities/user.entity';

// Factory para crear un mock genérico de un repositorio de TypeORM
const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

// Tipo explícito para nuestro mock de repositorio
type MockRepository<T = any> = {
  find: jest.Mock;
  findOne: jest.Mock;
  findOneBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

describe('ReportsService', () => {
  let service: ReportsService;
  let evaluationRepo: MockRepository<Evaluation>;
  let projectRepo: MockRepository<Project>;
  let evaluationResultRepo: MockRepository<EvaluationResult>;
  let projectResultRepo: MockRepository<ProjectResult>;
  let criteriaResultRepo: MockRepository<EvaluationCriteriaResult>;
  let metricResultRepo: MockRepository<EvaluationMetricResult>;
  let evaluationCriterionRepo: MockRepository<EvaluationCriterion>;
  let evaluationMetricRepo: MockRepository<EvaluationMetric>;
  let evaluationVariableRepo: MockRepository<EvaluationVariable>;
  let standardRepo: MockRepository<Standard>;
  let userRepo: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Evaluation), useValue: mockRepository() },
        { provide: getRepositoryToken(Project), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationResult), useValue: mockRepository() },
        { provide: getRepositoryToken(ProjectResult), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationCriteriaResult), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationMetricResult), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationCriterion), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationMetric), useValue: mockRepository() },
        { provide: getRepositoryToken(EvaluationVariable), useValue: mockRepository() },
        { provide: getRepositoryToken(Standard), useValue: mockRepository() },
        { provide: getRepositoryToken(User), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    evaluationRepo = module.get(getRepositoryToken(Evaluation));
    projectRepo = module.get(getRepositoryToken(Project));
    evaluationResultRepo = module.get(getRepositoryToken(EvaluationResult));
    projectResultRepo = module.get(getRepositoryToken(ProjectResult));
    criteriaResultRepo = module.get(getRepositoryToken(EvaluationCriteriaResult));
    metricResultRepo = module.get(getRepositoryToken(EvaluationMetricResult));
    evaluationCriterionRepo = module.get(getRepositoryToken(EvaluationCriterion));
    evaluationMetricRepo = module.get(getRepositoryToken(EvaluationMetric));
    evaluationVariableRepo = module.get(getRepositoryToken(EvaluationVariable));
    standardRepo = module.get(getRepositoryToken(Standard));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // TESTS PARA getEvaluationsByUserId
  // =========================================================
  describe('getEvaluationsByUserId', () => {
    it('debería retornar evaluaciones en progreso del usuario', async () => {
      const userId = 1;
      const mockProjects = [
        { id: 1, name: 'Proyecto 1', creator_user_id: userId },
        { id: 2, name: 'Proyecto 2', creator_user_id: userId },
      ];
      const mockEvaluations = [
        {
          id: 1,
          project_id: 1,
          status: EvaluationStatus.IN_PROGRESS,
          project: { name: 'Proyecto 1' },
          standard: { name: 'ISO 25010' },
          created_at: new Date(),
        },
      ];
      const mockResult = { evaluation_id: 1, evaluation_score: 85 };

      projectRepo.find.mockResolvedValue(mockProjects);
      evaluationRepo.find.mockResolvedValue(mockEvaluations);
      evaluationResultRepo.findOne.mockResolvedValue(mockResult);

      const result = await service.getEvaluationsByUserId(userId);

      expect(projectRepo.find).toHaveBeenCalledWith({
        where: { creator_user_id: userId },
      });
      expect(evaluationRepo.find).toHaveBeenCalledWith({
        where: {
          project_id: In([1, 2]),
          status: EvaluationStatus.IN_PROGRESS,
        },
        relations: ['project', 'standard'],
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].evaluation_id).toBe(1);
      expect(result[0].project_name).toBe('Proyecto 1');
    });

    it('debería retornar array vacío si el usuario no tiene proyectos', async () => {
      const userId = 999;
      projectRepo.find.mockResolvedValue([]);

      const result = await service.getEvaluationsByUserId(userId);

      expect(result).toEqual([]);
      expect(evaluationRepo.find).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // TESTS PARA getProjectsByUserId
  // =========================================================
  describe('getProjectsByUserId', () => {
    it('debería retornar proyectos del usuario con sus resultados', async () => {
      const userId = 1;
      const mockProjects = [
        {
          id: 1,
          name: 'Proyecto Test',
          description: 'Descripción',
          creator_user_id: userId,
          status: ProjectStatus.COMPLETED,
          minimum_threshold: 70,
          created_at: new Date(),
          updated_at: new Date(),
          evaluations: [],
        },
      ];
      const mockProjectResult = {
        project_id: 1,
        final_project_score: 85,
      };

      projectRepo.find.mockResolvedValue(mockProjects);
      projectResultRepo.findOne.mockResolvedValue(mockProjectResult);

      const result = await service.getProjectsByUserId(userId);

      expect(projectRepo.find).toHaveBeenCalledWith({
        where: { creator_user_id: userId },
        relations: ['evaluations'],
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].project_id).toBe(1);
      expect(result[0].project_name).toBe('Proyecto Test');
      expect(result[0].final_project_score).toBe(85);
      expect(result[0].meets_threshold).toBe(true);
    });

    it('debería manejar proyectos sin resultados', async () => {
      const userId = 1;
      const mockProjects = [
        {
          id: 1,
          name: 'Proyecto Sin Resultados',
          creator_user_id: userId,
          status: ProjectStatus.IN_PROGRESS,
          minimum_threshold: 70,
          created_at: new Date(),
          updated_at: new Date(),
          evaluations: [],
        },
      ];

      projectRepo.find.mockResolvedValue(mockProjects);
      projectResultRepo.findOne.mockResolvedValue(null);

      const result = await service.getProjectsByUserId(userId);

      expect(result).toHaveLength(1);
      expect(result[0].final_project_score).toBeNull();
      expect(result[0].meets_threshold).toBe(false);
    });
  });

  // =========================================================
  // TESTS PARA getEvaluationStats
  // =========================================================
  describe('getEvaluationStats', () => {
    it('debería calcular estadísticas de evaluación correctamente', async () => {
      const evaluationId = 1;
      const mockCriteria = [
        {
          id: 1,
          evaluation_id: evaluationId,
          criterion_id: 1,
          importance_level: ImportanceLevel.HIGH,
          criterion: { name: 'Usabilidad' },
        },
        {
          id: 2,
          evaluation_id: evaluationId,
          criterion_id: 2,
          importance_level: ImportanceLevel.MEDIUM,
          criterion: { name: 'Seguridad' },
        },
      ];
      const mockResults = [
        { eval_criterion_id: 1, final_score: 90 },
        { eval_criterion_id: 2, final_score: 70 },
      ];

      evaluationCriterionRepo.find.mockResolvedValue(mockCriteria);
      criteriaResultRepo.findOne
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);

      const result = await service.getEvaluationStats(evaluationId);

      expect(evaluationCriterionRepo.find).toHaveBeenCalledWith({
        where: { evaluation_id: evaluationId },
        relations: ['criterion'],
      });
      expect(result.total_criteria).toBe(2);
      expect(result.average_criteria_score).toBe(80);
      expect(result.best_criterion.name).toBe('Usabilidad');
      expect(result.best_criterion.score).toBe(90);
      expect(result.worst_criterion.name).toBe('Seguridad');
      expect(result.worst_criterion.score).toBe(70);
    });

    it('debería manejar evaluación sin resultados', async () => {
      const evaluationId = 999;
      evaluationCriterionRepo.find.mockResolvedValue([]);

      const result = await service.getEvaluationStats(evaluationId);

      expect(result.total_criteria).toBe(0);
      expect(result.average_criteria_score).toBe(0);
      expect(result.best_criterion.name).toBe('N/A');
      expect(result.worst_criterion.name).toBe('N/A');
    });

    it('debería calcular promedios por nivel de importancia', async () => {
      const evaluationId = 1;
      const mockCriteria = [
        {
          id: 1,
          evaluation_id: evaluationId,
          importance_level: ImportanceLevel.HIGH,
          criterion: { name: 'Criterio Alto 1' },
        },
        {
          id: 2,
          evaluation_id: evaluationId,
          importance_level: ImportanceLevel.HIGH,
          criterion: { name: 'Criterio Alto 2' },
        },
        {
          id: 3,
          evaluation_id: evaluationId,
          importance_level: ImportanceLevel.MEDIUM,
          criterion: { name: 'Criterio Medio' },
        },
      ];

      evaluationCriterionRepo.find.mockResolvedValue(mockCriteria);
      criteriaResultRepo.findOne
        .mockResolvedValueOnce({ final_score: 90 })
        .mockResolvedValueOnce({ final_score: 80 })
        .mockResolvedValueOnce({ final_score: 70 });

      const result = await service.getEvaluationStats(evaluationId);

      expect(result.score_by_importance.high).toBe(85); // (90+80)/2
      expect(result.score_by_importance.medium).toBe(70);
      expect(result.score_by_importance.low).toBe(0);
    });
  });

  // =========================================================
  // TESTS PARA getEvaluationsByProject
  // =========================================================
  describe('getEvaluationsByProject', () => {
    it('debería retornar todas las evaluaciones de un proyecto', async () => {
      const projectId = 1;
      const mockEvaluations = [
        {
          id: 1,
          project_id: projectId,
          status: EvaluationStatus.COMPLETED,
          project: { name: 'Proyecto Test' },
          standard: { name: 'ISO 25010' },
          created_at: new Date(),
        },
        {
          id: 2,
          project_id: projectId,
          status: EvaluationStatus.IN_PROGRESS,
          project: { name: 'Proyecto Test' },
          standard: { name: 'ISO 9126' },
          created_at: new Date(),
        },
      ];

      evaluationRepo.find.mockResolvedValue(mockEvaluations);
      evaluationResultRepo.findOne
        .mockResolvedValueOnce({ evaluation_score: 85 })
        .mockResolvedValueOnce(null);

      const result = await service.getEvaluationsByProject(projectId);

      expect(evaluationRepo.find).toHaveBeenCalledWith({
        where: { project_id: projectId },
        relations: ['project', 'standard'],
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].final_score).toBe(85);
      expect(result[0].has_results).toBe(true);
      expect(result[1].final_score).toBeNull();
      expect(result[1].has_results).toBe(false);
    });
  });

  // =========================================================
  // TESTS PARA getEvaluationReport
  // =========================================================
  describe('getEvaluationReport', () => {
    it('debería generar reporte completo de evaluación', async () => {
      const evaluationId = 1;
      const mockEvaluation = {
        id: evaluationId,
        project_id: 1,
        standard_id: 1,
        status: EvaluationStatus.COMPLETED,
        created_at: new Date(),
        project: { 
          id: 1, 
          name: 'Proyecto Test', 
          minimum_threshold: 70,
          creator: { name: 'Usuario Test' }
        },
        standard: { id: 1, name: 'ISO 25010', version: '2011' },
      };
      const mockEvaluationResult = {
        evaluation_id: evaluationId,
        evaluation_score: 85,
        conclusion: 'Aprobado',
      };

      evaluationRepo.findOne.mockResolvedValue(mockEvaluation);
      evaluationResultRepo.findOne.mockResolvedValue(mockEvaluationResult);
      evaluationCriterionRepo.find.mockResolvedValue([]);

      const result = await service.getEvaluationReport(evaluationId);

      expect(evaluationRepo.findOne).toHaveBeenCalledWith({
        where: { id: evaluationId },
        relations: ['project', 'standard', 'project.creator'],
      });
      expect(result.evaluation_id).toBe(evaluationId);
      expect(result.project_name).toBe('Proyecto Test');
      expect(result.standard_name).toBe('ISO 25010');
      expect(result.final_score).toBe(85);
      expect(result.conclusion).toBe('Aprobado');
    });

    it('debería lanzar NotFoundException si la evaluación no existe', async () => {
      const evaluationId = 999;
      evaluationRepo.findOne.mockResolvedValue(null);

      await expect(service.getEvaluationReport(evaluationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================
  // TESTS PARA getProjectReport
  // =========================================================
  describe('getProjectReport', () => {
    it('debería generar reporte completo de proyecto', async () => {
      const projectId = 1;
      const mockProject = {
        id: projectId,
        name: 'Proyecto Test',
        description: 'Descripción test',
        minimum_threshold: 70,
        status: ProjectStatus.COMPLETED,
        creator: { name: 'Usuario Test' },
        created_at: new Date(),
        evaluations: [],
      };
      const mockProjectResult = {
        project_id: projectId,
        final_project_score: 85,
      };

      projectRepo.findOne.mockResolvedValue(mockProject);
      projectResultRepo.findOne.mockResolvedValue(mockProjectResult);

      const result = await service.getProjectReport(projectId);

      expect(projectRepo.findOne).toHaveBeenCalledWith({
        where: { id: projectId },
        relations: ['creator', 'evaluations', 'evaluations.standard'],
      });
      expect(result.project_id).toBe(projectId);
      expect(result.project_name).toBe('Proyecto Test');
      expect(result.final_project_score).toBe(85);
      expect(result.meets_threshold).toBe(true);
    });

    it('debería lanzar NotFoundException si el proyecto no existe', async () => {
      const projectId = 999;
      projectRepo.findOne.mockResolvedValue(null);

      await expect(service.getProjectReport(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================
  // TESTS PARA getProjectStats
  // =========================================================
  describe('getProjectStats', () => {
    it('debería calcular estadísticas de proyecto correctamente', async () => {
      const projectId = 1;
      const mockEvaluations = [
        { id: 1, project_id: projectId, standard: { name: 'ISO 25010' } },
        { id: 2, project_id: projectId, standard: { name: 'ISO 9126' } },
      ];
      const mockProject = {
        id: projectId,
        name: 'Proyecto Test',
        evaluations: mockEvaluations,
      };
      const mockResults = [
        { evaluation_id: 1, evaluation_score: 90 },
        { evaluation_id: 2, evaluation_score: 80 },
      ];

      projectRepo.findOne.mockResolvedValue(mockProject);
      evaluationResultRepo.findOne
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);

      const result = await service.getProjectStats(projectId);

      expect(result.total_evaluations).toBe(2);
      expect(result.completed_evaluations).toBe(2);
      expect(result.average_evaluation_score).toBe(85);
      expect(result.highest_evaluation.score).toBe(90);
      expect(result.lowest_evaluation.score).toBe(80);
    });

    it('debería manejar proyecto sin evaluaciones', async () => {
      const projectId = 1;
      const mockProject = {
        id: projectId,
        name: 'Proyecto Test',
        evaluations: [],
      };
      
      projectRepo.findOne.mockResolvedValue(mockProject);

      const result = await service.getProjectStats(projectId);

      expect(result.total_evaluations).toBe(0);
      expect(result.completed_evaluations).toBe(0);
      expect(result.average_evaluation_score).toBe(0);
      expect(result.highest_evaluation.score).toBe(0);
      expect(result.lowest_evaluation.score).toBe(0);
    });
  });
});
