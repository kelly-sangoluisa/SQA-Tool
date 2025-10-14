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
  standardId: number;

  @ApiProperty({ description: 'Nombre del criterio', example: 'Adecuación funcional' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del criterio', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Standard, standard => standard.criteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @OneToMany(() => SubCriterion, subCriterion => subCriterion.criterion)
  subCriteria: SubCriterion[];
}