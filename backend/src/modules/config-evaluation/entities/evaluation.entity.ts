import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';
import { Standard } from '../../parameterization/entities/standard.entity';
import { EvaluationCriterion } from './evaluation-criterion.entity';

@Entity('evaluations')
export class Evaluation extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único de la evaluación', example: 1 })
  @PrimaryGeneratedColumn({ name: 'evaluation_id' })
  id: number;

  @ApiProperty({ description: 'ID del proyecto' })
  @Column({ name: 'project_id' })
  project_id: number;

  @ApiProperty({ description: 'Proyecto asociado' })
  @ManyToOne(() => Project, project => project.evaluations, {
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: Project;

  @ApiProperty({ description: 'ID del estándar' })
  @Column({ name: 'standard_id' })
  standard_id: number;

  @ApiProperty({ description: 'Estándar de calidad aplicado' })
  @ManyToOne(() => Standard, {
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'standard_id', referencedColumnName: 'id' })
  standard: Standard;

  @OneToMany(() => EvaluationCriterion, criterion => criterion.evaluation)
  evaluation_criteria: EvaluationCriterion[];
}
