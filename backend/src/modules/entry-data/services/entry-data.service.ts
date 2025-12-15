import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { EvaluationVariable } from '../entities/evaluation_variable.entity';
import { EvaluationMetricResult } from '../entities/evaluation_metric_result.entity';
import { EvaluationCriteriaResult } from '../entities/evaluation_criteria_result.entity';
import { EvaluationResult } from '../entities/evaluation_result.entity';
import { ProjectResult } from '../entities/project_result.entity';
import { EvaluationStatus } from '../../config-evaluation/entities/evaluation.entity';
import { ProjectStatus } from '../../config-evaluation/entities/project.entity';

// Services
import { EvaluationCalculationService } from './evaluation-calculation.service';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';

/**
 * Servicio principal de Entry Data - Coordinación de operaciones CRUD
 * Responsabilidad: Orquestar operaciones y proveer API unificada
 */
@Injectable()
export class EntryDataService {
  private readonly logger = new Logger(EntryDataService.name);

  constructor(
    @InjectRepository(EvaluationVariable)
    private readonly evaluationVariableRepo: Repository<EvaluationVariable>,
    @InjectRepository(EvaluationMetricResult)
    private readonly evaluationMetricResultRepo: Repository<EvaluationMetricResult>,
    @InjectRepository(EvaluationCriteriaResult)
    private readonly evaluationCriteriaResultRepo: Repository<EvaluationCriteriaResult>,
    @InjectRepository(EvaluationResult)
    private readonly evaluationResultRepo: Repository<EvaluationResult>,
    @InjectRepository(ProjectResult)
    private readonly projectResultRepo: Repository<ProjectResult>,

    private readonly evaluationCalculationService: EvaluationCalculationService,
  ) {}

  // =========================================================================
  // API PRINCIPAL PARA FRONTEND
  // =========================================================================

  /**
   * Recibe y procesa datos del frontend (entrada principal)
   */
  async receiveEvaluationData(evaluationId: number, data: {
    evaluation_variables: CreateEvaluationVariableDto[]
  }) {
    this.logger.log(`Receiving evaluation data for evaluation ${evaluationId}`);
    
    return await this.evaluationCalculationService.processEvaluationData(evaluationId, data);
  }

  /**
   * Finaliza una evaluación calculando todos sus resultados
   */
  async finalizeEvaluation(evaluationId: number) {
    this.logger.log(`Finalizing evaluation ${evaluationId}`);

    // 1. Obtener métricas de evaluación para esta evaluación
    const evaluationMetrics = await this.getEvaluationMetricsForEvaluation(evaluationId);
    const metricResults: EvaluationMetricResult[] = [];
    
    // 2. Calcular resultados de cada métrica
    for (const metric of evaluationMetrics) {
      const result = await this.evaluationCalculationService.calculateMetricResult(metric.eval_metric_id);
      metricResults.push(result);
    }

    // 3. Calcular resultados de criterios
    const criteriaResults = await this.evaluationCalculationService.calculateCriteriaResults(evaluationId);

    // 4. Calcular resultado final
    const evaluationResult = await this.evaluationCalculationService.calculateEvaluationResult(evaluationId);

    // 5. Actualizar estado de la evaluación a completed
    await this.evaluationCalculationService.updateEvaluationStatus(evaluationId, EvaluationStatus.COMPLETED);

    return {
      message: 'Evaluation finalized successfully',
      evaluation_id: evaluationId,
      metric_results: metricResults.length,
      criteria_results: criteriaResults.length,
      final_score: evaluationResult.evaluation_score,
      finalized_at: evaluationResult.created_at
    };
  }

  /**
   * Finaliza un proyecto calculando el resultado agregado
   */
  async finalizeProject(projectId: number) {
    this.logger.log(`Finalizing project ${projectId}`);

    const projectResult = await this.evaluationCalculationService.calculateProjectResult(projectId);

    // Actualizar estado del proyecto a completed
    await this.evaluationCalculationService.updateProjectStatus(projectId, ProjectStatus.COMPLETED);

    return {
      message: 'Project finalized successfully',
      project_id: projectId,
      final_score: projectResult.final_project_score,
      finalized_at: projectResult.created_at
    };
  }

