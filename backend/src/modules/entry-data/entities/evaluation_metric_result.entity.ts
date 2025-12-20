import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { EvaluationMetric } from '../../config-evaluation/entities/evaluation_metric.entity';


/**
 * Entidad para almacenar el resultado calculado de una métrica específica
 * Contiene el valor calculado aplicando la fórmula de la métrica
 */
@Entity('evaluation_metrics_result')
export class EvaluationMetricResult extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del resultado de la métrica', example: 1 })
  @PrimaryGeneratedColumn({ name: 'metric_result_id' })
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


  @ApiProperty({
    description: 'Valor calculado aplicando la fórmula de la métrica',
    example: 85.7
  })
  @Column({
    name: 'calculated_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value)
    }
  })
  calculated_value: number;

    @ApiProperty({
    description: 'Ponderacion del valor calculado aplicando la fórmula de la métrica',
    example: 85.7
  })
  @Column({
    name: 'weighted_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value)
    }
  })
  weighted_value: number;
}
