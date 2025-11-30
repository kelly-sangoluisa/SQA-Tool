import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

// Entities - Entry Data
import { EvaluationCriteriaResult } from '../entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../entities/evaluation_metric_result.entity';
import { EvaluationResult } from '../entities/evaluation_result.entity';
import { EvaluationVariable } from '../entities/evaluation_variable.entity';
import { ProjectResult } from '../entities/project_result.entity';

// Entities - Related modules
import { EvaluationCriterion } from '../../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { Evaluation } from '../../config-evaluation/entities/evaluation.entity';
import { Project } from '../../config-evaluation/entities/project.entity';
import { FormulaVariable } from '../../parameterization/entities/formula-variable.entity';
import { Metric } from '../../parameterization/entities/metric.entity';

@Injectable()
export class CalculateService {
  private readonly logger = new Logger(CalculateService.name);

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

    // Related repositories
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
    @InjectRepository(Metric)
    private readonly metricRepo: Repository<Metric>,

    private readonly dataSource: DataSource,
  ) {}

  // =============================================================================
  //  FUNCIÓN PARA RECIBIR DATOS DEL NAVEGADOR
  // =============================================================================

  /**
   * Recibe los datos de las variables desde el navegador y los guarda en evaluation_variables
   */
  async receiveEvaluationData(evaluationId: number, data: {
    evaluation_variables: Array<{
      eval_metric_id: number;
      variable_id: number;
      value: number;
    }>
  }): Promise<EvaluationVariable[]> {
    this.logger.log(`Receiving evaluation data for evaluation ${evaluationId}`);

    // Verificar que la evaluación existe
    const evaluation = await this.evaluationRepo.findOneBy({ id: evaluationId });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    const savedVariables: EvaluationVariable[] = [];

    // Transacción para asegurar integridad
    await this.dataSource.transaction(async (manager) => {
      for (const variableData of data.evaluation_variables) {
        // Verificar que eval_metric_id existe
        const evaluationMetric = await manager.findOne(EvaluationMetric, {
          where: { id: variableData.eval_metric_id },
          relations: ['evaluation_criterion', 'evaluation_criterion.evaluation']
        });

        if (!evaluationMetric) {
          throw new NotFoundException(`EvaluationMetric with ID ${variableData.eval_metric_id} not found`);
        }

        // Verificar que la métrica pertenece a la evaluación correcta
        if (evaluationMetric.evaluation_criterion.evaluation.id !== evaluationId) {
          throw new BadRequestException(`EvaluationMetric ${variableData.eval_metric_id} does not belong to evaluation ${evaluationId}`);
        }

        // Verificar que variable_id existe
        const formulaVariable = await manager.findOneBy(FormulaVariable, { id: variableData.variable_id });
        if (!formulaVariable) {
          throw new NotFoundException(`FormulaVariable with ID ${variableData.variable_id} not found`);
        }

        // Verificar si ya existe la variable para esta métrica (para actualizar en lugar de duplicar)
        let evaluationVariable = await manager.findOne(EvaluationVariable, {
          where: {
            eval_metric_id: variableData.eval_metric_id,
            variable_id: variableData.variable_id
          }
        });

        if (evaluationVariable) {
          // Actualizar valor existente
          evaluationVariable.value = variableData.value;
        } else {
          // Crear nueva variable
          evaluationVariable = manager.create(EvaluationVariable, {
            eval_metric_id: variableData.eval_metric_id,
            variable_id: variableData.variable_id,
            value: variableData.value,
          });
        }

        const savedVariable = await manager.save(EvaluationVariable, evaluationVariable);
        savedVariables.push(savedVariable);
      }
    });

    this.logger.log(`Saved ${savedVariables.length} evaluation variables for evaluation ${evaluationId}`);
    return savedVariables;
  }

  // =============================================================================
  //  FUNCIONES HELPER PARA CÁLCULOS
  // =============================================================================

  /**
   * Evalúa una fórmula matemática con valores de variables
   * Ejemplo: formula="x=a/b", variables=[{symbol:"a", value:10}, {symbol:"b", value:21}] → 0.48
   */

