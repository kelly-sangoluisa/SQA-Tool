import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Criterion } from './criterion.entity';
import { Metric } from './metric.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sub_criteria')
export class SubCriterion {
  @ApiProperty({ description: 'ID único del sub-criterio', example: 1 })
  @PrimaryGeneratedColumn({ name: 'sub_criterion_id' })
  id: number;

  @ApiProperty({ description: 'ID del criterio al que pertenece', example: 1 })
  @Column({ name: 'criterion_id' })
  criterion_id: number;

  @ApiProperty({ description: 'Nombre del sub-criterio', example: 'Completitud funcional' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del sub-criterio', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Criterion, criterion => criterion.sub_criteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'criterion_id' })
  criterion: Criterion;

  @OneToMany(() => Metric, metric => metric.sub_criterion)
  metrics: Metric[];
}