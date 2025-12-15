import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProjectStatus } from '../../config-evaluation/entities/project.entity';

// ENTITIES
import { Evaluation, EvaluationStatus } from '../../config-evaluation/entities/evaluation.entity';
import { Project } from '../../config-evaluation/entities/project.entity';
import { EvaluationResult } from '../../entry-data/entities/evaluation_result.entity';
import { ProjectResult } from '../../entry-data/entities/project_result.entity';
import { EvaluationCriteriaResult } from '../../entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../../entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriterion, ImportanceLevel } from '../../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { EvaluationVariable } from '../../entry-data/entities/evaluation_variable.entity';
import { Standard } from '../../parameterization/entities/standard.entity';
import { User } from '../../../users/entities/user.entity';

// DTOs
import {
  EvaluationReportDto,
  CriterionResultDto,
  MetricResultDto,
  EvaluationListItemDto,
  EvaluationStatsDto,
  ProjectStatsDto,
} from '../dto/evaluation-report.dto';

import { ProjectSummaryDto } from '../dto/project-summary.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(EvaluationResult)
    private readonly evaluationResultRepo: Repository<EvaluationResult>,

    @InjectRepository(ProjectResult)
    private readonly projectResultRepo: Repository<ProjectResult>,

    @InjectRepository(EvaluationCriteriaResult)
    private readonly criteriaResultRepo: Repository<EvaluationCriteriaResult>,

    @InjectRepository(EvaluationMetricResult)
    private readonly metricResultRepo: Repository<EvaluationMetricResult>,

    @InjectRepository(EvaluationCriterion)
    private readonly evaluationCriterionRepo: Repository<EvaluationCriterion>,

    @InjectRepository(EvaluationMetric)
    private readonly evaluationMetricRepo: Repository<EvaluationMetric>,

    @InjectRepository(EvaluationVariable)
    private readonly evaluationVariableRepo: Repository<EvaluationVariable>,

    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // =========================================================
  // LISTA DE EVALUACIONES ACTIVAS POR USUARIO (DASHBOARD)
  // =========================================================
  async getEvaluationsByUserId(userId: number): Promise<EvaluationListItemDto[]> {
    const projects = await this.projectRepo.find({
      where: { creator_user_id: userId },
    });

    if (!projects.length) return [];

    const projectIds = projects.map(p => p.id);

    const evaluations = await this.evaluationRepo.find({
      where: {
        project_id: In(projectIds),
        status: EvaluationStatus.IN_PROGRESS, // 🔥 FILTRO CLAVE
      },
      relations: ['project', 'standard'],
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      evaluations.map(async evaluation => {
        const result = await this.evaluationResultRepo.findOne({
          where: { evaluation_id: evaluation.id },
        });

        return {
          evaluation_id: evaluation.id,
          project_id: evaluation.project_id,
          project_name: evaluation.project.name,
          standard_name: evaluation.standard.name,
          created_at: evaluation.created_at,
          final_score: result ? Number(result.evaluation_score) : null,
          has_results: !!result,
          status: evaluation.status ?? EvaluationStatus.IN_PROGRESS, // ✅ FIX DTO
        };
      }),
    );
  }

  // =========================================================
  // PROYECTOS ACTIVOS DEL USUARIO (DASHBOARD)
  // =========================================================
 async getProjectsByUserId(userId: number): Promise<ProjectSummaryDto[]> {
  this.logger.log(`🔍 Service: Buscando TODOS los proyectos para usuario ${userId}`);

  const projects = await this.projectRepo.find({
    where: {
      creator_user_id: userId
    },
    relations: ['evaluations'],
    order: { created_at: 'DESC' },
  });

  this.logger.log(`📦 Service: Encontrados ${projects.length} proyectos para usuario ${userId}`);
  this.logger.log(`📋 Service: IDs de proyectos: ${projects.map(p => p.id).join(', ')}`);

  // Obtener los resultados de los proyectos
  const projectResults = await Promise.all(
    projects.map(async (project) => {
      const result = await this.projectResultRepo.findOne({
        where: { project_id: project.id },
      });

      const finalScore = result ? Number(result.final_project_score) : null;
      const meetsThreshold = finalScore !== null && project.minimum_threshold !== null
        ? finalScore >= Number(project.minimum_threshold)
        : false;

      return {
        project_id: project.id,
        project_name: project.name,
        project_description: project.description,
        minimum_threshold: project.minimum_threshold ?? null,
        final_project_score: finalScore,
        meets_threshold: meetsThreshold,
        status: project.status,
        evaluation_count: project.evaluations.length,
        created_at: project.created_at,
        updated_at: project.updated_at,
      };
    })
  );

  return projectResults;
}


  // =========================================================
  // ESTADÍSTICAS DE UNA EVALUACIÓN
  // =========================================================
  async getEvaluationStats(evaluationId: number): Promise<EvaluationStatsDto> {
    const criteria = await this.evaluationCriterionRepo.find({
      where: { evaluation_id: evaluationId },
      relations: ['criterion'],
    });

    const scores: { name: string; score: number }[] = [];
    const byImportance: Record<'high' | 'medium' | 'low', number[]> = {
      high: [],
      medium: [],
      low: [],
    };

    for (const c of criteria) {
      const result = await this.criteriaResultRepo.findOne({
        where: { eval_criterion_id: c.id },
      });

      if (!result) continue;

      const score = Number(result.final_score);
      scores.push({ name: c.criterion.name, score });

      if (c.importance_level === ImportanceLevel.HIGH)
        byImportance.high.push(score);
      else if (c.importance_level === ImportanceLevel.MEDIUM)
        byImportance.medium.push(score);
      else
        byImportance.low.push(score);
    }

    // Encontrar mejor y peor criterio
    let bestCriterion = { name: 'N/A', score: 0 };
    let worstCriterion = { name: 'N/A', score: 0 };

    if (scores.length > 0) {
      bestCriterion = scores.reduce((prev, current) => 
        current.score > prev.score ? current : prev
      );
      worstCriterion = scores.reduce((prev, current) => 
        current.score < prev.score ? current : prev
      );
    }

    return {
      total_criteria: scores.length,
      total_metrics: 0,
      average_criteria_score:
        scores.length > 0 ? scores.reduce((a, b) => a + b.score, 0) / scores.length : 0,
      best_criterion: bestCriterion,
      worst_criterion: worstCriterion,
      score_by_importance: {
        high: byImportance.high.length
          ? byImportance.high.reduce((a, b) => a + b, 0) / byImportance.high.length
          : 0,
        medium: byImportance.medium.length
          ? byImportance.medium.reduce((a, b) => a + b, 0) / byImportance.medium.length
          : 0,
        low: byImportance.low.length
          ? byImportance.low.reduce((a, b) => a + b, 0) / byImportance.low.length
          : 0,
      },
    };
  }

  // =========================================================
  // TODAS LAS EVALUACIONES (SIN FILTRO DE USUARIO)
  // =========================================================
  async getAllEvaluations(): Promise<EvaluationListItemDto[]> {
    const evaluations = await this.evaluationRepo.find({
      relations: ['project', 'standard'],
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      evaluations.map(async evaluation => {
        const result = await this.evaluationResultRepo.findOne({
          where: { evaluation_id: evaluation.id },
        });

        return {
          evaluation_id: evaluation.id,
          project_id: evaluation.project_id,
          project_name: evaluation.project.name,
          standard_name: evaluation.standard.name,
          created_at: evaluation.created_at,
          final_score: result ? Number(result.evaluation_score) : null,
          has_results: !!result,
          status: evaluation.status ?? EvaluationStatus.IN_PROGRESS,
        };
      }),
    );
  }

  // =========================================================
  // EVALUACIONES DE UN PROYECTO
  // =========================================================
  async getEvaluationsByProject(projectId: number): Promise<EvaluationListItemDto[]> {
    const evaluations = await this.evaluationRepo.find({
      where: { project_id: projectId },
      relations: ['project', 'standard'],
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      evaluations.map(async evaluation => {
        const result = await this.evaluationResultRepo.findOne({
          where: { evaluation_id: evaluation.id },
        });

        return {
          evaluation_id: evaluation.id,
          project_id: evaluation.project_id,
          project_name: evaluation.project.name,
          standard_name: evaluation.standard.name,
          created_at: evaluation.created_at,
          final_score: result ? Number(result.evaluation_score) : null,
          has_results: !!result,
          status: evaluation.status ?? EvaluationStatus.IN_PROGRESS,
        };
      }),
    );
  }

  // =========================================================
  // REPORTE COMPLETO DE UNA EVALUACIÓN
  // =========================================================
  async getEvaluationReport(evaluationId: number) {
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
      relations: ['project', 'standard', 'project.creator'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    const result = await this.evaluationResultRepo.findOne({
      where: { evaluation_id: evaluationId },
    });

    const criteria = await this.evaluationCriterionRepo.find({
      where: { evaluation_id: evaluationId },
      relations: ['criterion'],
    });

    const criteriaResults = await Promise.all(
      criteria.map(async (criterion) => {
        const criterionResult = await this.criteriaResultRepo.findOne({
          where: { eval_criterion_id: criterion.id },
        });

        const metrics = await this.evaluationMetricRepo.find({
          where: { eval_criterion_id: criterion.id },
          relations: ['metric'],
        });

        const metricsResults = await Promise.all(
          metrics.map(async (metric) => {
            const metricResult = await this.metricResultRepo.findOne({
              where: { eval_metric_id: metric.id },
            });

            const variables = await this.evaluationVariableRepo.find({
              where: { eval_metric_id: metric.id },
              relations: ['variable'],
            });

            return {
              metric_code: metric.metric.code,
              metric_name: metric.metric.name,
              metric_description: metric.metric.description,
              formula: metric.metric.formula,
              desired_threshold: null, // No existe en la entidad
              calculated_value: metricResult ? Number(metricResult.calculated_value) : 0,
              weighted_value: metricResult ? Number(metricResult.weighted_value) : 0,
              meets_threshold: false, // Se calcularía comparando con threshold si existiera
              variables: variables.map(v => ({
                symbol: v.variable.symbol,
                description: v.variable.description,
                value: Number(v.value),
              })),
            };
          }),
        );

        return {
          criterion_name: criterion.criterion.name,
          criterion_description: criterion.criterion.description,
          importance_level: criterion.importance_level,
          importance_percentage: Number(criterion.importance_percentage),
          final_score: criterionResult ? Number(criterionResult.final_score) : 0,
          metrics: metricsResults,
        };
      }),
    );

    const finalScore = result ? Number(result.evaluation_score) : 0;
    const projectThreshold = evaluation.project.minimum_threshold ? Number(evaluation.project.minimum_threshold) : 0;

    return {
      evaluation_id: evaluation.id,
      project_id: evaluation.project_id,
      project_name: evaluation.project.name,
      created_by_name: evaluation.project.creator.name,
      project_threshold: evaluation.project.minimum_threshold,
      standard_name: evaluation.standard.name,
      created_at: evaluation.created_at,
      final_score: finalScore,
      meets_threshold: finalScore >= projectThreshold,
      conclusion: result?.conclusion ?? '',
      criteria_results: criteriaResults,
    };
  }

  // =========================================================
  // REPORTE COMPLETO DE UN PROYECTO
  // =========================================================
  async getProjectReport(projectId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['creator', 'evaluations', 'evaluations.standard'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const projectResult = await this.projectResultRepo.findOne({
      where: { project_id: projectId },
    });

    const evaluationsWithResults = await Promise.all(
      project.evaluations.map(async (evaluation) => {
        const result = await this.evaluationResultRepo.findOne({
          where: { evaluation_id: evaluation.id },
        });

        const evalScore = result ? Number(result.evaluation_score) : 0;
        const threshold = project.minimum_threshold ? Number(project.minimum_threshold) : 0;

        return {
          evaluation_id: evaluation.id,
          standard_name: evaluation.standard.name,
          created_at: evaluation.created_at,
          final_score: evalScore,
          status: evaluation.status ?? EvaluationStatus.IN_PROGRESS,
          meets_evaluation_threshold: evalScore >= threshold,
        };
      }),
    );

    const finalProjectScore = projectResult ? Number(projectResult.final_project_score) : 0;
    const minThreshold = project.minimum_threshold ? Number(project.minimum_threshold) : 0;

    return {
      project_id: project.id,
      project_name: project.name,
      project_description: project.description,
      created_by_name: project.creator.name,
      created_at: project.created_at,
      final_project_score: finalProjectScore,
      minimum_threshold: minThreshold,
      meets_threshold: finalProjectScore >= minThreshold,
      status: project.status,
      evaluations: evaluationsWithResults,
    };
  }

  // =========================================================
  // ESTADÍSTICAS DE UN PROYECTO
  // =========================================================
  async getProjectStats(projectId: number): Promise<ProjectStatsDto> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['evaluations', 'evaluations.standard'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const evaluationScores = await Promise.all(
      project.evaluations.map(async (evaluation) => {
        const result = await this.evaluationResultRepo.findOne({
          where: { evaluation_id: evaluation.id },
        });

        return {
          standard_name: evaluation.standard.name,
          score: result ? Number(result.evaluation_score) : 0,
          has_results: !!result,
        };
      }),
    );

    const completedEvaluations = evaluationScores.filter(e => e.has_results);
    const scores = completedEvaluations.map(e => e.score);

    const highest = completedEvaluations.length > 0
      ? completedEvaluations.reduce((prev, current) => prev.score > current.score ? prev : current)
      : { standard_name: 'N/A', score: 0 };

    const lowest = completedEvaluations.length > 0
      ? completedEvaluations.reduce((prev, current) => prev.score < current.score ? prev : current)
      : { standard_name: 'N/A', score: 0 };

    return {
      total_evaluations: project.evaluations.length,
      completed_evaluations: completedEvaluations.length,
      average_evaluation_score: scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0,
      highest_evaluation: {
        standard_name: highest.standard_name,
        score: highest.score,
      },
      lowest_evaluation: {
        standard_name: lowest.standard_name,
        score: lowest.score,
      },
    };
  }
}
