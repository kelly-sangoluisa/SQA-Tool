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
import { EvaluationCriterion } from '../../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { Evaluation, EvaluationStatus } from '../../config-evaluation/entities/evaluation.entity';
import { Project, ProjectStatus } from '../../config-evaluation/entities/project.entity';
import { FormulaVariable } from '../../parameterization/entities/formula-variable.entity';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';

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
    @InjectRepository(EvaluationCriterion)
    private readonly evaluationCriterionRepo: Repository<EvaluationCriterion>,
    @InjectRepository(EvaluationMetric)
    private readonly evaluationMetricRepo: Repository<EvaluationMetric>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(FormulaVariable)
    private readonly formulaVariableRepo: Repository<FormulaVariable>,

    private readonly dataSource: DataSource,
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

  // --- Helper para evaluar fórmulas matemáticas ---
  private evaluateFormula(formula: string, variables: { symbol: string; value: number }[]): number {
    try {
      let expression = formula.toLowerCase();
      
      // Reemplazar variables en la fórmula con sus valores
      variables.forEach(variable => {
        const regex = new RegExp(`\\b${variable.symbol.toLowerCase()}\\b`, 'g');
        expression = expression.replace(regex, variable.value.toString());
      });
      
      // Evaluar la expresión matemática de forma segura
      const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
      const result = new Function('return ' + safeExpression)();
      
      return isNaN(result) ? 0 : Number(result);
    } catch (error) {
      this.logger.warn(`Error evaluating formula "${formula}": ${error.message}`);
      return 0;
    }
  }

  // --- MÉTODOS PARA EL FLUJO DEL FRONTEND ---

  /**
   * 🎯 PARA EL FRONTEND: Guardar variables mientras el usuario evalúa
   */
  async saveMetricVariables(
    eval_metric_id: number, 
    variables: { variable_id: number; value: number }[]
  ): Promise<EvaluationVariable[]> {
    return this.dataSource.transaction(async manager => {
      // Verificar que la métrica de evaluación existe
      await this.findOneOrFail(this.evaluationMetricRepo, eval_metric_id, 'EvaluationMetric');

      const savedVariables: EvaluationVariable[] = [];
      const repo = manager.getRepository(EvaluationVariable);

      for (const variableData of variables) {
        // Verificar que la variable de fórmula existe
        await this.findOneOrFail(this.formulaVariableRepo, variableData.variable_id, 'FormulaVariable');

        // Buscar si ya existe esta combinación métrica-variable
        let existingVariable = await repo.findOne({
          where: { eval_metric_id, variable_id: variableData.variable_id },
        });

        if (existingVariable) {
          // Actualizar el valor existente
          existingVariable.value = variableData.value;
          const saved = await repo.save(existingVariable);
          savedVariables.push(saved);
        } else {
          // Crear nueva variable
          const newVariable = repo.create({
            eval_metric_id,
            variable_id: variableData.variable_id,
            value: variableData.value,
          });
          const saved = await repo.save(newVariable);
          savedVariables.push(saved);
        }
      }

      this.logger.log(`Saved ${savedVariables.length} variables for metric ${eval_metric_id}`);
      return savedVariables;
    });
  }

  /**
   * 🎯 PARA EL FRONTEND: Calcular y guardar TODO cuando el usuario termina
   * También cambia estados: Evaluation → COMPLETED, Project → inactive
   */
  async finalizeEvaluation(evaluationId: number): Promise<{
    evaluationResult: EvaluationResult;
    criteriaResults: EvaluationCriteriaResult[];
    metricResults: EvaluationMetricResult[];
    projectResult?: ProjectResult;
    evaluationStatusChanged: boolean;
    projectStatusChanged: boolean;
  }> {
    return this.dataSource.transaction(async manager => {
      this.logger.log(`Starting evaluation finalization for evaluation ${evaluationId}`);

      // 1. Verificar que la evaluación existe
      const evaluation = await this.evaluationRepo.findOne({
        where: { id: evaluationId },
        relations: ['project'],
      });

      if (!evaluation) {
        throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
      }

      // 2. Obtener criterios de evaluación
      const evaluationCriteria = await this.evaluationCriterionRepo.find({
        where: { evaluation_id: evaluationId },
        relations: ['criterion'],
      });

      // 3. Obtener métricas organizadas por criterio
      const criteriaWithMetrics = await Promise.all(
        evaluationCriteria.map(async (criterion) => {
          const metrics = await this.evaluationMetricRepo.find({
            where: { eval_criterion_id: criterion.id },
            relations: ['metric', 'metric.sub_criterion'],
          });
          return { criterion, metrics };
        })
      );

      const metricResults: EvaluationMetricResult[] = [];
      const metricResultRepo = manager.getRepository(EvaluationMetricResult);

      // 4. Calcular cada métrica
      for (const { metrics } of criteriaWithMetrics) {
        for (const evalMetric of metrics) {
          const variables = await this.evaluationVariableRepo.find({
            where: { eval_metric_id: evalMetric.id },
            relations: ['variable'],
          });
          
          if (variables.length > 0) {
            const formula = evalMetric.metric.formula;
            const desiredThreshold = evalMetric.metric.desired_threshold;
            
            if (!formula || !desiredThreshold || desiredThreshold <= 0) {
              this.logger.warn(`Metric ${evalMetric.metric.name} has invalid formula/threshold`);
              continue;
            }
            
            // Calcular valor con fórmula
            const formulaVariables = variables.map(v => ({
              symbol: v.variable.symbol,
              value: Number(v.value)
            }));
            
            const calculatedValue = this.evaluateFormula(formula, formulaVariables);
            const weightedValue = (calculatedValue / Number(desiredThreshold)) * Number(evalMetric.weight_value);
            
            const metricResult = metricResultRepo.create({
              eval_metric_id: evalMetric.id,
              calculated_value: calculatedValue,
              weighted_value: weightedValue,
            });
            
            const saved = await metricResultRepo.save(metricResult);
            metricResults.push(saved);

            this.logger.debug(
              `Metric ${evalMetric.metric.name}: formula=${formula}, calculated=${calculatedValue.toFixed(4)}, weighted=${weightedValue.toFixed(4)}`
            );
          }
        }
      }

      // 5. Calcular cada criterio
      const criteriaResults: EvaluationCriteriaResult[] = [];
      const criteriaResultRepo = manager.getRepository(EvaluationCriteriaResult);

      for (const { criterion, metrics } of criteriaWithMetrics) {
        const criterionMetricResults = metricResults.filter(mr => 
          metrics.some(m => m.id === mr.eval_metric_id)
        );

        if (criterionMetricResults.length > 0) {
          const averageWeightedValue = criterionMetricResults.reduce(
            (sum, mr) => sum + Number(mr.weighted_value), 0
          ) / criterionMetricResults.length;
          
          const finalCriterionScore = averageWeightedValue * (Number(criterion.importance_percentage) / 100);
          
          const criteriaResult = criteriaResultRepo.create({
            eval_criterion_id: criterion.id,
            final_score: finalCriterionScore,
          });
          
          const saved = await criteriaResultRepo.save(criteriaResult);
          criteriaResults.push(saved);

          this.logger.debug(
            `Criterion ${criterion.criterion.name}: avg_weighted=${averageWeightedValue.toFixed(4)}, importance=${criterion.importance_percentage}%, final_score=${finalCriterionScore.toFixed(4)}`
          );
        }
      }

      // 6. Calcular evaluación final
      const finalEvaluationScore = criteriaResults.reduce(
        (sum, cr) => sum + Number(cr.final_score), 0
      );

      const evaluationResultRepo = manager.getRepository(EvaluationResult);
      const evaluationResult = evaluationResultRepo.create({
        evaluation_id: evaluationId,
        evaluation_score: finalEvaluationScore,
        conclusion: `Evaluación completada con puntuación final de ${finalEvaluationScore.toFixed(4)}`,
      });
      
      const savedEvaluationResult = await evaluationResultRepo.save(evaluationResult);

      // 7. Cambiar estado de la evaluación a COMPLETED
      const evaluationRepo = manager.getRepository(Evaluation);
      await evaluationRepo.update(evaluationId, { status: EvaluationStatus.COMPLETED });
      const evaluationStatusChanged = true;

      // 8. Verificar si crear resultado de proyecto
      let projectResult: ProjectResult | undefined;
      let projectStatusChanged = false;

      const projectEvaluations = await this.evaluationRepo.find({
        where: { project_id: evaluation.project_id },
      });

      const completedCount = await manager.getRepository(EvaluationResult).count({
        where: { evaluation: { project_id: evaluation.project_id }},
      });

      if (completedCount === projectEvaluations.length) {
        const allResults = await manager.getRepository(EvaluationResult).find({
          where: { evaluation: { project_id: evaluation.project_id }},
        });

        const averageProjectScore = allResults.reduce(
          (sum, er) => sum + Number(er.evaluation_score), 0
        ) / allResults.length;

        const projectResultRepo = manager.getRepository(ProjectResult);
        projectResult = projectResultRepo.create({
          project_id: evaluation.project_id,
          final_project_score: averageProjectScore,
        });

        projectResult = await projectResultRepo.save(projectResult);

        // Cambiar estado del proyecto a inactive
        const projectRepo = manager.getRepository(Project);
        await projectRepo.update(evaluation.project_id, { status: ProjectStatus.INACTIVE });
        projectStatusChanged = true;

        this.logger.log(
          `Project ${evaluation.project_id} completed with final score ${averageProjectScore.toFixed(4)} and status changed to inactive`
        );
      }

      this.logger.log(
        `Evaluation ${evaluationId} finalized with score ${finalEvaluationScore.toFixed(4)} and status changed to COMPLETED`
      );

      return {
        evaluationResult: savedEvaluationResult,
        criteriaResults,
        metricResults,
        projectResult,
        evaluationStatusChanged,
        projectStatusChanged,
      };
    });
  }

  /**
   * 🎯 PARA EL FRONTEND: Ver progreso
   */
  async getEvaluationProgress(evaluationId: number): Promise<{
    totalMetrics: number;
    completedMetrics: number;
    completedMetricIds: number[];
    progressPercentage: number;
  }> {
    const evaluationCriteria = await this.evaluationCriterionRepo.find({
      where: { evaluation_id: evaluationId },
    });

    const allMetrics: any[] = [];
    for (const criterion of evaluationCriteria) {
      const metrics = await this.evaluationMetricRepo.find({
        where: { eval_criterion_id: criterion.id },
      });
      allMetrics.push(...metrics);
    }

    const completedMetricIds: number[] = [];
    for (const metric of allMetrics) {
      const variablesCount = await this.evaluationVariableRepo.count({
        where: { eval_metric_id: metric.id },
      });
      
      if (variablesCount > 0) {
        completedMetricIds.push(metric.id);
      }
    }

    const totalMetrics = allMetrics.length;
    const completedMetrics = completedMetricIds.length;
    const progressPercentage = totalMetrics > 0 ? (completedMetrics / totalMetrics) * 100 : 0;

    return {
      totalMetrics,
      completedMetrics,
      completedMetricIds,
      progressPercentage,
    };
  }

  /**
   * 🎯 PARA EL FRONTEND: Resumen antes de finalizar
   */
  async getEvaluationSummary(evaluationId: number) {
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
      relations: ['project', 'standard', 'evaluation_criteria', 'evaluation_criteria.criterion'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    const criteriaGroups = await Promise.all(
      evaluation.evaluation_criteria.map(async (evalCriterion) => {
        const evaluationMetrics = await this.evaluationMetricRepo.find({
          where: { eval_criterion_id: evalCriterion.id },
          relations: ['metric', 'metric.sub_criterion'],
        });

        const metricsWithVariables = await Promise.all(
          evaluationMetrics.map(async (evalMetric) => {
            const variables = await this.evaluationVariableRepo.find({
              where: { eval_metric_id: evalMetric.id },
              relations: ['variable'],
            });
            return {
              metric: evalMetric,
              variables,
              hasData: variables.length > 0,
            };
          })
        );

        return {
          criterion: evalCriterion,
          metrics: metricsWithVariables,
          completedMetrics: metricsWithVariables.filter(m => m.hasData).length,
          totalMetrics: metricsWithVariables.length,
        };
      })
    );

    const totalMetrics = criteriaGroups.reduce((sum, group) => sum + group.totalMetrics, 0);
    const completedMetrics = criteriaGroups.reduce((sum, group) => sum + group.completedMetrics, 0);

    return {
      evaluation,
      criteriaGroups,
      totalMetrics,
      completedMetrics,
      isComplete: completedMetrics === totalMetrics,
      progressPercentage: totalMetrics > 0 ? (completedMetrics / totalMetrics) * 100 : 0,
    };
  }

  // --- MÉTODOS PARA REPORTS (GET POR PROYECTO) ---

  /**
   * 📊 PARA REPORTS: Obtener resultados de evaluaciones de UN proyecto específico
   */
  async findEvaluationResultsByProject(projectId: number): Promise<EvaluationResult[]> {
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    return this.evaluationResultRepo.find({
      where: { 
        evaluation: { project_id: projectId }
      },
      relations: ['evaluation', 'evaluation.project', 'evaluation.standard'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 📊 PARA REPORTS: Obtener resultados de criterios de UN proyecto específico
   */
  async findCriteriaResultsByProject(projectId: number): Promise<EvaluationCriteriaResult[]> {
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    return this.evaluationCriteriaResultRepo.find({
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
  }

  /**
   * 📊 PARA REPORTS: Obtener resultados de métricas de UN proyecto específico
   */
  async findMetricResultsByProject(projectId: number): Promise<EvaluationMetricResult[]> {
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    return this.evaluationMetricResultRepo.find({
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
        'evaluation_metric.evaluation_criterion.evaluation'
      ],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 📊 PARA REPORTS: Obtener variables evaluadas de UN proyecto específico
   */
  async findEvaluationVariablesByProject(projectId: number): Promise<EvaluationVariable[]> {
    await this.findOneOrFail(this.projectRepo, projectId, 'Project');
    
    return this.evaluationVariableRepo.find({
      where: {
        evaluation_metric: {
          evaluation_criterion: {
            evaluation: { project_id: projectId }
          }
        }
      },
      relations: [
        'evaluation_metric', 
        'variable',
        'evaluation_metric.evaluation_criterion',
        'evaluation_metric.evaluation_criterion.evaluation'
      ],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 📊 PARA REPORTS: Obtener resultado final de UN proyecto específico
   */
  async findProjectResult(projectId: number): Promise<ProjectResult> {
    const result = await this.projectResultRepo.findOne({
      where: { project_id: projectId },
      relations: ['project'],
    });
    
    if (!result) {
      throw new NotFoundException(`ProjectResult for project ${projectId} not found`);
    }
    
    return result;
  }

  /**
   * 🎯 PARA REPORTS: REPORTE COMPLETO DE UN PROYECTO ESPECÍFICO
   * Todas las 5 tablas del proyecto en una sola respuesta
   */
  async getProjectCompleteReport(projectId: number) {
    // Verificar que el proyecto existe
    const project = await this.findOneOrFail(this.projectRepo, projectId, 'Project');

    // Obtener todos los datos del proyecto en paralelo
    const [
      projectResult,
      evaluationResults,
      criteriaResults,
      metricResults,
      evaluationVariables
    ] = await Promise.all([
      this.findProjectResult(projectId),
      this.findEvaluationResultsByProject(projectId),
      this.findCriteriaResultsByProject(projectId),
      this.findMetricResultsByProject(projectId),
      this.findEvaluationVariablesByProject(projectId),
    ]);

    return {
      // Información básica del proyecto
      project,
      
      // Las 5 tablas de resultados
      projectResult,
      evaluationResults,
      criteriaResults, 
      metricResults,
      evaluationVariables,
      
      // Timestamp del reporte
      generatedAt: new Date(),
    };
  }
}