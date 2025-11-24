import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { BaseNameDescriptionDto } from '../../../common/dto/base.dto';

export class CreateMetricDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'ID del sub-criterio al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  sub_criterion_id: number;
  
  @ApiProperty({ description: 'Código de la métrica', example: 'PO-1', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;
  
  @ApiProperty({ description: 'Fórmula de cálculo', example: '(InstalacionesExitosas / TotalInstalaciones) * 100', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  formula?: string;
  
  @ApiProperty({ description: 'Umbral deseado', example: 99.0, required: false })
  @IsOptional()
  @IsNumber()
  desired_threshold?: number;
}

export class UpdateMetricDto extends PartialType(CreateMetricDto) {}