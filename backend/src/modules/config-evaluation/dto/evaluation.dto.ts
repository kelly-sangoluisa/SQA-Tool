import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ description: 'ID del proyecto' })
  @IsNumber()
  @IsNotEmpty()
  project_id: number;

  @ApiProperty({ description: 'ID del estándar de calidad' })
  @IsNumber()
  @IsNotEmpty()
  standard_id: number;

  @ApiProperty({
    description: 'Fecha de creación de la evaluación',
    example: '2025-11-03T10:30:00Z'
  })
  @IsDateString()
  @IsNotEmpty()
  creation_date: string;
}
