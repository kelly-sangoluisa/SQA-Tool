import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'roles' })
export class Role {
  @ApiProperty({ example: 2 })
  @PrimaryGeneratedColumn({ name: 'role_id' })
  id: number;

  @ApiProperty({ example: 'evaluator' })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;
}