  // =========================================================================
  // OPERACIONES DE CONSULTA
  // =========================================================================

  /**
   * Obtiene variables por evaluación
   */
  async getEvaluationVariables(evaluationId: number): Promise<EvaluationVariable[]> {
    return await this.evaluationVariableRepo
      .createQueryBuilder('ev')
      .innerJoin('ev.evaluation_metric', 'em')
      .innerJoin('em.evaluation_criterion', 'ec')
      .leftJoinAndSelect('ev.variable', 'fv')
      .leftJoinAndSelect('ev.evaluation_metric', 'em_full')
      .where('ec.evaluation_id = :evaluationId', { evaluationId })
      .getMany();
  }

  /**
   * Obtiene resultados de métricas por evaluación
   */
  async getMetricResults(evaluationId: number): Promise<EvaluationMetricResult[]> {
    return await this.evaluationMetricResultRepo
      .createQueryBuilder('emr')
      .innerJoin('emr.evaluation_metric', 'em')
      .innerJoin('em.evaluation_criterion', 'ec')
      .leftJoinAndSelect('emr.evaluation_metric', 'em_full')
      .leftJoinAndSelect('em_full.metric', 'metric')
      .where('ec.evaluation_id = :evaluationId', { evaluationId })
      .getMany();
  }

  /**
   * Obtiene resultado de evaluación
   */
  async getEvaluationResult(evaluationId: number): Promise<EvaluationResult> {
    const result = await this.evaluationResultRepo.findOne({
      where: { evaluation_id: evaluationId },
      relations: ['evaluation']
    });

    if (!result) {
      throw new NotFoundException(`No result found for evaluation ${evaluationId}`);
    }

    return result;
  }

  /**
   * Obtiene resultado de proyecto
   */
  async getProjectResult(projectId: number): Promise<ProjectResult> {
    const result = await this.projectResultRepo.findOne({
      where: { project_id: projectId },
      relations: ['project']
    });

    if (!result) {
      throw new NotFoundException(`No result found for project ${projectId}`);
    }

    return result;
  }

  /**
   * Obtiene resumen completo de evaluación
   */
  async getEvaluationSummary(evaluationId: number) {
    const [variables, metricResults, evaluationResult] = await Promise.all([
      this.getEvaluationVariables(evaluationId),
      this.getMetricResults(evaluationId),
      this.getEvaluationResult(evaluationId).catch(() => null)
    ]);

    return {
      evaluation_id: evaluationId,
      variables: {
        count: variables.length,
        data: variables
      },
      metric_results: {
        count: metricResults.length,
        data: metricResults
      },
      final_result: evaluationResult,
      status: evaluationResult ? 'completed' : 'in_progress'
    };
  }

  /**
   * Obtiene resultados de criterios por evaluación
   */
  async getCriteriaResults(evaluationId: number): Promise<EvaluationCriteriaResult[]> {
    return await this.evaluationCriteriaResultRepo
      .createQueryBuilder('ecr')
      .innerJoin('ecr.evaluation_criterion', 'ec')
      .leftJoinAndSelect('ecr.evaluation_criterion', 'ec_full')
      .where('ec.evaluation_id = :evaluationId', { evaluationId })
      .getMany();
  }

  /**
   * Obtiene resultados completos del proyecto
   */
  async getProjectCompleteResults(projectId: number) {
    const [
      projectResult,
      evaluationResults,
      criteriaResults,
      metricResults,
      variables
    ] = await Promise.all([
      this.getProjectResult(projectId).catch(() => null),
      this.getProjectEvaluationResults(projectId),
      this.getProjectCriteriaResults(projectId),
      this.getProjectMetricResults(projectId),
      this.getProjectEvaluationVariables(projectId)
    ]);

    return {
      project_id: projectId,
      project_result: projectResult,
      evaluation_results: { count: evaluationResults.length, data: evaluationResults },
      criteria_results: { count: criteriaResults.length, data: criteriaResults },
      metric_results: { count: metricResults.length, data: metricResults },
      evaluation_variables: { count: variables.length, data: variables },
      status: projectResult ? 'completed' : 'in_progress'
    };
  }

