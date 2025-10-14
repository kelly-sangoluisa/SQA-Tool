import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsNumber } from 'class-validator';

export class CreateMetricDto {
  @ApiProperty({ description: 'Nombre de la métrica', example: 'Tasa de éxito de instalación' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'ID del sub-criterio al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  subCriterionId: number;
  
  @ApiProperty({ description: 'Código de la métrica', example: 'PO-1', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({ description: 'Descripción de la métrica', required: false })
  @IsOptional()
  @IsString()
  description?: string;
  
  @ApiProperty({ description: 'Fórmula de cálculo', example: '(InstalacionesExitosas / TotalInstalaciones) * 100', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  formula?: string;
  
  @ApiProperty({ description: 'Umbral deseado', example: 99.0, required: false })
  @IsOptional()
  @IsNumber()
  desiredThreshold?: number;
}

export class UpdateMetricDto extends PartialType(CreateMetricDto) {}