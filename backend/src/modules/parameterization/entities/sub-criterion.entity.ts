import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Criterion } from './criterion.entity';
import { Metric } from './metric.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseNamedEntity } from '../../../common/entities/base.entity';

@Entity('sub_criteria')
export class SubCriterion extends BaseNamedEntity {
  @ApiProperty({ description: 'ID único del sub-criterio', example: 1 })
  @PrimaryGeneratedColumn({ name: 'sub_criterion_id' })
  id: number;

  @ApiProperty({ description: 'ID del criterio al que pertenece', example: 1 })
  @Column({ name: 'criterion_id' })
  criterion_id: number;

  @ManyToOne(() => Criterion, criterion => criterion.sub_criteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'criterion_id' })
  criterion: Criterion;

  @OneToMany(() => Metric, metric => metric.sub_criterion)
  metrics: Metric[];
}