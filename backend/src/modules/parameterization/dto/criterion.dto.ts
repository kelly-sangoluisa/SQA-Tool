import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { BaseNameDescriptionDto } from '../../../common/dto/base.dto';

export class CreateCriterionDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'ID del estándar al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  standard_id: number;
}

export class UpdateCriterionDto extends PartialType(CreateCriterionDto) {}