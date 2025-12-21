import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ItemStatus } from '../../modules/parameterization/types/parameterization.types';

/**
 * Entidad base con campos comunes (sin ID para permitir personalización)
 */
@Entity()
export abstract class BaseTimestampEntity {
  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}

/**
 * Entidad base con ID genérico
 */
@Entity()
export abstract class BaseEntity extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del elemento' })
  @PrimaryGeneratedColumn()
  id: number;
}

/**
 * Entidad base con nombre, descripción y estado
 */
@Entity()
export abstract class BaseNamedEntity extends BaseTimestampEntity {
  @ApiProperty({ description: 'Nombre del elemento' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del elemento', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ 
    description: 'Estado del ítem (activo o inactivo)', 
    enum: ItemStatus
  })
  @Column({ 
    type: 'enum', 
    enum: ItemStatus, 
    name: 'state', 
    default: ItemStatus.ACTIVE 
  })
  state: ItemStatus;
}