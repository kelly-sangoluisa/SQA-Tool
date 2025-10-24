import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Metric } from './metric.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('formula_variables')
export class FormulaVariable {
  @ApiProperty({ description: 'ID único de la variable', example: 1 })
  @PrimaryGeneratedColumn({ name: 'variable_id' })
  id: number;

  @ApiProperty({ description: 'ID de la métrica a la que pertenece', example: 1 })
  @Column({ name: 'metric_id' })
  metric_id: number;

  @ApiProperty({ description: 'Símbolo de la variable en la fórmula', example: 'A' })
  @Column({ type: 'varchar', length: 10, nullable: true })
  symbol: string;

  @ApiProperty({ description: 'Descripción de lo que representa la variable', example: 'Número de funciones implementadas' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Metric, metric => metric.variables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'metric_id' })
  metric: Metric;
}