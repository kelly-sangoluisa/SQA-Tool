import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Standard } from './standard.entity';
import { SubCriterion } from './sub-criterion.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('criteria')
export class Criterion {
  @ApiProperty({ description: 'ID único del criterio', example: 1 })
  @PrimaryGeneratedColumn({ name: 'criterion_id' })
  id: number;

  @ApiProperty({ description: 'ID del estándar al que pertenece', example: 1 })
  @Column({ name: 'standard_id' })
  standard_id: number;

  @ApiProperty({ description: 'Nombre del criterio', example: 'Adecuación funcional' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del criterio', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Fecha de creación', example: '2021-01-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @ApiProperty({ description: 'Fecha de actualización', example: '2021-01-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Standard, (standard) => standard.criteria)
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @OneToMany(() => SubCriterion, (subCriterion) => subCriterion.criterion)
  sub_criteria: SubCriterion[];
}