  /**
   * Obtiene todos los resultados de evaluaciones por proyecto
   */
  async getProjectEvaluationResults(projectId: number): Promise<EvaluationResult[]> {
    return await this.evaluationResultRepo
      .createQueryBuilder('er')
      .innerJoin('er.evaluation', 'e')
      .leftJoinAndSelect('er.evaluation', 'e_full')
      .where('e.project_id = :projectId', { projectId })
      .getMany();
  }

  /**
   * Obtiene todos los resultados de criterios por proyecto
   */
  async getProjectCriteriaResults(projectId: number): Promise<EvaluationCriteriaResult[]> {
    return await this.evaluationCriteriaResultRepo
      .createQueryBuilder('ecr')
      .innerJoin('ecr.evaluation_criterion', 'ec')
      .innerJoin('ec.evaluation', 'e')
      .leftJoinAndSelect('ecr.evaluation_criterion', 'ec_full')
      .leftJoinAndSelect('ec_full.evaluation', 'e_full')
      .where('e.project_id = :projectId', { projectId })
      .getMany();
  }

  /**
   * Obtiene todos los resultados de métricas por proyecto
   */
  async getProjectMetricResults(projectId: number): Promise<EvaluationMetricResult[]> {
    return await this.evaluationMetricResultRepo
      .createQueryBuilder('emr')
      .innerJoin('emr.evaluation_metric', 'em')
      .innerJoin('em.evaluation_criterion', 'ec')
      .innerJoin('ec.evaluation', 'e')
      .leftJoinAndSelect('emr.evaluation_metric', 'em_full')
      .leftJoinAndSelect('em_full.metric', 'm')
      .leftJoinAndSelect('em_full.evaluation_criterion', 'ec_full')
      .where('e.project_id = :projectId', { projectId })
      .getMany();
  }

  /**
   * Obtiene todas las variables por proyecto
   */
  async getProjectEvaluationVariables(projectId: number): Promise<EvaluationVariable[]> {
    return await this.evaluationVariableRepo
      .createQueryBuilder('ev')
      .innerJoin('ev.evaluation_metric', 'em')
      .innerJoin('em.evaluation_criterion', 'ec')
      .innerJoin('ec.evaluation', 'e')
      .leftJoinAndSelect('ev.variable', 'fv')
      .leftJoinAndSelect('ev.evaluation_metric', 'em_full')
      .where('e.project_id = :projectId', { projectId })
      .getMany();
  }

  /**
   * Obtiene estado de la evaluación
   */
  async getEvaluationStatus(evaluationId: number) {
    const [variables, metricResults, evaluationResult] = await Promise.all([
      this.getEvaluationVariables(evaluationId),
      this.getMetricResults(evaluationId),
      this.getEvaluationResult(evaluationId).catch(() => null)
    ]);

    const totalExpectedVariables = await this.getTotalExpectedVariables(evaluationId);

    return {
      evaluation_id: evaluationId,
      status: evaluationResult ? 'completed' : 'in_progress',
      progress: {
        variables: { submitted: variables.length, expected: totalExpectedVariables },
        metric_results: metricResults.length,
        is_finalized: !!evaluationResult
      },
      completion_percentage: totalExpectedVariables > 0 
        ? Math.round((variables.length / totalExpectedVariables) * 100) 
        : 0
    };
  }

  /**
   * Obtiene progreso del proyecto
   */
  async getProjectProgress(projectId: number) {
    const evaluationResults = await this.getProjectEvaluationResults(projectId);
    const projectResult = await this.getProjectResult(projectId).catch(() => null);
    
    // Obtener todas las evaluaciones del proyecto (completadas y pendientes)
    const query = `
      SELECT COUNT(*) as total_evaluations
      FROM evaluations e
      WHERE e.project_id = $1
    `;
    
    const totalEvaluationsResult = await this.evaluationVariableRepo.query(query, [projectId]);
    const totalEvaluations = parseInt(totalEvaluationsResult[0]?.total_evaluations || '0');
    
    return {
      project_id: projectId,
      total_evaluations: totalEvaluations,
      completed_evaluations: evaluationResults.length,
      completion_percentage: totalEvaluations > 0 
        ? Math.round((evaluationResults.length / totalEvaluations) * 100) 
        : 0,
      final_result: projectResult,
      status: projectResult ? 'completed' : 'in_progress',
      evaluation_results: evaluationResults
    };
  }

