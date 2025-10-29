import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { BaseNameDescriptionDto } from '../../../common/dto/base.dto';

export class CreateStandardDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'Versión del estándar', example: '2001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;
}

export class UpdateStandardDto extends PartialType(CreateStandardDto) {}