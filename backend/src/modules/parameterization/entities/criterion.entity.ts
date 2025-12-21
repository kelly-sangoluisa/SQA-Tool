import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Standard } from './standard.entity';
import { SubCriterion } from './sub-criterion.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseNamedEntity } from '../../../common/entities/base.entity';

@Entity('criteria')
export class Criterion extends BaseNamedEntity {
  @ApiProperty({ description: 'ID único del criterio', example: 1 })
  @PrimaryGeneratedColumn({ name: 'criterion_id' })
  id: number;

  @ApiProperty({ description: 'ID del estándar al que pertenece', example: 1 })
  @Column({ name: 'standard_id' })
  standard_id: number;

  @ManyToOne(() => Standard, (standard) => standard.criteria)
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @OneToMany(() => SubCriterion, (subCriterion) => subCriterion.criterion)
  sub_criteria: SubCriterion[];
}