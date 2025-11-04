import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { Evaluation } from './evaluation.entity';
import { Criterion } from '../../parameterization/entities/criterion.entity';

export enum ImportanceLevel {
  HIGH = 'A',
  MEDIUM = 'M',
  LOW = 'B',
}

@Entity('evaluation_criteria')
export class EvaluationCriterion extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del criterio de evaluación', example: 1 })
  @PrimaryGeneratedColumn({ name: 'eval_criterion_id' })
  id: number;

  @ApiProperty({ description: 'ID de la evaluación' })
  @Column({ name: 'evaluation_id' })
  evaluation_id: number;

  @ApiProperty({ description: 'Evaluación asociada' })
  @ManyToOne(() => Evaluation, evaluation => evaluation.evaluation_criteria, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluation_id', referencedColumnName: 'id' })
  evaluation: Evaluation;

  @ApiProperty({ description: 'ID del criterio' })
  @Column({ name: 'criterion_id' })
  criterion_id: number;

  @ApiProperty({ description: 'Criterio de calidad aplicado' })
  @ManyToOne(() => Criterion, {
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'criterion_id', referencedColumnName: 'id' })
  criterion: Criterion;

  @ApiProperty({
    description: 'Nivel de importancia del criterio',
    enum: ImportanceLevel,
    example: ImportanceLevel.HIGH
  })
  @Column({
    type: 'enum',
    enum: ImportanceLevel,
    name: 'importance_level'
  })
  importance_level: ImportanceLevel;

  @ApiProperty({
    description: 'Porcentaje de importancia del criterio',
    example: 30.5
  })
  @Column({
    name: 'importance_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2
  })
  importance_percentage: number;
}
