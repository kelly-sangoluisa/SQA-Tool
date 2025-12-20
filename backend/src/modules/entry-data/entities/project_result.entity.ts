import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../../common/entities/base.entity';
import { Project } from '../../config-evaluation/entities/project.entity';

/**
 * Entidad para almacenar el resultado final de un proyecto
 * Contiene la puntuación final consolidada de todas las evaluaciones del proyecto
 */
@Entity('project_result')
export class ProjectResult extends BaseTimestampEntity {
  @ApiProperty({ description: 'ID único del resultado del proyecto', example: 1 })
  @PrimaryGeneratedColumn({ name: 'project_result_id' })
  id: number;

  @ApiProperty({ description: 'ID del proyecto' })
  @Column({ name: 'project_id' })
  project_id: number;

  @ApiProperty({ description: 'Proyecto asociado' })
  @OneToOne(() => Project, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ApiProperty({
    description: 'Puntuación final consolidada del proyecto',
    example: 87.5
  })
  @Column({
    name: 'final_project_score',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value)
    }
  })
  final_project_score: number;
}