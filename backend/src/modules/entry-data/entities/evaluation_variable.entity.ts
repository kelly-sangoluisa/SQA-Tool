import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';
import { FormulaVariable } from '../../parameterization/entities/formula-variable.entity';

/**
 * Entidad para almacenar los valores de variables de fórmulas durante la evaluación
 * Relaciona una variable de fórmula con su valor específico para una métrica evaluada
 */
@Entity('evaluation_variables')
export class EvaluationVariable extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único de la variable de evaluación', example: 1 })
  @PrimaryGeneratedColumn({ name: 'eval_variable_id' })
  id: number;

  @ApiProperty({ description: 'ID de la métrica de evaluación' })
  @Column({ name: 'eval_metric_id' })
  eval_metric_id: number;

  @ApiProperty({ description: 'Métrica de evaluación asociada' })
  @ManyToOne(() => EvaluationMetric, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eval_metric_id' })
  evaluation_metric: EvaluationMetric;

  @ApiProperty({ description: 'ID de la variable de fórmula' })
  @Column({ name: 'variable_id' })
  variable_id: number;

  @ApiProperty({ description: 'Variable de fórmula asociada' })
  @ManyToOne(() => FormulaVariable, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variable_id' })
  variable: FormulaVariable;

  @ApiProperty({ 
    description: 'Valor numérico de la variable para el cálculo', 
    example: 85.5 
  })
  @Column({ 
    name: 'value',
    type: 'decimal',
    precision: 2,
    scale: 4
  })
  value: number;
}