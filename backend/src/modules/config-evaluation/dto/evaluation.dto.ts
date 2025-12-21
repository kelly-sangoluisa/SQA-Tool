import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty({ description: 'ID del proyecto' })
  @IsNumber()
  @IsNotEmpty()
  project_id: number;

  @ApiProperty({ description: 'ID del estándar de calidad' })
  @IsNumber()
  @IsNotEmpty()
  standard_id: number;
}
