import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { EvaluationVariable } from '../entities/evaluation_variable.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { FormulaVariable } from '../../parameterization/entities/formula-variable.entity';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';

/**
 * Servicio especializado en la gestión de variables de evaluación
 * Responsabilidad única: CRUD de variables de evaluación
 */
@Injectable()
export class EvaluationVariableService {
  private readonly logger = new Logger(EvaluationVariableService.name);

  constructor(
    @InjectRepository(EvaluationVariable)
    private readonly evaluationVariableRepo: Repository<EvaluationVariable>,
    @InjectRepository(EvaluationMetric)
    private readonly evaluationMetricRepo: Repository<EvaluationMetric>,
    @InjectRepository(FormulaVariable)
    private readonly formulaVariableRepo: Repository<FormulaVariable>,
  ) {}

  /**
   * Crea o actualiza una variable de evaluación
   */
  async createOrUpdate(dto: CreateEvaluationVariableDto): Promise<EvaluationVariable> {
    this.logger.log(`Creating/updating evaluation variable for metric ${dto.eval_metric_id}`);
    this.logger.debug(`📥 Received value: ${dto.value}, type: ${typeof dto.value}`);

    await this.validateReferences(dto);

    const existingVariable = await this.findExisting(dto.eval_metric_id, dto.variable_id);
    
    if (existingVariable) {
      return this.updateExisting(existingVariable, dto.value);
    }

    return this.createNew(dto);
  }

  /**
   * Obtiene variables por métrica de evaluación
   */
  async findByEvaluationMetric(evalMetricId: number): Promise<EvaluationVariable[]> {
    return this.evaluationVariableRepo.find({
      where: { eval_metric_id: evalMetricId },
      relations: ['variable']
    });
  }

  /**
   * Obtiene variables agrupadas por evaluación
   */
  async findByEvaluation(evaluationId: number): Promise<EvaluationVariable[]> {
    return this.evaluationVariableRepo
      .createQueryBuilder('ev')
      .innerJoin('ev.evaluation_metric', 'em')
      .innerJoin('em.evaluation_criterion', 'ec')
      .where('ec.evaluation_id = :evaluationId', { evaluationId })
      .getMany();
  }

  /**
   * Elimina variable específica
   */
  async remove(evalMetricId: number, variableId: number): Promise<void> {
    const variable = await this.findExisting(evalMetricId, variableId);
    
    if (!variable) {
      throw new NotFoundException(
        `EvaluationVariable not found for metric ${evalMetricId} and variable ${variableId}`
      );
    }

    await this.evaluationVariableRepo.remove(variable);
    this.logger.log(`Removed evaluation variable for metric ${evalMetricId}`);
  }

  // =========================================================================
  // MÉTODOS PRIVADOS
  // =========================================================================

  /**
   * Valida que las referencias existan
   */
  private async validateReferences(dto: CreateEvaluationVariableDto): Promise<void> {
    const [evaluationMetric, formulaVariable] = await Promise.all([
      this.evaluationMetricRepo.findOneBy({ id: dto.eval_metric_id }),
      this.formulaVariableRepo.findOneBy({ id: dto.variable_id })
    ]);

    if (!evaluationMetric) {
      throw new NotFoundException(`EvaluationMetric with ID ${dto.eval_metric_id} not found`);
    }

    if (!formulaVariable) {
      throw new NotFoundException(`FormulaVariable with ID ${dto.variable_id} not found`);
    }
  }

  /**
   * Busca variable existente
   */
  private async findExisting(evalMetricId: number, variableId: number): Promise<EvaluationVariable | null> {
    return this.evaluationVariableRepo.findOne({
      where: {
        eval_metric_id: evalMetricId,
        variable_id: variableId
      }
    });
  }

  /**
   * Actualiza variable existente
   */
  private async updateExisting(variable: EvaluationVariable, newValue: number): Promise<EvaluationVariable> {
    variable.value = newValue;
    const updated = await this.evaluationVariableRepo.save(variable);
    
    this.logger.log(`Updated evaluation variable ${variable.id} with value ${newValue}`);
    return updated;
  }

  /**
   * Crea nueva variable
   */
  private async createNew(dto: CreateEvaluationVariableDto): Promise<EvaluationVariable> {
    const variable = this.evaluationVariableRepo.create(dto);
    const saved = await this.evaluationVariableRepo.save(variable);
    
    this.logger.log(`Created evaluation variable ${saved.id} for metric ${dto.eval_metric_id}`);
    return saved;
  }
}