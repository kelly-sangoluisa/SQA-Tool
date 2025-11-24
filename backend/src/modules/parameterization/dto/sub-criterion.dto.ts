import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { BaseNameDescriptionDto } from '../../../common/dto/base.dto';

export class CreateSubCriterionDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'ID del criterio al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  criterion_id: number;
}

export class UpdateSubCriterionDto extends PartialType(CreateSubCriterionDto) {}