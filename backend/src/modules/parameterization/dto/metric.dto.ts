import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BaseNameDescriptionDto } from '../../../common/dto/base.dto';

export class CreateMetricDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'ID del sub-criterio al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  sub_criterion_id: number;
  
  @ApiProperty({ description: 'Código de la métrica', example: 'PO-1', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code?: string;
  
  @ApiProperty({ description: 'Fórmula de cálculo', example: '(InstalacionesExitosas / TotalInstalaciones) * 100', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  formula?: string;
  
  @ApiProperty({ description: 'Umbral deseado', example: '>=95', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  desired_threshold?: string;
  
  @ApiProperty({ description: 'Peor caso', example: '<60', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  worst_case?: string;
}

export class UpdateMetricDto extends PartialType(CreateMetricDto) {}