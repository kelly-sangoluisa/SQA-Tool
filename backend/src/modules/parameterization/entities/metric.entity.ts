import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SubCriterion } from './sub-criterion.entity';
import { FormulaVariable } from './formula-variable.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ItemStatus } from '../types/parameterization.types';

@Entity('metrics')
export class Metric {
  @ApiProperty({ description: 'ID único de la métrica', example: 1 })
  @PrimaryGeneratedColumn({ name: 'metric_id' })
  id: number;

  @ApiProperty({ description: 'ID del sub-criterio al que pertenece', example: 1 })
  @Column({ name: 'sub_criterion_id' })
  sub_criterion_id: number;

  @ApiProperty({ description: 'Código único de la métrica', example: 'FC-1', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string;

  @ApiProperty({ description: 'Nombre de la métrica', example: 'Porcentaje de funciones implementadas' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción de la métrica', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Fórmula matemática para el cálculo', example: '(A/B)*100', required: false })
  @Column({ type: 'varchar', length: 200, nullable: true })
  formula: string;

  @ApiProperty({ description: 'Umbral deseado para la métrica', example: 95.5, required: false })
  @Column({ type: 'numeric', precision: 10, scale: 4, nullable: true })
  desired_threshold: number;

  @ApiProperty({ 
    description: 'Estado del ítem (activo o inactivo)', 
    enum: ItemStatus, 
    example: ItemStatus.ACTIVE 
  })
  @Column({ 
    type: 'enum', 
    enum: ItemStatus, 
    name: 'state', 
    default: ItemStatus.ACTIVE 
  })
  state: ItemStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => SubCriterion, subCriterion => subCriterion.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_criterion_id' })
  sub_criterion: SubCriterion;

  @OneToMany(() => FormulaVariable, variable => variable.metric)
  variables: FormulaVariable[];
}