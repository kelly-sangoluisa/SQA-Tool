import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SubCriterion } from './sub-criterion.entity';
import { FormulaVariable } from './formula-variable.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseNamedEntity } from '../../../common/entities/base.entity';

@Entity('metrics')
export class Metric extends BaseNamedEntity {
  @ApiProperty({ description: 'ID único de la métrica', example: 1 })
  @PrimaryGeneratedColumn({ name: 'metric_id' })
  id: number;

  @ApiProperty({ description: 'ID del sub-criterio al que pertenece', example: 1 })
  @Column({ name: 'sub_criterion_id' })
  sub_criterion_id: number;

  @ApiProperty({ description: 'Código único de la métrica', example: 'FC-1', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string;

  @ApiProperty({ description: 'Fórmula matemática para el cálculo', example: '(A/B)*100', required: false })
  @Column({ type: 'varchar', length: 200, nullable: true })
  formula: string;

  @ApiProperty({ description: 'Umbral deseado para la métrica', example: '>=95', required: false })
  @Column({ type: 'varchar', nullable: true })
  desired_threshold: string;

  @ApiProperty({ description: 'Peor caso para la métrica', example: '<60', required: false })
  @Column({ type: 'varchar', nullable: true })
  worst_case: string;

  @ManyToOne(() => SubCriterion, subCriterion => subCriterion.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_criterion_id' })
  sub_criterion: SubCriterion;

  @OneToMany(() => FormulaVariable, variable => variable.metric)
  variables: FormulaVariable[];
}