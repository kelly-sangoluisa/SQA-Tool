import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { Evaluation } from '../../config-evaluation/entities/evaluation.entity';

/**
 * Entidad para almacenar el resultado final de una evaluación completa
 * Contiene la puntuación final del sistema y conclusiones
 */
@Entity('evaluation_result')
export class EvaluationResult extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del resultado de la evaluación', example: 1 })
  @PrimaryGeneratedColumn({ name: 'evaluation_result_id' })
  id: number;

  @ApiProperty({ description: 'ID de la evaluación relacionada' })
  @Column({ name: 'evaluation_id', unique: true })
  evaluation_id: number;

  @ApiProperty({ description: 'Evaluación asociada' })
  @OneToOne(() => Evaluation, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @ApiProperty({
    description: 'Puntuación final de la evaluación',
    example: 87.3
  })
  @Column({
    name: 'evaluation_score',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value)
    }
  })
  evaluation_score: number;

  @ApiProperty({ description: 'Conclusiones y observaciones de la evaluación', })
  @Column({
    name: 'conclusion',
    type: 'text'
  })
  conclusion: string;
}
