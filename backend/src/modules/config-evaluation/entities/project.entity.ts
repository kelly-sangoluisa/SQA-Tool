import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { User } from '../../../users/entities/user.entity';
import { Evaluation } from './evaluation.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('projects')
export class Project extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del proyecto', example: 1 })
  @PrimaryGeneratedColumn({ name: 'project_id' })
  id: number;

  @ApiProperty({ description: 'Nombre del proyecto', example: 'Proyecto de Software A' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

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
    example: ProjectStatus.ACTIVE
  })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Puntuación final del proyecto',
    required: false,
    example: 85.5
  })
  @Column({
    name: 'final_project_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true
  })
  final_project_score: number;

  @OneToMany(() => Evaluation, evaluation => evaluation.project)
  evaluations: Evaluation[];
}
