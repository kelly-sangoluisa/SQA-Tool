import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { User } from '../../../users/entities/user.entity';
import { Evaluation } from './evaluation.entity';

export enum ProjectStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('projects')
export class Project extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del proyecto', example: 1 })
  @PrimaryGeneratedColumn({ name: 'project_id' })
  id: number;

  @ApiProperty({ description: 'Nombre del proyecto', example: 'Proyecto de Software A' })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Umbral mínimo del proyecto', required: false })
  @Column({ 
    name: 'minimum_threshold', 
    type: 'numeric', 
    precision: 10, 
    scale: 2, 
    nullable: true 
  })
  minimum_threshold: number;

  @ApiProperty({ description: 'ID del usuario creador' })
  @Column({ name: 'creator_user_id' })
  creator_user_id: number;

  @ApiProperty({ description: 'Usuario creador del proyecto' })
  @ManyToOne(() => User, {
    eager: false,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'creator_user_id', referencedColumnName: 'id' })
  creator: User;

  @ApiProperty({
    description: 'Estado del proyecto',
    enum: ProjectStatus,
    example: ProjectStatus.IN_PROGRESS
  })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.IN_PROGRESS
  })
  status: ProjectStatus;

  @OneToMany(() => Evaluation, evaluation => evaluation.project)
  evaluations: Evaluation[];
}