  // =========================================================================
  // OPERACIONES DE ELIMINACIÓN
  // =========================================================================

  /**
   * Elimina variable específica
   */
  async deleteVariable(evalMetricId: number, variableId: number): Promise<void> {
    const variable = await this.evaluationVariableRepo.findOne({
      where: {
        eval_metric_id: evalMetricId,
        variable_id: variableId
      }
    });

    if (!variable) {
      throw new NotFoundException(`Variable not found for metric ${evalMetricId} and variable ${variableId}`);
    }

    await this.evaluationVariableRepo.remove(variable);
    this.logger.log(`Deleted variable for metric ${evalMetricId}`);
  }

  /**
   * Elimina resultado de métrica
   */
  async deleteMetricResult(metricResultId: number): Promise<void> {
    const result = await this.evaluationMetricResultRepo.findOneBy({ id: metricResultId });
    
    if (!result) {
      throw new NotFoundException(`Metric result ${metricResultId} not found`);
    }

    await this.evaluationMetricResultRepo.remove(result);
    this.logger.log(`Deleted metric result ${metricResultId}`);
  }

  /**
   * Reinicia evaluación (elimina todos los resultados)
   */
  async resetEvaluation(evaluationId: number): Promise<void> {
    this.logger.log(`Resetting evaluation ${evaluationId}`);

    // Eliminar en orden inverso de dependencias
    await this.evaluationResultRepo.delete({ evaluation_id: evaluationId });
    
    await this.evaluationCriteriaResultRepo
      .createQueryBuilder()
      .delete()
      .where('eval_criterion_id IN (SELECT id FROM evaluation_criteria WHERE evaluation_id = :evaluationId)', { evaluationId })
      .execute();

    await this.evaluationMetricResultRepo
      .createQueryBuilder()
      .delete()
      .where('eval_metric_id IN (SELECT em.id FROM evaluation_metrics em INNER JOIN evaluation_criteria ec ON em.eval_criterion_id = ec.id WHERE ec.evaluation_id = :evaluationId)', { evaluationId })
      .execute();

    await this.evaluationVariableRepo
      .createQueryBuilder()
      .delete()
      .where('eval_metric_id IN (SELECT em.id FROM evaluation_metrics em INNER JOIN evaluation_criteria ec ON em.eval_criterion_id = ec.id WHERE ec.evaluation_id = :evaluationId)', { evaluationId })
      .execute();

    this.logger.log(`Reset completed for evaluation ${evaluationId}`);
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // =========================================================================

  private async getEvaluationMetricsForEvaluation(evaluationId: number) {
    // Obtener las métricas de evaluación (no los resultados)
    const query = `
      SELECT em.eval_metric_id
      FROM evaluation_metrics em
      INNER JOIN evaluation_criteria ec ON em.eval_criterion_id = ec.eval_criterion_id
      WHERE ec.evaluation_id = $1
    `;
    
    const result = await this.evaluationVariableRepo.query(query, [evaluationId]);
    return result;
  }

  private async getEvaluationMetrics(evaluationId: number) {
    return await this.evaluationMetricResultRepo
      .createQueryBuilder('emr')
      .innerJoin('emr.evaluation_metric', 'em')
      .innerJoin('em.evaluation_criterion', 'ec')
      .where('ec.evaluation_id = :evaluationId', { evaluationId })
      .select('emr.eval_metric_id', 'id')
      .getRawMany();
  }

  /**
   * Obtiene total de variables esperadas para una evaluación
   */
  private async getTotalExpectedVariables(evaluationId: number): Promise<number> {
    const query = `
      SELECT COUNT(fv.variable_id) as total
      FROM formula_variables fv
      INNER JOIN metrics m ON fv.metric_id = m.metric_id
      INNER JOIN evaluation_metrics em ON em.metric_id = m.metric_id
      INNER JOIN evaluation_criteria ec ON em.eval_criterion_id = ec.eval_criterion_id
      WHERE ec.evaluation_id = $1 AND fv.state = 'active'
    `;
    
    const result = await this.evaluationVariableRepo.query(query, [evaluationId]);
    return parseInt(result[0]?.total || '0');
  }
}