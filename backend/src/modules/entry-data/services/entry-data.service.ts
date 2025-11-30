import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ObjectLiteral } from 'typeorm';

// Entities - Entry Data
import { EvaluationCriteriaResult } from '../entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../entities/evaluation_metric_result.entity';
import { EvaluationResult } from '../entities/evaluation_result.entity';
import { EvaluationVariable } from '../entities/evaluation_variable.entity';
import { ProjectResult } from '../entities/project_result.entity';

// Entities - Related modules
//import { EvaluationCriterion } from '../../config-evaluation/entities/evaluation-criterion.entity';
//import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { Evaluation, EvaluationStatus } from '../../config-evaluation/entities/evaluation.entity';
import { Project, ProjectStatus } from '../../config-evaluation/entities/project.entity';
//import { FormulaVariable } from '../../parameterization/entities/formula-variable.entity';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';
import { CreateEvaluationResultDto } from '../dto/evaluation-result.dto';
import { CreateEvaluationCriteriaResultDto } from '../dto/evaluation-criteria-result.dto';
import { CreateEvaluationMetricResultDto } from '../dto/evaluation-metric-result.dto';
import { CreateProjectResultDto } from '../dto/project-result.dto';

@Injectable()
export class EntryDataService {
  private readonly logger = new Logger(EntryDataService.name);

  constructor(
    // Entry Data repositories
    @InjectRepository(EvaluationCriteriaResult)
    private readonly evaluationCriteriaResultRepo: Repository<EvaluationCriteriaResult>,
    @InjectRepository(EvaluationMetricResult)
    private readonly evaluationMetricResultRepo: Repository<EvaluationMetricResult>,
    @InjectRepository(EvaluationResult)
    private readonly evaluationResultRepo: Repository<EvaluationResult>,
    @InjectRepository(EvaluationVariable)
    private readonly evaluationVariableRepo: Repository<EvaluationVariable>,
    @InjectRepository(ProjectResult)
    private readonly projectResultRepo: Repository<ProjectResult>,

    // Related repositories for validations
    //@InjectRepository(EvaluationCriterion)
    //private readonly evaluationCriterionRepo: Repository<EvaluationCriterion>,
    //@InjectRepository(EvaluationMetric)
    //private readonly evaluationMetricRepo: Repository<EvaluationMetric>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    //@InjectRepository(FormulaVariable)
    //private readonly formulaVariableRepo: Repository<FormulaVariable>,

    private readonly dataSource: DataSource,
    private readonly calculateService: any,
  ) {}

  // --- Helper genérico para validaciones ---
  private async findOneOrFail<T extends ObjectLiteral>(
    repo: Repository<T>,
    id: number,
    entityName: string,
  ): Promise<T> {
    if (!id || id <= 0) {
      throw new BadRequestException(`Invalid ${entityName} ID: ${id}`);
    }
    
    const entity = await repo.findOneBy({ id: id } as any);
    if (!entity) {
      throw new NotFoundException(`${entityName} with ID ${id} not found`);
    }
    return entity;
  }

  // =============================================================================
  // 📊 FUNCIONES PARA BUSCAR RESULTADOS POR PROYECTO
  // =============================================================================

  /**
   * Obtiene todos los resultados finales de un proyecto específico
   */
  async findProjectResultsByProject(projectId: number): Promise<ProjectResult[]> {
    this.logger.log(`Finding project results for project ${projectId}`);
    
    // Verificar que el proyecto existe
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    const results = await this.projectResultRepo.find({
      where: { project_id: projectId },
      relations: ['project'],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} project results for project ${projectId}`);
    return results;
  }

  /**
   * Obtiene todos los resultados de evaluaciones de un proyecto específico
   */
  async findEvaluationResultsByProject(projectId: number): Promise<EvaluationResult[]> {
    this.logger.log(`Finding evaluation results for project ${projectId}`);
    
    // Verificar que el proyecto existe
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    const results = await this.evaluationResultRepo.find({
      where: { 
        evaluation: { project_id: projectId }
      },
      relations: [
        'evaluation', 
        'evaluation.project', 
        'evaluation.standard'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} evaluation results for project ${projectId}`);
    return results;
  }

