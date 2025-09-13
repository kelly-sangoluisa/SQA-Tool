import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'role_id', type: 'int', nullable: true })
  roleId: number | null;

  @Column({ name: 'createdat', type: 'timestamptz', insert: false, update: false })
  createdAt: Date;

  @Column({ name: 'updatedat', type: 'timestamptz', insert: false, update: false })
  updatedAt: Date;
}