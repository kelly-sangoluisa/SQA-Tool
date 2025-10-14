import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateSubCriterionDto {
  @ApiProperty({ description: 'Nombre del sub-criterio', example: 'Adaptabilidad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Descripción del sub-criterio', required: false })
  @IsOptional()
  @IsString()
  description?: string;
  
  @ApiProperty({ description: 'ID del criterio al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  criterionId: number;
}

export class UpdateSubCriterionDto extends PartialType(CreateSubCriterionDto) {}