  /**
   * Obtiene todos los resultados de criterios de un proyecto específico
   */
  async findCriteriaResultsByProject(projectId: number): Promise<EvaluationCriteriaResult[]> {
    this.logger.log(`Finding criteria results for project ${projectId}`);
    
    // Verificar que el proyecto existe
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    const results = await this.evaluationCriteriaResultRepo.find({
      where: { 
        evaluation_criterion: {
          evaluation: { project_id: projectId }
        }
      },
      relations: [
        'evaluation_criterion',
        'evaluation_criterion.criterion',
        'evaluation_criterion.evaluation',
        'evaluation_criterion.evaluation.project'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} criteria results for project ${projectId}`);
    return results;
  }

  /**
   * Obtiene todos los resultados de métricas de un proyecto específico
   */
  async findMetricResultsByProject(projectId: number): Promise<EvaluationMetricResult[]> {
    this.logger.log(`Finding metric results for project ${projectId}`);
    
    // Verificar que el proyecto existe
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    const results = await this.evaluationMetricResultRepo.find({
      where: {
        evaluation_metric: {
          evaluation_criterion: {
            evaluation: { project_id: projectId }
          }
        }
      },
      relations: [
        'evaluation_metric',
        'evaluation_metric.metric',
        'evaluation_metric.evaluation_criterion',
        'evaluation_metric.evaluation_criterion.evaluation',
        'evaluation_metric.evaluation_criterion.criterion'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} metric results for project ${projectId}`);
    return results;
  }


  /**
   * Obtiene todas las variables de evaluación de un proyecto específico
   */
  async findEvaluationVariablesByProject(projectId: number): Promise<EvaluationVariable[]> {
    this.logger.log(`Finding evaluation variables for project ${projectId}`);
    
    // Verificar que el proyecto existe
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    const results = await this.evaluationVariableRepo.find({
      where: {
        evaluation_metric: {
          evaluation_criterion: {
            evaluation: { project_id: projectId }
          }
        }
      },
      relations: [
        'evaluation_metric',
        'evaluation_metric.metric', 
        'evaluation_metric.evaluation_criterion',
        'evaluation_metric.evaluation_criterion.evaluation',
        'variable'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} evaluation variables for project ${projectId}`);
    return results;
  }

  // =============================================================================
  //  FUNCIONES PARA BUSCAR RESULTADOS POR EVALUACIÓN
  // =============================================================================

  /**
   * Obtiene el resultado de una evaluación específica
   */
  async findEvaluationResultsByEvaluation(evaluationId: number): Promise<EvaluationResult[]> {
    this.logger.log(`Finding evaluation results for evaluation ${evaluationId}`);
    
    // Verificar que la evaluación existe
    await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');
    
    const results = await this.evaluationResultRepo.find({
      where: { evaluation_id: evaluationId },
      relations: [
        'evaluation',
        'evaluation.project',
        'evaluation.standard'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} evaluation results for evaluation ${evaluationId}`);
    return results;
  }

  /**
   * Obtiene los resultados de criterios de una evaluación específica
   */
  async findCriteriaResultsByEvaluation(evaluationId: number): Promise<EvaluationCriteriaResult[]> {
    this.logger.log(`Finding criteria results for evaluation ${evaluationId}`);
    
    // Verificar que la evaluación existe
    await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');
    
    const results = await this.evaluationCriteriaResultRepo.find({
      where: {
        evaluation_criterion: { evaluation_id: evaluationId }
      },
      relations: [
        'evaluation_criterion',
        'evaluation_criterion.criterion',
        'evaluation_criterion.evaluation'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} criteria results for evaluation ${evaluationId}`);
    return results;
  }

  /**
   * Obtiene los resultados de métricas de una evaluación específica
   */
  async findMetricResultsByEvaluation(evaluationId: number): Promise<EvaluationMetricResult[]> {
    this.logger.log(`Finding metric results for evaluation ${evaluationId}`);
    
    // Verificar que la evaluación existe
    await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');
    
    const results = await this.evaluationMetricResultRepo.find({
      where: {
        evaluation_metric: {
          evaluation_criterion: { evaluation_id: evaluationId }
        }
      },
      relations: [
        'evaluation_metric',
        'evaluation_metric.metric',
        'evaluation_metric.evaluation_criterion',
        'evaluation_metric.evaluation_criterion.criterion'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} metric results for evaluation ${evaluationId}`);
    return results;
  }

  /**
   * Obtiene las variables de evaluación de una evaluación específica
   */
  async findEvaluationVariablesByEvaluation(evaluationId: number): Promise<EvaluationVariable[]> {
    this.logger.log(`Finding evaluation variables for evaluation ${evaluationId}`);
    
    // Verificar que la evaluación existe
    await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');
    
    const results = await this.evaluationVariableRepo.find({
      where: {
        evaluation_metric: {
          evaluation_criterion: { evaluation_id: evaluationId }
        }
      },
      relations: [
        'evaluation_metric',
        'evaluation_metric.metric',
        'evaluation_metric.evaluation_criterion',
        'variable'
      ],
      order: { created_at: 'DESC' },
    });

    this.logger.log(`Found ${results.length} evaluation variables for evaluation ${evaluationId}`);
    return results;
  }

  // =============================================================================
  // FUNCIONES PARA OBTENER RESULTADOS COMPLETOS
  // =============================================================================

  /**
   * Obtiene todos los resultados de un proyecto en una sola consulta
   */
  async findCompleteResultsByProject(projectId: number): Promise<{
    project_results: ProjectResult[];
    evaluation_results: EvaluationResult[];
    criteria_results: EvaluationCriteriaResult[];
    metric_results: EvaluationMetricResult[];
    evaluation_variables: EvaluationVariable[];
  }> {
    this.logger.log(`Finding complete results for project ${projectId}`);
    
    // Verificar que el proyecto existe
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');

    // Obtener todos los resultados en paralelo
    const [
      project_results,
      evaluation_results,
      criteria_results,
      metric_results,
      evaluation_variables
    ] = await Promise.all([
      this.findProjectResultsByProject(projectId),
      this.findEvaluationResultsByProject(projectId),
      this.findCriteriaResultsByProject(projectId),
      this.findMetricResultsByProject(projectId),
      this.findEvaluationVariablesByProject(projectId)
    ]);

    this.logger.log(`Complete results found for project ${projectId}: ${project_results.length} project, ${evaluation_results.length} evaluations, ${criteria_results.length} criteria, ${metric_results.length} metrics, ${evaluation_variables.length} variables`);

    return {
      project_results,
      evaluation_results,
      criteria_results,
      metric_results,
      evaluation_variables
    };
  }

  /**
   * Obtiene todos los resultados de una evaluación en una sola consulta
   */
  async findCompleteResultsByEvaluation(evaluationId: number): Promise<{
    evaluation_results: EvaluationResult[];
    criteria_results: EvaluationCriteriaResult[];
    metric_results: EvaluationMetricResult[];
    evaluation_variables: EvaluationVariable[];
  }> {
    this.logger.log(`Finding complete results for evaluation ${evaluationId}`);
    
    // Verificar que la evaluación existe
    await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');

    // Obtener todos los resultados en paralelo
    const [
      evaluation_results,
      criteria_results,
      metric_results,
      evaluation_variables
    ] = await Promise.all([
      this.findEvaluationResultsByEvaluation(evaluationId),
      this.findCriteriaResultsByEvaluation(evaluationId),
      this.findMetricResultsByEvaluation(evaluationId),
      this.findEvaluationVariablesByEvaluation(evaluationId)
    ]);

    this.logger.log(`Complete results found for evaluation ${evaluationId}: ${evaluation_results.length} evaluations, ${criteria_results.length} criteria, ${metric_results.length} metrics, ${evaluation_variables.length} variables`);

    return {
      evaluation_results,
      criteria_results,
      metric_results,
      evaluation_variables
    };
  }





    /**
   * Recibe y guarda datos del navegador (NO termina la evaluación)
   */
  async receiveEvaluationData(evaluationId: number, data: {
    evaluation_variables: Array<{
      eval_metric_id: number;
      variable_id: number;
      value: number;
    }>
  }): Promise<EvaluationVariable[]> {
    //  Delegar al CalculateService que ya lo tienes implementado
    return await this.calculateService.receiveEvaluationData(evaluationId, data);
  }


   /**
   * Termina UNA evaluación específica: calcula resultados y cambia estado
   * El usuario puede terminar evaluaciones individuales sin afectar otras
   */
  async finalizeEvaluation(evaluationId: number): Promise<{
    evaluation_result: EvaluationResult;
    criteria_results: EvaluationCriteriaResult[];
    metric_results: EvaluationMetricResult[];
    evaluation_status: string;
    project_progress: {
      completed_evaluations: number;
      total_evaluations: number;
      completion_percentage: number;
    };
  }> {
    this.logger.log(`Finalizing individual evaluation ${evaluationId}`);

    // Validaciones
    const evaluation = await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');
    
    if (evaluation.status === EvaluationStatus.COMPLETED) {
      throw new BadRequestException(`Evaluation ${evaluationId} is already completed`);
    }

    // Verificar que hay datos
    const hasData = await this.evaluationVariableRepo.count({
      where: {
        evaluation_metric: {
          evaluation_criterion: { evaluation_id: evaluationId }
        }
      }
    });

    if (hasData === 0) {
      throw new BadRequestException(
        `No data found for evaluation ${evaluationId}. Please submit evaluation data first.`
      );
    }

    // Calcular resultados usando tu CalculateService
    const metricResults = await this.calculateService.calculateMetricResults(evaluationId);
    const criteriaResults = await this.calculateService.calculateCriteriaResults(evaluationId);
    const evaluationResult = await this.calculateService.calculateEvaluationResult(evaluationId);

    // Actualizar estado a COMPLETED
    await this.evaluationRepo.update(evaluationId, {
      status: EvaluationStatus.COMPLETED
    });

    // Obtener progreso del proyecto
    const projectProgress = await this.getProjectProgress(evaluation.project_id);

    this.logger.log(`Evaluation ${evaluationId} finalized successfully`);

    return {
      evaluation_result: evaluationResult,
      criteria_results: criteriaResults,
      metric_results: metricResults,
      evaluation_status: EvaluationStatus.COMPLETED,
      project_progress: projectProgress,
    };
  }

  // =============================================================================
  // 🔍 4. FUNCIONES DE PROGRESO Y ESTADO
  // =============================================================================
  
  /**
   * Obtiene el progreso de un proyecto
   */
  async getProjectProgress(projectId: number): Promise<{
    total_evaluations: number;
    completed_evaluations: number;
    in_progress_evaluations: number;
    pending_evaluations: number;
    completion_percentage: number;
    can_finalize_project: boolean;
  }> {
    const totalEvaluations = await this.evaluationRepo.count({
      where: { project_id: projectId }
    });

    const completedEvaluations = await this.evaluationRepo.count({
      where: { 
        project_id: projectId,
        status: EvaluationStatus.COMPLETED 
      }
    });

    const inProgressEvaluations = await this.evaluationRepo.count({
      where: { 
        project_id: projectId,
        status: EvaluationStatus.IN_PROGRESS 
      }
    });

    const pendingEvaluations = totalEvaluations - completedEvaluations - inProgressEvaluations;
    const completionPercentage = totalEvaluations > 0 ? Math.round((completedEvaluations / totalEvaluations) * 100) : 0;

    return {
      total_evaluations: totalEvaluations,
      completed_evaluations: completedEvaluations,
      in_progress_evaluations: inProgressEvaluations,
      pending_evaluations: pendingEvaluations,
      completion_percentage: completionPercentage,
      can_finalize_project: completedEvaluations === totalEvaluations && totalEvaluations > 0,
    };
  }

  /**
   * Verifica si una evaluación puede ser finalizada
   */
  async canEvaluationBeFinalized(evaluationId: number): Promise<{
    can_finalize: boolean;
    reason?: string;
    data_count: number;
  }> {
    const evaluation = await this.findOneOrFail(this.evaluationRepo, evaluationId, 'Evaluation');

    if (evaluation.status === EvaluationStatus.COMPLETED) {
      return {
        can_finalize: false,
        reason: 'Evaluation is already completed',
        data_count: 0,
      };
    }

    const dataCount = await this.evaluationVariableRepo.count({
      where: {
        evaluation_metric: {
          evaluation_criterion: { evaluation_id: evaluationId }
        }
      }
    });

    if (dataCount === 0) {
      return {
        can_finalize: false,
        reason: 'No evaluation data submitted',
        data_count: 0,
      };
    }

    return {
      can_finalize: true,
      data_count: dataCount,
    };
  }
}