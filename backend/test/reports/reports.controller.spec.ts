import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../../src/modules/reports/controllers/reports.controller';
import { ReportsService } from '../../src/modules/reports/services/reports.service';
import { AIAnalysisService } from '../../src/modules/reports/services/ai-analysis.service';
import { EvaluationStatus } from '../../src/modules/config-evaluation/entities/evaluation.entity';
import { ProjectStatus } from '../../src/modules/config-evaluation/entities/project.entity';

const mockReportsService = {
  getEvaluationsByUserId: jest.fn(),
  getProjectsByUserId: jest.fn(),
  getEvaluationStats: jest.fn(),
  getEvaluationsByProject: jest.fn(),
  getEvaluationReport: jest.fn(),
  getProjectReport: jest.fn(),
  getProjectStats: jest.fn(),
};

const mockAIAnalysisService = {
  analyzeProjectQuality: jest.fn(),
};

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: typeof mockReportsService;
  let aiAnalysisService: typeof mockAIAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
        {
          provide: AIAnalysisService,
          useValue: mockAIAnalysisService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get(ReportsService);
    aiAnalysisService = module.get(AIAnalysisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/my-projects
  // =========================================================
  describe('GET /reports/my-projects', () => {
    it('debería retornar proyectos del usuario autenticado', async () => {
      const mockRequest = { currentUser: { id: 1 } };
      const mockProjects = [
        {
          id: 1,
          name: 'Proyecto Test',
          description: 'Descripción',
          creator_user_id: 1,
          status: ProjectStatus.COMPLETED,
          final_project_score: 85,
          meets_threshold: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      reportsService.getProjectsByUserId.mockResolvedValue(mockProjects);

      const result = await controller.getMyProjects(mockRequest);

      expect(reportsService.getProjectsByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProjects);
      expect(result).toHaveLength(1);
    });

    it('debería lanzar error si no hay usuario autenticado', async () => {
      const mockRequest = { currentUser: null };

      await expect(controller.getMyProjects(mockRequest)).rejects.toThrow();
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/my-evaluations
  // =========================================================
  describe('GET /reports/my-evaluations', () => {
    it('debería retornar evaluaciones del usuario autenticado', async () => {
      const mockRequest = { currentUser: { id: 1 } };
      const mockEvaluations = [
        {
          evaluation_id: 1,
          project_id: 1,
          project_name: 'Proyecto Test',
          standard_name: 'ISO 25010',
          created_at: new Date(),
          final_score: 85,
          has_results: true,
          status: EvaluationStatus.IN_PROGRESS,
        },
      ];

      reportsService.getEvaluationsByUserId.mockResolvedValue(mockEvaluations);

      const result = await controller.getMyEvaluations(mockRequest);

      expect(reportsService.getEvaluationsByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEvaluations);
      expect(result).toHaveLength(1);
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/projects/:projectId/evaluations
  // =========================================================
  describe('GET /reports/projects/:projectId/evaluations', () => {
    it('debería retornar evaluaciones de un proyecto específico', async () => {
      const projectId = 1;
      const mockEvaluations = [
        {
          evaluation_id: 1,
          project_id: projectId,
          project_name: 'Proyecto Test',
          standard_name: 'ISO 25010',
          created_at: new Date(),
          final_score: 85,
          has_results: true,
          status: EvaluationStatus.COMPLETED,
        },
      ];

      reportsService.getEvaluationsByProject.mockResolvedValue(mockEvaluations);

      const result = await controller.getEvaluationsByProject(projectId);

      expect(reportsService.getEvaluationsByProject).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockEvaluations);
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/evaluations/:evaluationId
  // =========================================================
  describe('GET /reports/evaluations/:evaluationId', () => {
    it('debería retornar reporte completo de evaluación', async () => {
      const evaluationId = 1;
      const mockReport = {
        evaluation_id: evaluationId,
        project_id: 1,
        project_name: 'Proyecto Test',
        standard_name: 'ISO 25010',
        standard_version: '2011',
        evaluation_score: 85,
        conclusion: 'Aprobado',
        created_at: new Date(),
        criteria: [],
        status: EvaluationStatus.COMPLETED,
      };

      reportsService.getEvaluationReport.mockResolvedValue(mockReport);

      const result = await controller.getEvaluationReport(evaluationId);

      expect(reportsService.getEvaluationReport).toHaveBeenCalledWith(evaluationId);
      expect(result).toEqual(mockReport);
      expect(result.evaluation_id).toBe(evaluationId);
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/evaluations/:evaluationId/stats
  // =========================================================
  describe('GET /reports/evaluations/:evaluationId/stats', () => {
    it('debería retornar estadísticas de evaluación', async () => {
      const evaluationId = 1;
      const mockStats = {
        total_criteria: 5,
        total_metrics: 15,
        average_criteria_score: 82.5,
        best_criterion: { name: 'Usabilidad', score: 95 },
        worst_criterion: { name: 'Rendimiento', score: 70 },
        score_by_importance: {
          high: 85,
          medium: 80,
          low: 75,
        },
      };

      reportsService.getEvaluationStats.mockResolvedValue(mockStats);

      const result = await controller.getEvaluationStats(evaluationId);

      expect(reportsService.getEvaluationStats).toHaveBeenCalledWith(evaluationId);
      expect(result).toEqual(mockStats);
      expect(result.total_criteria).toBe(5);
      expect(result.best_criterion.name).toBe('Usabilidad');
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/projects/:projectId/report
  // =========================================================
  describe('GET /reports/projects/:projectId/report', () => {
    it('debería retornar reporte completo de proyecto', async () => {
      const projectId = 1;
      const mockReport = {
        project_id: projectId,
        project_name: 'Proyecto Test',
        description: 'Descripción test',
        creator_name: 'Usuario Test',
        minimum_threshold: 70,
        final_project_score: 85,
        meets_threshold: true,
        evaluations: [],
        created_at: new Date(),
        status: ProjectStatus.COMPLETED,
      };

      reportsService.getProjectReport.mockResolvedValue(mockReport);

      const result = await controller.getProjectReport(projectId);

      expect(reportsService.getProjectReport).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockReport);
      expect(result.project_id).toBe(projectId);
      expect(result.meets_threshold).toBe(true);
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: GET /reports/projects/:projectId/stats
  // =========================================================
  describe('GET /reports/projects/:projectId/stats', () => {
    it('debería retornar estadísticas de proyecto', async () => {
      const projectId = 1;
      const mockStats = {
        total_evaluations: 3,
        completed_evaluations: 2,
        average_evaluation_score: 82,
        highest_evaluation: { standard_name: 'ISO 25010', score: 90 },
        lowest_evaluation: { standard_name: 'ISO 9126', score: 75 },
      };

      reportsService.getProjectStats.mockResolvedValue(mockStats);

      const result = await controller.getProjectStats(projectId);

      expect(reportsService.getProjectStats).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockStats);
      expect(result.total_evaluations).toBe(3);
      expect(result.average_evaluation_score).toBe(82);
    });
  });

  // =========================================================
  // TESTS PARA ENDPOINT: POST /reports/projects/:projectId/ai-analysis
  // =========================================================
  describe('POST /reports/projects/:projectId/ai-analysis', () => {
    it('debería generar análisis de IA para el proyecto', async () => {
      const projectId = 1;
      const mockAnalysis = {
        projectId,
        analysis: 'Análisis generado por IA',
        recommendations: ['Recomendación 1', 'Recomendación 2'],
        strengths: ['Fortaleza 1'],
        weaknesses: ['Debilidad 1'],
        generatedAt: new Date(),
      };

      aiAnalysisService.analyzeProjectQuality.mockResolvedValue(mockAnalysis);

      const result = await controller.generateAIAnalysis(projectId);

      expect(aiAnalysisService.analyzeProjectQuality).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockAnalysis);
      expect(result.projectId).toBe(projectId);
    });
  });

  // =========================================================
  // TESTS ADICIONALES - Validación de parámetros
  // =========================================================
  describe('Validación de parámetros', () => {
    it('debería aceptar IDs numéricos válidos', async () => {
      const validIds = [1, 999, 12345];
      
      for (const id of validIds) {
        reportsService.getEvaluationReport.mockResolvedValue({
          evaluation_id: id,
          project_name: 'Test',
          standard_name: 'Test',
        });
        
        await controller.getEvaluationReport(id);
        expect(reportsService.getEvaluationReport).toHaveBeenCalledWith(id);
      }
    });
  });

  // =========================================================
  // TESTS ADICIONALES - Manejo de casos límite
  // =========================================================
  describe('Casos límite', () => {
    it('debería manejar proyectos sin evaluaciones', async () => {
      const projectId = 1;
      reportsService.getEvaluationsByProject.mockResolvedValue([]);

      const result = await controller.getEvaluationsByProject(projectId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería manejar usuario sin proyectos', async () => {
      const mockRequest = { currentUser: { id: 999 } };
      reportsService.getProjectsByUserId.mockResolvedValue([]);

      const result = await controller.getMyProjects(mockRequest);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
