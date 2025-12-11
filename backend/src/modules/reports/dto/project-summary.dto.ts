import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para listar proyectos del usuario con su estado de aprobación
 */
export class ProjectSummaryDto {
  @ApiProperty({ description: 'ID del proyecto' })
  project_id: number;

  @ApiProperty({ description: 'Nombre del proyecto' })
  project_name: string;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  project_description: string | null;

  @ApiProperty({ description: 'Umbral mínimo del proyecto' })
  minimum_threshold: number | null;

  @ApiProperty({ description: 'Puntuación final del proyecto', required: false })
  final_project_score: number | null;

  @ApiProperty({ description: 'Indica si el proyecto cumple con el umbral mínimo' })
  meets_threshold: boolean;

  @ApiProperty({ description: 'Estado del proyecto (in_progress, completed, cancelled)' })
  status: string;

  @ApiProperty({ description: 'Cantidad de evaluaciones en el proyecto' })
  evaluation_count: number;

  @ApiProperty({ description: 'Fecha de creación del proyecto' })
  created_at: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updated_at: Date;
}
