import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { EvaluationCriterion } from '../../config-evaluation/entities/evaluation-criterion.entity';

/**
 * Entidad para almacenar el resultado final de un criterio de evaluación
 * Contiene la puntuación final calculada considerando la importancia del criterio
 */
@Entity('evaluation_criteria_result')
export class EvaluationCriteriaResult extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del resultado del criterio', example: 1 })
  @PrimaryGeneratedColumn({ name: 'criteria_result_id' })
  id: number;

  @ApiProperty({ description: 'ID del criterio de evaluación' })
  @Column({ name: 'eval_criterion_id' })
  eval_criterion_id: number;

  @ApiProperty({ description: 'Criterio de evaluación asociado' })
  @ManyToOne(() => EvaluationCriterion, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eval_criterion_id' })
  evaluation_criterion: EvaluationCriterion;

  @ApiProperty({ 
    description: 'Puntuación final del criterio', 
    example: 92.3 
  })
  @Column({ 
    name: 'final_score',
    type: 'numeric', 
    precision: 5, 
    scale: 2
  })
  final_score: number;

    @ApiProperty({
    description: 'Fecha de creación de los resultados',
    type: String,
    format: 'date-time'
  })
  @Column({ name: 'creation_date', type: 'timestamptz' })
  creation_date: Date;

}