private evaluateFormula(formula: string, variables: {symbol: string, value: number}[]): number {
  this.logger.debug(`Evaluating formula: ${formula} with variables:`, variables);

  try {
    //  Usar directamente la fórmula (ya viene como "a/b")
    let expression = formula.trim();

    // Validar que no esté vacía
    if (!expression) {
      throw new Error('Formula cannot be empty');
    }

    // Reemplazar variables
    for (const variable of variables) {
      const regex = new RegExp(`\\b${variable.symbol}\\b`, 'g');
      expression = expression.replace(regex, variable.value.toString());
    }

    // Verificar que todas las variables fueron reemplazadas
    if (/[a-zA-Z]/.test(expression)) {
      throw new Error(`Formula contains unreplaced variables: ${expression}`);
    }

    const result = Function(`"use strict"; return (${expression})`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Invalid result: ${result}`);
    }

    return result;
  } catch (error) {
    this.logger.error(`Error evaluating formula ${formula}:`, error);
    throw new BadRequestException(`Error evaluating formula: ${error.message}`);
  }
}

  /**
   * Calcula el valor de una métrica usando su fórmula y las variables
   */
  private async calculateMetricValueWithFormula(metricId: number, variables: EvaluationVariable[]): Promise<number> {
    this.logger.debug(`Calculating metric value for metric ${metricId}`);

    // Obtener la métrica con su fórmula
    const metric = await this.metricRepo.findOne({
      where: { id: metricId },
      relations: ['formula_variables']
    });

    if (!metric) {
      throw new NotFoundException(`Metric with ID ${metricId} not found`);
    }

    if (!metric.formula) {
      throw new BadRequestException(`Metric ${metricId} does not have a formula defined`);
    }

    // Obtener las variables con sus símbolos
    const variableValues = await Promise.all(
      variables.map(async (evalVar) => {
        const formulaVar = await this.formulaVariableRepo.findOneBy({ id: evalVar.variable_id });
        if (!formulaVar) {
          throw new NotFoundException(`FormulaVariable with ID ${evalVar.variable_id} not found`);
        }
        return {
          symbol: formulaVar.symbol,
          value: evalVar.value
        };
      })
    );

    // Evaluar la fórmula
    const calculatedValue = this.evaluateFormula(metric.formula, variableValues);
    
    this.logger.debug(`Calculated value for metric ${metricId}: ${calculatedValue}`);
    return calculatedValue;
  }

  /**
   * Calcula el weighted_value basado en el calculated_value y el desired_threshold
   * Formula: (calculated_value / desired_threshold) * 100
   */

private calculateWeightedValue(calculatedValue: number, threshold: number): number {
  if (threshold < 0) {
    throw new BadRequestException(`Invalid threshold value: ${threshold}. Must be >= 0`);
  }

  let weightedValue = 0;

  if (threshold === 0) {
    // Para métricas donde menor es mejor (ej: errores, tiempo de carga)
    weightedValue = (1 - calculatedValue) * 100;
    this.logger.debug(`Weighted value (inverted): (1-${calculatedValue}) * 100 = ${weightedValue}`);
  } else {
    // Para métricas donde mayor es mejor (ej: performance, cobertura)
    weightedValue = (calculatedValue / threshold) * 100;
    this.logger.debug(`Weighted value: (${calculatedValue} / ${threshold}) * 100 = ${weightedValue}`);
  }

  return Math.round(weightedValue * 100) / 100; // Redondear a 2 decimales
}

  /**
   * Calcula el final_score de un criterio
   * Formula: promedio de weighted_values * importance_percentage
   */
  private calculateCriteriaFinalScore(weightedValues: number[], importancePercentage: number): number {
    if (weightedValues.length === 0) {
      throw new BadRequestException('No weighted values provided for criteria calculation');
    }

    const average = weightedValues.reduce((sum, val) => sum + val, 0) / weightedValues.length;
    const finalScore = average * (importancePercentage / 100);
    
    this.logger.debug(`Criteria final score: avg(${weightedValues.join(',')}) * (${importancePercentage}/100) = ${finalScore}`);
    
    return Math.round(finalScore * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Calcula el evaluation_score sumando todos los final_score de criterios
   */
  private calculateEvaluationScore(criteriaScores: number[]): number {
    if (criteriaScores.length === 0) {
      throw new BadRequestException('No criteria scores provided for evaluation calculation');
    }

    const evaluationScore = criteriaScores.reduce((sum, score) => sum + score, 0);
    
    this.logger.debug(`Evaluation score: sum(${criteriaScores.join(',')}) = ${evaluationScore}`);
    
    return Math.round(evaluationScore * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Calcula el final_project_score promediando las evaluation_scores
   */
  private calculateProjectFinalScore(evaluationScores: number[]): number {
    if (evaluationScores.length === 0) {
      throw new BadRequestException('No evaluation scores provided for project calculation');
    }

    const projectScore = evaluationScores.reduce((sum, score) => sum + score, 0) / evaluationScores.length;
    
    this.logger.debug(`Project final score: avg(${evaluationScores.join(',')}) = ${projectScore}`);
    
    return Math.round(projectScore * 100) / 100; // Redondear a 2 decimales
  }

  // =============================================================================
  //  FUNCIONES PRINCIPALES DE CÁLCULO
  // =============================================================================

  /**
   * Calcula los resultados de todas las métricas de una evaluación
   */
  async calculateMetricResults(evaluationId: number): Promise<EvaluationMetricResult[]> {
    this.logger.log(`Calculating metric results for evaluation ${evaluationId}`);

    const metricResults: EvaluationMetricResult[] = [];

    // Obtener todas las métricas de la evaluación con sus variables
    const evaluationMetrics = await this.evaluationMetricRepo.find({
        where: {
        evaluation_criterion: { evaluation_id: evaluationId }
        },
        relations: [
        'metric',                           // Relación con la métrica
        'evaluation_criterion',             // Relación con el criterio
       // 'evaluation_variables',             // Verificar que esta relación existe
        //'evaluation_variables.variable'     // Relación anidada
        ]
    });

    if (evaluationMetrics.length === 0) {
    throw new BadRequestException(`No evaluation metrics found for evaluation ${evaluationId}`);
  }

  for (const evalMetric of evaluationMetrics) {
    try {
      // CORREGIR: Obtener variables de evaluación de forma separada
      const evaluationVariables = await this.evaluationVariableRepo.find({
        where: { eval_metric_id: evalMetric.id },
        relations: ['variable'] // Esta relación sí existe en EvaluationVariable
      });

      if (evaluationVariables.length === 0) {
        this.logger.warn(`No variables found for metric ${evalMetric.metric.id} in evaluation ${evaluationId}`);
        continue;
      }

      // CORREGIR: Usar metric.id en lugar de metric_id
      const calculatedValue = await this.calculateMetricValueWithFormula(
        evalMetric.metric.id,    // Correcto
        evaluationVariables
      );

      // CORREGIR: Usar threshold en lugar de desired_threshold
      const weightedValue = this.calculateWeightedValue(
        calculatedValue,
        evalMetric.metric.desired_threshold  // Asumiendo que es 'threshold'
      );

      // ✅ Guardar resultado (esta parte está bien)
      let metricResult = await this.evaluationMetricResultRepo.findOne({
        where: { eval_metric_id: evalMetric.id }
      });

      if (metricResult) {
        metricResult.calculated_value = calculatedValue;
        metricResult.weighted_value = weightedValue;
        // REMOVER: metricResult.updated_at = new Date(); // BaseTimestampEntity lo maneja
      } else {
        metricResult = this.evaluationMetricResultRepo.create({
          eval_metric_id: evalMetric.id,
          calculated_value: calculatedValue,
          weighted_value: weightedValue,
        });
      }

      const savedResult = await this.evaluationMetricResultRepo.save(metricResult);
      metricResults.push(savedResult);

      this.logger.debug(`Processed metric ${evalMetric.metric.id}: calculated=${calculatedValue}, weighted=${weightedValue}`);

    } catch (error) {
      this.logger.error(` Error processing metric ${evalMetric.id}:`, error);
      // Continuar con la siguiente métrica en lugar de fallar todo
      continue;
    }
  }

  if (metricResults.length === 0) {
    throw new BadRequestException(`No metric results could be calculated for evaluation ${evaluationId}`);
  }

  this.logger.log(`Calculated ${metricResults.length} metric results for evaluation ${evaluationId}`);
  return metricResults;
}

  /**
   * Calcula los resultados de todos los criterios de una evaluación
   */
  async calculateCriteriaResults(evaluationId: number): Promise<EvaluationCriteriaResult[]> {
     this.logger.log(`Calculating criteria results for evaluation ${evaluationId}`);

  const criteriaResults: EvaluationCriteriaResult[] = [];

  //  Obtener criterios de la evaluación
  const evaluationCriteria = await this.evaluationCriterionRepo.find({
    where: { evaluation_id: evaluationId }
    //  REMOVER relaciones problemáticas por ahora
  });

  for (const evalCriterion of evaluationCriteria) {
    try {
      //  CORREGIR: Obtener métricas del criterio de forma separada
      const evaluationMetrics = await this.evaluationMetricRepo.find({
        where: { eval_criterion_id: evalCriterion.id }
      });

      // CORREGIR: Obtener resultados de métricas de forma separada
      const weightedValues: number[] = [];
      
      for (const evalMetric of evaluationMetrics) {
        const metricResults = await this.evaluationMetricResultRepo.find({
          where: { eval_metric_id: evalMetric.id }
        });
        
        for (const metricResult of metricResults) {
          if (metricResult.weighted_value !== null && metricResult.weighted_value !== undefined) {
            weightedValues.push(metricResult.weighted_value);
          }
        }
      }

      if (weightedValues.length === 0) {
        this.logger.warn(`No metric results found for criterion ${evalCriterion.id} in evaluation ${evaluationId}`);
        continue;
      }

      //  Calcular final_score (esta parte está bien)
      const finalScore = this.calculateCriteriaFinalScore(
        weightedValues,
        evalCriterion.importance_percentage
      );

      // Guardar resultado
      let criteriaResult = await this.evaluationCriteriaResultRepo.findOne({
        where: { eval_criterion_id: evalCriterion.id }
      });

      if (criteriaResult) {
        criteriaResult.final_score = finalScore;
        //  REMOVER: criteriaResult.updated_at = new Date();
      } else {
        criteriaResult = this.evaluationCriteriaResultRepo.create({
          eval_criterion_id: evalCriterion.id,
          final_score: finalScore,
        });
      }

      const savedResult = await this.evaluationCriteriaResultRepo.save(criteriaResult);
      criteriaResults.push(savedResult);

      this.logger.debug(`Processed criterion ${evalCriterion.id}: final_score=${finalScore}`);

    } catch (error) {
      this.logger.error(`Error processing criterion ${evalCriterion.id}:`, error);
      continue;
    }
  }

  this.logger.log(`Calculated ${criteriaResults.length} criteria results for evaluation ${evaluationId}`);
  return criteriaResults;
}

  /**
   * Calcula el resultado final de una evaluación
   */
  async calculateEvaluationResult(evaluationId: number): Promise<EvaluationResult> {
    this.logger.log(`Calculating evaluation result for evaluation ${evaluationId}`);

    // Obtener todos los final_scores de los criterios
    const criteriaResults = await this.evaluationCriteriaResultRepo.find({
      where: {
        evaluation_criterion: { evaluation_id: evaluationId }
      }
    });

    const criteriaScores = criteriaResults.map(result => result.final_score);

    if (criteriaScores.length === 0) {
      throw new BadRequestException(`No criteria results found for evaluation ${evaluationId}`);
    }

    // Calcular el evaluation_score
    const evaluationScore = this.calculateEvaluationScore(criteriaScores);

    // Verificar si ya existe un resultado para esta evaluación
    let evaluationResult = await this.evaluationResultRepo.findOne({
      where: { evaluation_id: evaluationId }
    });

    if (evaluationResult) {
      // Actualizar resultado existente
      evaluationResult.evaluation_score = evaluationScore;
      evaluationResult.updated_at = new Date();
    } else {
      // Crear nuevo resultado
      evaluationResult = this.evaluationResultRepo.create({
        evaluation_id: evaluationId,
        evaluation_score: evaluationScore,
        conclusion: `Evaluation completed with score: ${evaluationScore}`,
      });
    }

    const savedResult = await this.evaluationResultRepo.save(evaluationResult);

    this.logger.log(`Calculated evaluation result for evaluation ${evaluationId}: ${evaluationScore}`);
    return savedResult;
  }

  /**
   * Calcula el resultado final del proyecto
   */
  async calculateProjectResult(projectId: number): Promise<ProjectResult> {
    this.logger.log(`Calculating project result for project ${projectId}`);

    // Obtener todos los evaluation_scores del proyecto
    const evaluationResults = await this.evaluationResultRepo.find({
      where: {
        evaluation: { project_id: projectId }
      }
    });

    const evaluationScores = evaluationResults.map(result => result.evaluation_score);

    if (evaluationScores.length === 0) {
      throw new BadRequestException(`No evaluation results found for project ${projectId}`);
    }

    // Calcular el final_project_score
    const projectScore = this.calculateProjectFinalScore(evaluationScores);

    // Verificar si ya existe un resultado para este proyecto
    let projectResult = await this.projectResultRepo.findOne({
      where: { project_id: projectId }
    });

    if (projectResult) {
      // Actualizar resultado existente
      projectResult.final_project_score = projectScore;
      projectResult.updated_at = new Date();
    } else {
      // Crear nuevo resultado
      projectResult = this.projectResultRepo.create({
        project_id: projectId,
        final_project_score: projectScore,
      });
    }

    const savedResult = await this.projectResultRepo.save(projectResult);

    this.logger.log(`Calculated project result for project ${projectId}: ${projectScore}`);
    return savedResult;
  }




  // =============================================================================
  //  FUNCIÓN PRINCIPAL: PROCESAR EVALUACIÓN COMPLETA
  // =============================================================================

  /**
   * Procesa una evaluación completa: calcula métricas, criterios, evaluación y proyecto
   */
  async processCompleteEvaluation(evaluationId: number): Promise<{
    metricResults: EvaluationMetricResult[];
    criteriaResults: EvaluationCriteriaResult[];
    evaluationResult: EvaluationResult;
    projectResult: ProjectResult;
  }> {
    this.logger.log(`Processing complete evaluation ${evaluationId}`);

    // Obtener el proyecto de la evaluación
    const evaluation = await this.evaluationRepo.findOne({
      where: { id: evaluationId },
      relations: ['project']
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
    }

    // Ejecutar cálculos en orden secuencial (cada uno depende del anterior)
    const metricResults = await this.calculateMetricResults(evaluationId);
    const criteriaResults = await this.calculateCriteriaResults(evaluationId);
    const evaluationResult = await this.calculateEvaluationResult(evaluationId);
    const projectResult = await this.calculateProjectResult(evaluation.project_id);

    this.logger.log(`Completed processing evaluation ${evaluationId}`);

    return {
      metricResults,
      criteriaResults,
      evaluationResult,
      projectResult,
    };
  }
}