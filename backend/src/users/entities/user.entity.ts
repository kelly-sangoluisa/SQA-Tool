import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity'
import { ApiProperty } from '@nestjs/swagger';
import { BaseTimestampEntity } from '../../common/entities/base.entity';
import { ItemStatus } from '../../modules/parameterization/types/parameterization.types';

@Entity({ name: 'users' })
export class User extends BaseTimestampEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column({ type: 'varchar', length: 120, unique: true })
  email: string;

  @ApiProperty({ description: 'ID del rol' })
  @Column({ name: 'role_id' })
  role_id: number;

  @ApiProperty({ type: () => Role })
  @ManyToOne(() => Role, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @ApiProperty({ 
    description: 'Estado del usuario (activo o inactivo)', 
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