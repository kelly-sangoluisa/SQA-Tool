import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Criterion } from './criterion.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseNamedEntity } from '../../../common/entities/base.entity';

@Entity('standards')
export class Standard extends BaseNamedEntity {
  @ApiProperty({ description: 'ID único del estándar', example: 1 })
  @PrimaryGeneratedColumn({ name: 'standard_id' })
  id: number;

  @ApiProperty({ description: 'Versión del estándar', example: '2023', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  version: string;

  @OneToMany(() => Criterion, criterion => criterion.standard)
  criteria: Criterion[];
}