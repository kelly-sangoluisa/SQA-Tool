import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseTimestampEntity } from '../../common/entities/base.entity';
import { ItemStatus } from '../../modules/parameterization/types/parameterization.types';

@Entity({ name: 'roles' })
export class Role extends BaseTimestampEntity {
  @ApiProperty({ example: 2 })
  @PrimaryGeneratedColumn({ name: 'role_id' })
  id: number;

  @ApiProperty({ example: 'evaluator' })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @ApiProperty({ 
    description: 'Estado del rol (activo o inactivo)', 
    enum: ItemStatus 
  })
  @Column({ 
    type: 'enum', 
    enum: ItemStatus, 
    name: 'state', 
    default: ItemStatus.ACTIVE 
  })
  state: ItemStatus;
}