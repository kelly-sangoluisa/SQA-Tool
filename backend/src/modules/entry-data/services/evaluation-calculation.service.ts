import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MetricScoringService } from './metric-scoring.service';
// Entities
import { EvaluationMetricResult } from '../entities/evaluation_metric_result.entity';
import { EvaluationCriteriaResult } from '../entities/evaluation_criteria_result.entity';
import { EvaluationResult } from '../entities/evaluation_result.entity';
import { ProjectResult } from '../entities/project_result.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { Evaluation, EvaluationStatus } from '../../config-evaluation/entities/evaluation.entity';
import { Project, ProjectStatus } from '../../config-evaluation/entities/project.entity';

// Services
import { FormulaEvaluationService } from './formula-evaluation.service';
import { EvaluationVariableService } from './evaluation-variable.service';
import { ScoreClassificationService } from './score-classification.service';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';

/**
 * Servicio de orquestación para cálculos de evaluación
 * Responsabilidad: Coordinar cálculos y agregaciones de resultados
 */
@Injectable()
export class EvaluationCalculationService {
  private readonly logger = new Logger(EvaluationCalculationService.name);

  constructor(
    // Repositories para resultados
    @InjectRepository(EvaluationMetricResult)
    private readonly evaluationMetricResultRepo: Repository<EvaluationMetricResult>,
    @InjectRepository(EvaluationCriteriaResult)
    private readonly evaluationCriteriaResultRepo: Repository<EvaluationCriteriaResult>,
    @InjectRepository(EvaluationResult)
    private readonly evaluationResultRepo: Repository<EvaluationResult>,
    @InjectRepository(ProjectResult)
    private readonly projectResultRepo: Repository<ProjectResult>,

    // Repositories de configuración
    @InjectRepository(EvaluationMetric)
    private readonly evaluationMetricRepo: Repository<EvaluationMetric>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    private readonly metricScoringService: MetricScoringService, // AGREGAR ESTA LÍNEA

    // Servicios especializados
    private readonly formulaEvaluationService: FormulaEvaluationService,
    private readonly evaluationVariableService: EvaluationVariableService,
    private readonly scoreClassificationService: ScoreClassificationService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Procesa datos de evaluación desde el frontend
   */
  async processEvaluationData(evaluationId: number, data: {
    evaluation_variables: CreateEvaluationVariableDto[]
  }): Promise<{ message: string; variables_saved: number }> {
    
    this.logger.log(`Processing evaluation data for evaluation ${evaluationId}`);
    
    await this.validateEvaluation(evaluationId);
    
    const savedVariables = await this.dataSource.transaction(async (manager) => {
      const variables: any[] = [];
      
      for (const variableDto of data.evaluation_variables) {
        await this.validateMetricBelongsToEvaluation(variableDto.eval_metric_id, evaluationId);
        const variable = await this.evaluationVariableService.createOrUpdate(variableDto);
        variables.push(variable);
      }
      
      return variables;
    });

    return {
      message: 'Evaluation data processed successfully',
      variables_saved: savedVariables.length
    };
  }

  /**
   * Calcula resultados para una métrica específica
   */
  async calculateMetricResult(evalMetricId: number): Promise<EvaluationMetricResult> {
  this.logger.log(`Calculating metric result for evaluation metric ${evalMetricId}`);

  const evaluationMetric = await this.getEvaluationMetricWithDetails(evalMetricId);
  const variables = await this.evaluationVariableService.findByEvaluationMetric(evalMetricId);

  this.logger.debug(`🔍 Variables retrieved: ${JSON.stringify(variables.map(v => ({ symbol: v.variable.symbol, value: v.value, valueType: typeof v.value })))}`);

  if (variables.length === 0) {
    throw new BadRequestException(`No variables found for evaluation metric ${evalMetricId}`);
  }

  const formula = evaluationMetric.metric.formula;
  const desiredThreshold = evaluationMetric.metric.desired_threshold;
  const worstCase = evaluationMetric.metric.worst_case;
  
  const variableValues = variables.map(v => ({
    symbol: v.variable.symbol,
    value: Number(v.value) // FORZAR conversión a número por si viene como string de PostgreSQL
  }));
  this.logger.debug(`📐 Formula: ${formula}, Variables: ${JSON.stringify(variableValues)}`);
  this.logger.debug(`🎯 Thresholds - Desired: ${desiredThreshold}, Worst: ${worstCase}`);

  // Usar el nuevo servicio de scoring
  const score = this.metricScoringService.calculateScore(
    formula,
    variableValues,
    desiredThreshold,
    worstCase,
  );

  this.logger.debug(`✅ Calculated value: ${score.calculated_value}, Weighted value: ${score.weighted_value}`);

  return this.saveMetricResult(evalMetricId, score.calculated_value, score.weighted_value);
}


  /**
   * Calcula y guarda resultados de criterios de evaluación
   */
  async calculateCriteriaResults(evaluationId: number): Promise<EvaluationCriteriaResult[]> {
    this.logger.log(`Calculating criteria results for evaluation ${evaluationId}`);
  
    const evaluation = await this.getEvaluationWithCriteria(evaluationId);
    const criteriaResults: EvaluationCriteriaResult[] = [];
  
    await this.dataSource.transaction(async (manager) => {
      for (const criterion of evaluation.evaluation_criteria) {
        const metricResults = await this.evaluationMetricResultRepo.find({
          where: { 
            evaluation_metric: { 
              evaluation_criterion: { id: criterion.id } 
            } 
          },
          relations: ['evaluation_metric']
        });
  
        if (metricResults.length === 0) {
          throw new BadRequestException(`No metric results found for criterion ${criterion.id}`);
        }
  
        // Calcular promedio de weighted_values de las métricas
        const averageWeightedValue = this.calculateSimpleAverage(
          metricResults.map(mr => mr.weighted_value)
        );
  
        // Multiplicar por importance_percentage (si existe, sino usar 1)
        const importanceMultiplier = criterion.importance_percentage 
          ? criterion.importance_percentage / 100 
          : 1;
        
        const criteriaScore = averageWeightedValue * importanceMultiplier;
  
        this.logger.debug(
          `📊 Criterion ${criterion.id}: avg_weighted=${averageWeightedValue}, ` +
          `importance=${criterion.importance_percentage}%, final_score=${criteriaScore}`
        );
  
        const criteriaResult = await this.saveCriteriaResult(criterion.id, criteriaScore);
        criteriaResults.push(criteriaResult);
      }
    });
  
    return criteriaResults;
  }

  /**
   * Calcula resultado final de evaluación
   */
  async calculateEvaluationResult(evaluationId: number): Promise<EvaluationResult> {
    this.logger.log(`Calculating final evaluation result for evaluation ${evaluationId}`);

    // Primero obtener los IDs de los criterios de esta evaluación
    const evaluation = await this.getEvaluationWithCriteria(evaluationId);
    const criterionIds = evaluation.evaluation_criteria.map(ec => ec.id);

    this.logger.debug(`📋 Criterion IDs for evaluation ${evaluationId}: ${JSON.stringify(criterionIds)}`);

    // Buscar solo los resultados de criterios de esta evaluación
    const criteriaResults = await this.evaluationCriteriaResultRepo
      .createQueryBuilder('cr')
      .where('cr.eval_criterion_id IN (:...criterionIds)', { criterionIds })
      .getMany();

    if (criteriaResults.length === 0) {
      throw new BadRequestException(`No criteria results found for evaluation ${evaluationId}`);
    }

    this.logger.debug(`📊 Criteria results scores: ${JSON.stringify(criteriaResults.map(cr => ({ id: cr.id, eval_criterion_id: cr.eval_criterion_id, final_score: cr.final_score, type: typeof cr.final_score })))}`);

    // SUMA de todos los final_score (no promedio)
    const finalScore = this.calculateSum(
      criteriaResults.map(cr => cr.final_score)
    );

    this.logger.debug(`🎯 Final evaluation score (sum): ${finalScore}`);

    return this.saveEvaluationResult(evaluationId, finalScore);
  }

  /**
   * Calcula resultado del proyecto completo
   */
  async calculateProjectResult(projectId: number): Promise<ProjectResult> {
    this.logger.log(`Calculating project result for project ${projectId}`);

    const evaluationResults = await this.evaluationResultRepo.find({
      where: { 
        evaluation: { 
          project: { id: projectId } 
        } 
      },
      relations: ['evaluation']
    });

    if (evaluationResults.length === 0) {
      throw new BadRequestException(`No evaluation results found for project ${projectId}`);
    }

    const projectScore = this.calculateSimpleAverage(
      evaluationResults.map(er => er.evaluation_score)
    );

    return this.saveProjectResult(projectId, projectScore);
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // =========================================================================

  private async validateEvaluation(evaluationId: number): Promise<void> {
    const evaluation = await this.evaluationRepo.findOneBy({ id: evaluationId });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }
  }

  private async validateMetricBelongsToEvaluation(evalMetricId: number, evaluationId: number): Promise<void> {
    const evaluationMetric = await this.evaluationMetricRepo.findOne({
      where: { id: evalMetricId },
      relations: ['evaluation_criterion', 'evaluation_criterion.evaluation']
    });

    if (!evaluationMetric) {
      throw new NotFoundException(`EvaluationMetric with ID ${evalMetricId} not found`);
    }

    if (evaluationMetric.evaluation_criterion.evaluation.id !== evaluationId) {
      throw new BadRequestException(
        `EvaluationMetric ${evalMetricId} does not belong to evaluation ${evaluationId}`
      );
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE CONSULTA
  // =========================================================================

  private async getEvaluationMetricWithDetails(evalMetricId: number): Promise<EvaluationMetric> {
    const evaluationMetric = await this.evaluationMetricRepo.findOne({
      where: { id: evalMetricId },
      relations: ['metric', 'evaluation_criterion']
    });

    if (!evaluationMetric) {
      throw new NotFoundException(`EvaluationMetric with ID ${evalMetricId} not found`);
    }

    return evaluationMetric;
  }

  private async getEvaluationWithCriteria(evaluationId: number): Promise<Evaluation> {
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
      relations: ['evaluation_criteria', 'evaluation_criteria.evaluation_metrics']
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    return evaluation;
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE CÁLCULO
  // =========================================================================

  private calculateSimpleAverage(scores: number[]): number {
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  /**
   * Calcula la suma de valores
   */
  private calculateSum(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0);
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE PERSISTENCIA
  // =========================================================================

  private async saveMetricResult(evalMetricId: number, calculatedValue: number, weightedValue: number): Promise<EvaluationMetricResult> {
    const metricResult = this.evaluationMetricResultRepo.create({
      eval_metric_id: evalMetricId,
      calculated_value: calculatedValue,
      weighted_value: weightedValue
    });

    const saved = await this.evaluationMetricResultRepo.save(metricResult);
    this.logger.log(`Saved metric result ${saved.id} with weighted value ${weightedValue}`);
    return saved;
  }

  private async saveCriteriaResult(criterionId: number, finalScore: number): Promise<EvaluationCriteriaResult> {
    const criteriaResult = this.evaluationCriteriaResultRepo.create({
      eval_criterion_id: criterionId,
      final_score: finalScore
    });

    const saved = await this.evaluationCriteriaResultRepo.save(criteriaResult);
    this.logger.log(`Saved criteria result ${saved.id} with final score ${finalScore}`);
    return saved;
  }

  private async saveEvaluationResult(evaluationId: number, evaluationScore: number): Promise<EvaluationResult> {
    // Obtener el proyecto para acceder al minimum_threshold
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
      relations: ['project']
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation ${evaluationId} not found`);
    }

    // Usar minimum_threshold del proyecto (default 80 si no está definido)
    const minimumThreshold = evaluation.project.minimum_threshold || 80;

    // Calcular clasificaciones
    const classification = this.scoreClassificationService.classifyScore(
      evaluationScore,
      minimumThreshold
    );

    this.logger.debug(
      `Evaluation ${evaluationId} classification: score=${evaluationScore}, ` +
      `threshold=${minimumThreshold}%, level=${classification.score_level}, ` +
      `grade=${classification.satisfaction_grade}`
    );

    const evaluationResult = this.evaluationResultRepo.create({
      evaluation_id: evaluationId,
      evaluation_score: evaluationScore,
      conclusion: 'Evaluación calculada automáticamente',
      score_level: classification.score_level,
      satisfaction_grade: classification.satisfaction_grade
    });

    const saved = await this.evaluationResultRepo.save(evaluationResult);
    this.logger.log(
      `Saved evaluation result ${saved.id} with score ${evaluationScore}, ` +
      `level: ${classification.score_level}, grade: ${classification.satisfaction_grade}`
    );
    return saved;
  }

  private async saveProjectResult(projectId: number, finalProjectScore: number): Promise<ProjectResult> {
    // Obtener el proyecto para acceder al minimum_threshold
    const project = await this.projectRepo.findOneBy({ id: projectId });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Usar minimum_threshold del proyecto (default 80 si no está definido)
    const minimumThreshold = project.minimum_threshold || 80;

    // Calcular clasificaciones
    const classification = this.scoreClassificationService.classifyScore(
      finalProjectScore,
      minimumThreshold
    );

    this.logger.debug(
      `Project ${projectId} classification: score=${finalProjectScore}, ` +
      `threshold=${minimumThreshold}%, level=${classification.score_level}, ` +
      `grade=${classification.satisfaction_grade}`
    );

    const projectResult = this.projectResultRepo.create({
      project_id: projectId,
      final_project_score: finalProjectScore,
      score_level: classification.score_level,
      satisfaction_grade: classification.satisfaction_grade
    });

    const saved = await this.projectResultRepo.save(projectResult);
    this.logger.log(
      `Saved project result ${saved.id} with score ${finalProjectScore}, ` +
      `level: ${classification.score_level}, grade: ${classification.satisfaction_grade}`
    );
    return saved;
  }

  /**
   * Actualiza el estado de una evaluación
   */
  async updateEvaluationStatus(evaluationId: number, status: EvaluationStatus): Promise<void> {
    await this.evaluationRepo.update(evaluationId, { status });
    this.logger.log(`Updated evaluation ${evaluationId} status to ${status}`);
  }

  /**
   * Actualiza el estado de un proyecto
   */
  async updateProjectStatus(projectId: number, status: ProjectStatus): Promise<void> {
    await this.projectRepo.update(projectId, { status });
    this.logger.log(`Updated project ${projectId} status to ${status}`);
  }
}