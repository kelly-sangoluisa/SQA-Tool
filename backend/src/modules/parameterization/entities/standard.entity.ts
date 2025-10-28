import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Criterion } from './criterion.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ItemStatus } from '../types/parameterization.types';

@Entity('standards')
export class Standard {
  @ApiProperty({ description: 'ID único del estándar', example: 1 })
  @PrimaryGeneratedColumn({ name: 'standard_id' })
  id: number;

  @ApiProperty({ description: 'Nombre del estándar', example: 'ISO/IEC 25010' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Versión del estándar', example: '2023', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  version: string;

  @ApiProperty({ description: 'Descripción detallada del estándar', example: 'Modelo de calidad del producto software', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

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

  @OneToMany(() => Criterion, criterion => criterion.standard)
  criteria: Criterion[];
}