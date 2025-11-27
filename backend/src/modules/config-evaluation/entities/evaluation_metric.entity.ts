import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { Metric} from '../../parameterization/entities/metric.entity';
import { EvaluationCriterion } from './evaluation-criterion.entity';    


@Entity('evaluation_metric')
export class EvaluationMetric extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único de la métrica de evaluación', example: 1 })
  @PrimaryGeneratedColumn({ name: 'eval_metric_id' })
  id: number;

  @ApiProperty({ description: 'ID de la evaluación' })
  @Column({ name: 'eval_criterion_id' })
  eval_criterion_id: number;

  @ApiProperty({ description: 'Evaluación asociada' })
  @ManyToOne(() => EvaluationCriterion , {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eval_criterion_id', referencedColumnName: 'id' })
  evaluation_criterion: EvaluationCriterion;


  @ApiProperty({ description: 'ID de la metrica' })
  @Column({ name: 'metric_id' })
  metric_id: number;

  @ApiProperty({ description: 'metrica aplicada' })
  @ManyToOne(() => Metric, {
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'metric_id', referencedColumnName: 'id' })
  metric: Metric;


  @ApiProperty({
    description: 'Porcentaje de importancia del criterio',
    example: 30.5
  })
  @Column({
    name: 'weight_value',
    type: 'decimal',
    precision: 5,
    scale: 2
  })
  weight_value: number;
}
