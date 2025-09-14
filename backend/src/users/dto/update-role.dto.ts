import { IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  roleName!: 'admin' | 'evaluator';
}
