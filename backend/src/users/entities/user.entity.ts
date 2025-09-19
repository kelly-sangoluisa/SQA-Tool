import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({ type: () => Role })
  @ManyToOne(() => Role, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Role;

  @ApiProperty({ type: String, format: 'date-time', example: '2025-09-13T18:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2025-09-13T18:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}