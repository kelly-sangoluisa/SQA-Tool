import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Evaluation } from '../../config-evaluation/entities/evaluation.entity';
import { Project } from '../../config-evaluation/entities/project.entity';
import { EvaluationResult } from '../../entry-data/entities/evaluation_result.entity';
import { ImportanceLevel } from '../../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationCriteriaResult } from '../../entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../../entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriterion } from '../../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { Criterion } from '../../parameterization/entities/criterion.entity';
import { Metric } from '../../parameterization/entities/metric.entity';
import { Standard } from '../../parameterization/entities/standard.entity';

// DTOs
import { 
  EvaluationReportDto, 
  CriterionResultDto, 
  MetricResultDto,
  EvaluationListItemDto,
  EvaluationStatsDto
} from '../dto/evaluation-report.dto';

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
    @InjectRepository(EvaluationCriteriaResult)
    private readonly criteriaResultRepo: Repository<EvaluationCriteriaResult>,
    @InjectRepository(EvaluationMetricResult)
    private readonly metricResultRepo: Repository<EvaluationMetricResult>,
    @InjectRepository(EvaluationCriterion)
    private readonly evaluationCriterionRepo: Repository<EvaluationCriterion>,
    @InjectRepository(EvaluationMetric)
    private readonly evaluationMetricRepo: Repository<EvaluationMetric>,
    @InjectRepository(Criterion)
    private readonly criterionRepo: Repository<Criterion>,
    @InjectRepository(Metric)
    private readonly metricRepo: Repository<Metric>,
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
  ) {}

  /**
   * Obtiene el reporte completo de una evaluación con todos sus resultados
   * Solo CONSULTA datos, no calcula nada
   */
  async getEvaluationReport(evaluationId: number): Promise<EvaluationReportDto> {
    this.logger.log(`Obteniendo reporte para evaluación ${evaluationId}`);

    // Verificar que la evaluación existe
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
      relations: ['project', 'standard'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    // Obtener el resultado final de la evaluación
    const evaluationResult = await this.evaluationResultRepo.findOne({
      where: { evaluation_id: evaluationId },
    });

    if (!evaluationResult) {
      throw new NotFoundException(
        `No results found for evaluation ${evaluationId}. Please finalize the evaluation first.`
      );
    }

    // Obtener criterios de evaluación con sus resultados
    const evaluationCriteria = await this.evaluationCriterionRepo.find({
      where: { evaluation_id: evaluationId },
      relations: ['criterion'],
    });

    const criteriaResults: CriterionResultDto[] = [];

    for (const evalCriterion of evaluationCriteria) {
      // Obtener resultado del criterio
      const criteriaResult = await this.criteriaResultRepo.findOne({
        where: { eval_criterion_id: evalCriterion.id },
      });

      if (!criteriaResult) continue;

      // Obtener métricas del criterio
      const evaluationMetrics = await this.evaluationMetricRepo.find({
        where: { eval_criterion_id: evalCriterion.id },
        relations: ['metric'],
      });

      const metricsResults: MetricResultDto[] = [];

      for (const evalMetric of evaluationMetrics) {
        const metricResult = await this.metricResultRepo.findOne({
          where: { eval_metric_id: evalMetric.id },
        });

        if (metricResult && evalMetric.metric) {
          metricsResults.push({
            metric_name: evalMetric.metric.name,
            calculated_value: Number(metricResult.calculated_value),
            weighted_value: Number(metricResult.weighted_value),
            weight: 0, // El peso se maneja a nivel de ponderación, no en la métrica
          });
        }
      }

      criteriaResults.push({
        criterion_name: evalCriterion.criterion?.name || 'Unknown',
        importance_level: evalCriterion.importance_level,
        importance_percentage: Number(evalCriterion.importance_percentage || 0),
        final_score: Number(criteriaResult.final_score),
        metrics: metricsResults,
      });
    }

    return {
      evaluation_id: evaluation.id,
      project_name: evaluation.project?.name || 'Unknown',
      standard_name: evaluation.standard?.name || 'Unknown',
      created_at: evaluation.created_at,
      final_score: Number(evaluationResult.evaluation_score),
      conclusion: evaluationResult.conclusion || '',
      criteria_results: criteriaResults,
    };
  }

  /**
   * Obtiene las evaluaciones de los proyectos creados por un usuario específico
   */
  async getEvaluationsByUserId(userId: number): Promise<EvaluationListItemDto[]> {
    this.logger.log(`Obteniendo evaluaciones del usuario ${userId}`);

    // Buscar proyectos del usuario
    const userProjects = await this.projectRepo.find({
      where: { creator_user_id: userId },
    });

    this.logger.log(`📦 Proyectos encontrados: ${JSON.stringify(userProjects.map(p => ({ id: p.id, name: p.name, creator: p.creator_user_id })))}`);

    if (userProjects.length === 0) {
      this.logger.log(`❌ Usuario ${userId} no tiene proyectos`);
      return [];
    }

    const projectIds = userProjects.map(p => p.id);
    this.logger.log(`✅ Usuario ${userId} tiene ${projectIds.length} proyectos: ${projectIds.join(', ')}`);

    // Buscar evaluaciones de esos proyectos
    const evaluations = await this.evaluationRepo
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.project', 'project')
      .leftJoinAndSelect('evaluation.standard', 'standard')
      .where('evaluation.project_id IN (:...projectIds)', { projectIds })
      .orderBy('evaluation.created_at', 'DESC')
      .getMany();

    this.logger.log(`📊 Se encontraron ${evaluations.length} evaluaciones para los proyectos ${projectIds.join(', ')}`);
    this.logger.log(`📊 IDs de evaluaciones: ${evaluations.map(e => e.id).join(', ')}`);

    const evaluationsList: EvaluationListItemDto[] = [];

    for (const evaluation of evaluations) {
      const result = await this.evaluationResultRepo.findOne({
        where: { evaluation_id: evaluation.id },
      });

      evaluationsList.push({
        evaluation_id: evaluation.id,
        project_id: evaluation.project_id,
        project_name: evaluation.project?.name || 'Unknown',
        standard_name: evaluation.standard?.name || 'Unknown',
        created_at: evaluation.created_at,
        final_score: result ? Number(result.evaluation_score) : null,
        has_results: !!result,
      });
    }

    this.logger.log(`✅ Retornando ${evaluationsList.length} evaluaciones del usuario`);
    return evaluationsList;
  }

  /**
   * Obtiene la lista de todas las evaluaciones con información básica
   */
  async getAllEvaluations(): Promise<EvaluationListItemDto[]> {
    this.logger.log('Obteniendo lista de todas las evaluaciones');

    const evaluations = await this.evaluationRepo.find({
      relations: ['project', 'standard'],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`📊 Se encontraron ${evaluations.length} evaluaciones`);
    
    const evaluationsList: EvaluationListItemDto[] = [];

    for (const evaluation of evaluations) {
      this.logger.log(`🔍 Procesando evaluación ID: ${evaluation.id}`);
      
      const result = await this.evaluationResultRepo.findOne({
        where: { evaluation_id: evaluation.id },
      });

      this.logger.log(`📈 Resultado encontrado para eval ${evaluation.id}: ${!!result}`);

      evaluationsList.push({
        evaluation_id: evaluation.id,
        project_id: evaluation.project_id,
        project_name: evaluation.project?.name || 'Unknown',
        standard_name: evaluation.standard?.name || 'Unknown',
        created_at: evaluation.created_at,
        final_score: result ? Number(result.evaluation_score) : null,
        has_results: !!result,
      });
    }

    this.logger.log(`✅ Retornando ${evaluationsList.length} evaluaciones`);
    return evaluationsList;
  }

  /**
   * Obtiene evaluaciones filtradas por proyecto
   */
  async getEvaluationsByProject(projectId: number): Promise<EvaluationListItemDto[]> {
    this.logger.log(`Obteniendo evaluaciones del proyecto ${projectId}`);

    const evaluations = await this.evaluationRepo.find({
      where: { project_id: projectId },
      relations: ['project', 'standard'],
      order: { created_at: 'DESC' },
    });

    const evaluationsList: EvaluationListItemDto[] = [];

    for (const evaluation of evaluations) {
      const result = await this.evaluationResultRepo.findOne({
        where: { evaluation_id: evaluation.id },
      });

      evaluationsList.push({
        evaluation_id: evaluation.id,
        project_id: evaluation.project_id,
        project_name: evaluation.project?.name || 'Unknown',
        standard_name: evaluation.standard?.name || 'Unknown',
        created_at: evaluation.created_at,
        final_score: result ? Number(result.evaluation_score) : null,
        has_results: !!result,
      });
    }

    return evaluationsList;
  }

  /**
   * Obtiene estadísticas analíticas de una evaluación
   */
  async getEvaluationStats(evaluationId: number): Promise<EvaluationStatsDto> {
    this.logger.log(`Calculando estadísticas para evaluación ${evaluationId}`);

    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    // Obtener todos los criterios con resultados
    const evaluationCriteria = await this.evaluationCriterionRepo.find({
      where: { evaluation_id: evaluationId },
      relations: ['criterion'],
    });

    const criteriaWithResults: Array<{ name: string; score: number; importance: ImportanceLevel }> = [];
    let totalMetrics = 0;
    const scoresByImportance: { high: number[]; medium: number[]; low: number[] } = { 
      high: [], 
      medium: [], 
      low: [] 
    };

    for (const evalCriterion of evaluationCriteria) {
      const result = await this.criteriaResultRepo.findOne({
        where: { eval_criterion_id: evalCriterion.id },
      });

      if (result) {
        const score = Number(result.final_score);
        criteriaWithResults.push({
          name: evalCriterion.criterion?.name || 'Unknown',
          score: score,
          importance: evalCriterion.importance_level,
        });

        // Agrupar por importancia usando los valores del enum
        if (evalCriterion.importance_level === ImportanceLevel.HIGH) {
          scoresByImportance.high.push(score);
        } else if (evalCriterion.importance_level === ImportanceLevel.MEDIUM) {
          scoresByImportance.medium.push(score);
        } else {
          scoresByImportance.low.push(score);
        }
      }

      // Contar métricas
      const metrics = await this.evaluationMetricRepo.count({
        where: { eval_criterion_id: evalCriterion.id },
      });
      totalMetrics += metrics;
    }

    // Calcular promedios
    const avgScore =
      criteriaWithResults.length > 0
        ? criteriaWithResults.reduce((sum, c) => sum + c.score, 0) / criteriaWithResults.length
        : 0;

    // Encontrar mejor y peor criterio
    const sortedCriteria = [...criteriaWithResults].sort((a, b) => b.score - a.score);
    const best = sortedCriteria[0] || { name: 'N/A', score: 0 };
    const worst = sortedCriteria[sortedCriteria.length - 1] || { name: 'N/A', score: 0 };

    // Calcular promedios por importancia
    const avgByImportance = {
      high: scoresByImportance.high.length > 0
        ? scoresByImportance.high.reduce((a, b) => a + b, 0) / scoresByImportance.high.length
        : 0,
      medium: scoresByImportance.medium.length > 0
        ? scoresByImportance.medium.reduce((a, b) => a + b, 0) / scoresByImportance.medium.length
        : 0,
      low: scoresByImportance.low.length > 0
        ? scoresByImportance.low.reduce((a, b) => a + b, 0) / scoresByImportance.low.length
        : 0,
    };

    return {
      total_criteria: criteriaWithResults.length,
      total_metrics: totalMetrics,
      average_criteria_score: Number(avgScore.toFixed(2)),
      best_criterion: {
        name: best.name,
        score: best.score,
      },
      worst_criterion: {
        name: worst.name,
        score: worst.score,
      },
      score_by_importance: avgByImportance,
    };
  }
}
