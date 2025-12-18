import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { BaseNameDescriptionDto } from '../../../common/dto/base.dto';

export class CreateSubCriterionDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'ID del criterio al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  criterion_id: number;

  @ApiProperty({ 
    description: 'IDs de métricas existentes para copiar al nuevo subcriterio',
    required: false,
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  metric_ids_to_copy?: number[];
}

export class UpdateSubCriterionDto extends PartialType(CreateSubCriterionDto) {}