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
  createStandard(create_standard_dto: CreateStandardDto) {
    const newStandard = this.standardRepo.create(create_standard_dto);
    return this.standardRepo.save(newStandard);
  }
  async updateStandard(id: number, update_standard_dto: UpdateStandardDto) {
    const standard = await this.findOneStandard(id);
    this.standardRepo.merge(standard, update_standard_dto);
    return this.standardRepo.save(standard);
  }
  async removeStandard(id: number) {
    await this.findOneStandard(id);
    await this.standardRepo.delete(id);
    return { message: `Standard with ID ${id} deleted` };
  }

  // CRUD for Criteria
  findAllCriteria(standard_id?: number) {
    const where = standard_id ? { standard_id } : {};
    return this.criterionRepo.find({ where, order: { name: 'ASC' }, relations: ['sub_criteria'] });
  }
  findOneCriterion(id: number) {
    return this.findOneOrFail(this.criterionRepo, id, 'Criterion');
  }
  async createCriterion(create_criterion_dto: CreateCriterionDto) {
    await this.findOneStandard(create_criterion_dto.standard_id); // Check if standard exists
    const newCriterion = this.criterionRepo.create(create_criterion_dto);
    return this.criterionRepo.save(newCriterion);
  }
  async updateCriterion(id: number, update_criterion_dto: UpdateCriterionDto) {
    const criterion = await this.findOneCriterion(id);
    if (update_criterion_dto.standard_id) await this.findOneStandard(update_criterion_dto.standard_id);
    this.criterionRepo.merge(criterion, update_criterion_dto);
    return this.criterionRepo.save(criterion);
  }
  async removeCriterion(id: number) {
    await this.findOneCriterion(id);
    await this.criterionRepo.delete(id);
    return { message: `Criterion with ID ${id} deleted` };
  }
  
  // CRUD for SubCriteria
  findAllSubCriteria(criterion_id?: number) {
    const where = criterion_id ? { criterion_id } : {};
    return this.subCriterionRepo.find({ where, order: { name: 'ASC' }, relations: ['metrics'] });
  }
  findOneSubCriterion(id: number) {
    return this.findOneOrFail(this.subCriterionRepo, id, 'SubCriterion');
  }
  async createSubCriterion(create_sub_criterion_dto: CreateSubCriterionDto) {
    await this.findOneCriterion(create_sub_criterion_dto.criterion_id);
    const newSubCriterion = this.subCriterionRepo.create(create_sub_criterion_dto);
    return this.subCriterionRepo.save(newSubCriterion);
  }
  async updateSubCriterion(id: number, update_sub_criterion_dto: UpdateSubCriterionDto) {
    const subCriterion = await this.findOneSubCriterion(id);
    if (update_sub_criterion_dto.criterion_id) await this.findOneCriterion(update_sub_criterion_dto.criterion_id);
    this.subCriterionRepo.merge(subCriterion, update_sub_criterion_dto);
    return this.subCriterionRepo.save(subCriterion);
  }
  async removeSubCriterion(id: number) {
    await this.findOneSubCriterion(id);
    await this.subCriterionRepo.delete(id);
    return { message: `SubCriterion with ID ${id} deleted` };
  }

  // CRUD for Metrics
  findAllMetrics(sub_criterion_id?: number) {
    const where = sub_criterion_id ? { sub_criterion_id } : {};
    return this.metricRepo.find({ where, order: { name: 'ASC' }, relations: ['variables'] });
  }
  findOneMetric(id: number) {
    return this.findOneOrFail(this.metricRepo, id, 'Metric');
  }
  async createMetric(create_metric_dto: CreateMetricDto) {
    await this.findOneSubCriterion(create_metric_dto.sub_criterion_id);
    const newMetric = this.metricRepo.create(create_metric_dto);
    return this.metricRepo.save(newMetric);
  }
  async updateMetric(id: number, update_metric_dto: UpdateMetricDto) {
    const metric = await this.findOneMetric(id);
    if (update_metric_dto.sub_criterion_id) await this.findOneSubCriterion(update_metric_dto.sub_criterion_id);
    this.metricRepo.merge(metric, update_metric_dto);
    return this.metricRepo.save(metric);
  }
  async removeMetric(id: number) {
    await this.findOneMetric(id);
    await this.metricRepo.delete(id);
    return { message: `Metric with ID ${id} deleted` };
  }

  // CRUD for FormulaVariables
  findAllVariables(metric_id?: number) {
    const where = metric_id ? { metric_id } : {};
    return this.variableRepo.find({ where, order: { symbol: 'ASC' } });
  }
  findOneVariable(id: number) {
    return this.findOneOrFail(this.variableRepo, id, 'FormulaVariable');
  }
  async createVariable(create_variable_dto: CreateFormulaVariableDto) {
    await this.findOneMetric(create_variable_dto.metric_id);
    const newVariable = this.variableRepo.create(create_variable_dto);
    return this.variableRepo.save(newVariable);
  }
  async updateVariable(id: number, update_variable_dto: UpdateFormulaVariableDto) {
    const variable = await this.findOneVariable(id);
    if (update_variable_dto.metric_id) await this.findOneMetric(update_variable_dto.metric_id);
    this.variableRepo.merge(variable, update_variable_dto);
    return this.variableRepo.save(variable);
  }
  async removeVariable(id: number) {
    await this.findOneVariable(id);
    await this.variableRepo.delete(id);
    return { message: `FormulaVariable with ID ${id} deleted` };
  }
}