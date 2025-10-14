import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

// Entities
import { Standard } from '../entities/standard.entity';
import { Criterion } from '../entities/criterion.entity';
import { SubCriterion } from '../entities/sub-criterion.entity';
import { Metric } from '../entities/metric.entity';
import { FormulaVariable } from '../entities/formula-variable.entity';

// DTOs
import { CreateStandardDto, UpdateStandardDto } from '../dto/standard.dto';
import { CreateCriterionDto, UpdateCriterionDto } from '../dto/criterion.dto';
import { CreateSubCriterionDto, UpdateSubCriterionDto } from '../dto/sub-criterion.dto';
import { CreateMetricDto, UpdateMetricDto } from '../dto/metric.dto';
import { CreateFormulaVariableDto, UpdateFormulaVariableDto } from '../dto/formula-variable.dto';

@Injectable()
export class ParameterizationService {
  constructor(
    @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
    @InjectRepository(Criterion) private readonly criterionRepo: Repository<Criterion>,
    @InjectRepository(SubCriterion) private readonly subCriterionRepo: Repository<SubCriterion>,
    @InjectRepository(Metric) private readonly metricRepo: Repository<Metric>,
    @InjectRepository(FormulaVariable) private readonly variableRepo: Repository<FormulaVariable>,
  ) {}

  // Generic findOneOrFail checker
  private async findOneOrFail<T extends ObjectLiteral>(repo: Repository<T>, id: number, name: string): Promise<T> {
    const entity = await repo.findOneBy({ id: id } as any);
    if (!entity) {
      throw new NotFoundException(`${name} with ID ${id} not found`);
    }
    return entity;
  }
  
  // CRUD for Standards
  findAllStandards() {
    return this.standardRepo.find({ order: { name: 'ASC' }, relations: ['criteria'] });
  }
  findOneStandard(id: number) {
    return this.findOneOrFail(this.standardRepo, id, 'Standard');
  }
  createStandard(dto: CreateStandardDto) {
    const newStandard = this.standardRepo.create(dto);
    return this.standardRepo.save(newStandard);
  }
  async updateStandard(id: number, dto: UpdateStandardDto) {
    const standard = await this.findOneStandard(id);
    this.standardRepo.merge(standard, dto);
    return this.standardRepo.save(standard);
  }
  async removeStandard(id: number) {
    await this.findOneStandard(id);
    await this.standardRepo.delete(id);
    return { message: `Standard with ID ${id} deleted` };
  }

  // CRUD for Criteria
  findAllCriteria(standardId?: number) {
    const where = standardId ? { standardId } : {};
    return this.criterionRepo.find({ where, order: { name: 'ASC' }, relations: ['subCriteria'] });
  }
  findOneCriterion(id: number) {
    return this.findOneOrFail(this.criterionRepo, id, 'Criterion');
  }
  async createCriterion(dto: CreateCriterionDto) {
    await this.findOneStandard(dto.standardId); // Check if standard exists
    const newCriterion = this.criterionRepo.create(dto);
    return this.criterionRepo.save(newCriterion);
  }
  async updateCriterion(id: number, dto: UpdateCriterionDto) {
    const criterion = await this.findOneCriterion(id);
    if (dto.standardId) await this.findOneStandard(dto.standardId);
    this.criterionRepo.merge(criterion, dto);
    return this.criterionRepo.save(criterion);
  }
  async removeCriterion(id: number) {
    await this.findOneCriterion(id);
    await this.criterionRepo.delete(id);
    return { message: `Criterion with ID ${id} deleted` };
  }
  
  // CRUD for SubCriteria
  findAllSubCriteria(criterionId?: number) {
    const where = criterionId ? { criterionId } : {};
    return this.subCriterionRepo.find({ where, order: { name: 'ASC' }, relations: ['metrics'] });
  }
  findOneSubCriterion(id: number) {
    return this.findOneOrFail(this.subCriterionRepo, id, 'SubCriterion');
  }
  async createSubCriterion(dto: CreateSubCriterionDto) {
    await this.findOneCriterion(dto.criterionId);
    const newSubCriterion = this.subCriterionRepo.create(dto);
    return this.subCriterionRepo.save(newSubCriterion);
  }
  async updateSubCriterion(id: number, dto: UpdateSubCriterionDto) {
    const subCriterion = await this.findOneSubCriterion(id);
    if (dto.criterionId) await this.findOneCriterion(dto.criterionId);
    this.subCriterionRepo.merge(subCriterion, dto);
    return this.subCriterionRepo.save(subCriterion);
  }
  async removeSubCriterion(id: number) {
    await this.findOneSubCriterion(id);
    await this.subCriterionRepo.delete(id);
    return { message: `SubCriterion with ID ${id} deleted` };
  }

  // CRUD for Metrics
  findAllMetrics(subCriterionId?: number) {
    const where = subCriterionId ? { subCriterionId } : {};
    return this.metricRepo.find({ where, order: { name: 'ASC' }, relations: ['variables'] });
  }
  findOneMetric(id: number) {
    return this.findOneOrFail(this.metricRepo, id, 'Metric');
  }
  async createMetric(dto: CreateMetricDto) {
    await this.findOneSubCriterion(dto.subCriterionId);
    const newMetric = this.metricRepo.create(dto);
    return this.metricRepo.save(newMetric);
  }
  async updateMetric(id: number, dto: UpdateMetricDto) {
    const metric = await this.findOneMetric(id);
    if (dto.subCriterionId) await this.findOneSubCriterion(dto.subCriterionId);
    this.metricRepo.merge(metric, dto);
    return this.metricRepo.save(metric);
  }
  async removeMetric(id: number) {
    await this.findOneMetric(id);
    await this.metricRepo.delete(id);
    return { message: `Metric with ID ${id} deleted` };
  }

  // CRUD for FormulaVariables
  findAllVariables(metricId?: number) {
    const where = metricId ? { metricId } : {};
    return this.variableRepo.find({ where, order: { symbol: 'ASC' } });
  }
  findOneVariable(id: number) {
    return this.findOneOrFail(this.variableRepo, id, 'FormulaVariable');
  }
  async createVariable(dto: CreateFormulaVariableDto) {
    await this.findOneMetric(dto.metricId);
    const newVariable = this.variableRepo.create(dto);
    return this.variableRepo.save(newVariable);
  }
  async updateVariable(id: number, dto: UpdateFormulaVariableDto) {
    const variable = await this.findOneVariable(id);
    if (dto.metricId) await this.findOneMetric(dto.metricId);
    this.variableRepo.merge(variable, dto);
    return this.variableRepo.save(variable);
  }
  async removeVariable(id: number) {
    await this.findOneVariable(id);
    await this.variableRepo.delete(id);
    return { message: `FormulaVariable with ID ${id} deleted` };
  }
}