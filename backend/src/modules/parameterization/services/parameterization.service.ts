import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ObjectLiteral, Repository, DataSource, ILike } from 'typeorm';

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
import { UpdateStateDto } from '../dto/update-state.dto';
import { FindAllQueryDto } from '../dto/find-all-query.dto';

@Injectable()
export class ParameterizationService {
  private readonly logger = new Logger(ParameterizationService.name);

  constructor(
    @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
    @InjectRepository(Criterion) private readonly criterionRepo: Repository<Criterion>,
    @InjectRepository(SubCriterion) private readonly subCriterionRepo: Repository<SubCriterion>,
    @InjectRepository(Metric) private readonly metricRepo: Repository<Metric>,
    @InjectRepository(FormulaVariable) private readonly variableRepo: Repository<FormulaVariable>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Helper genérico refactorizado ---
  private async findOneOrFail<T extends ObjectLiteral>(
    repo: Repository<T>,
    id: number,
    name: string,
  ): Promise<T> {
    if (!id || id <= 0) {
      throw new BadRequestException(`Invalid ${name} ID: ${id}`);
    }
    
    const entity = await repo.findOneBy({ id: id } as any);
    if (!entity) {
      throw new NotFoundException(`${name} with ID ${id} not found`);
    }
    return entity;
  }

  // --- Helper genérico para DTO de consulta refactorizado ---
  private buildFindAllWhere<T>(
    query: FindAllQueryDto,
    searchFields: string[],
    baseWhere: FindOptionsWhere<T> = {},
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    const { state, search } = query;
    const baseConditions: FindOptionsWhere<T> = { ...baseWhere };

    if (state && state !== 'all') {
      (baseConditions as any).state = state;
    }

    if (!search || search.trim() === '') {
      return baseConditions;
    }

    const searchPattern = ILike(`%${search.trim()}%`);
    const whereClauses = searchFields.map((field) => {
      return {
        ...baseConditions,
        [field]: searchPattern,
      } as FindOptionsWhere<T>;
    });

    return whereClauses;
  }

  // --- Helper genérico para actualizar estado refactorizado ---
  private async updateEntityState<T extends { state: any }>(
    repo: Repository<T>,
    id: number,
    updateStateDto: UpdateStateDto,
    entityName: string,
  ): Promise<T> {
    const entity = await this.findOneOrFail(repo, id, entityName) as T;
    const oldState = entity.state;
    entity.state = updateStateDto.state;

    const result = await repo.save(entity as any);
    this.logger.log(`${entityName} ${id} state changed from ${oldState} to ${updateStateDto.state}`);
    
    return result as T;
  }

  // --- CRUD for Standards ---
  findAllStandards(query: FindAllQueryDto) {
    const where = this.buildFindAllWhere(query, ['name', 'description']);
    const { page = 1, limit = 10 } = query;
    
    return this.standardRepo.find({
      where,
      order: { name: 'ASC' },
      relations: ['criteria'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOneStandard(id: number) {
    return this.findOneOrFail(this.standardRepo, id, 'Standard');
  }

  createStandard(createStandardDto: CreateStandardDto) {
    const newStandard = this.standardRepo.create(createStandardDto);
    const result = this.standardRepo.save(newStandard);
    this.logger.log(`Created new Standard: ${createStandardDto.name}`);
    return result;
  }

  async updateStandard(id: number, updateStandardDto: UpdateStandardDto) {
    const standard = await this.findOneStandard(id);
    this.standardRepo.merge(standard, updateStandardDto);
    return this.standardRepo.save(standard);
  }

  async updateStandardState(id: number, updateStateDto: UpdateStateDto) {
    return this.updateEntityState(this.standardRepo, id, updateStateDto, 'Standard');
  }

  // --- CRUD for Criteria ---
  findAllCriteria(query: FindAllQueryDto, standard_id?: number) {
    const baseWhere = standard_id ? { standard_id } : {};
    const where = this.buildFindAllWhere(query, ['name', 'description'], baseWhere);
    const { page = 1, limit = 10 } = query;
    
    return this.criterionRepo.find({
      where,
      order: { name: 'ASC' },
      relations: ['sub_criteria'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOneCriterion(id: number) {
    return this.findOneOrFail(this.criterionRepo, id, 'Criterion');
  }

  async createCriterion(createCriterionDto: CreateCriterionDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneStandard(createCriterionDto.standard_id);
      const newCriterion = manager.create(Criterion, createCriterionDto);
      const result = await manager.save(newCriterion);
      
      this.logger.log(`Created new criterion: ${result.name} (ID: ${result.id}) for standard ${createCriterionDto.standard_id}`);
      
      return result;
    });
  }

  async updateCriterion(id: number, updateCriterionDto: UpdateCriterionDto) {
    const criterion = await this.findOneCriterion(id);
    if (updateCriterionDto.standard_id) {
      await this.findOneStandard(updateCriterionDto.standard_id);
    }
    this.criterionRepo.merge(criterion, updateCriterionDto);
    return this.criterionRepo.save(criterion);
  }

  async updateCriterionState(id: number, updateStateDto: UpdateStateDto) {
    return this.updateEntityState(this.criterionRepo, id, updateStateDto, 'Criterion');
  }

  // --- CRUD for SubCriteria ---
  findAllSubCriteria(query: FindAllQueryDto, criterion_id?: number) {
    const baseWhere = criterion_id ? { criterion_id } : {};
    const where = this.buildFindAllWhere(query, ['name', 'description'], baseWhere);
    const { page = 1, limit = 10 } = query;
    
    return this.subCriterionRepo.find({
      where,
      order: { name: 'ASC' },
      relations: ['metrics'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOneSubCriterion(id: number) {
    return this.findOneOrFail(this.subCriterionRepo, id, 'SubCriterion');
  }

  async createSubCriterion(createSubCriterionDto: CreateSubCriterionDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneCriterion(createSubCriterionDto.criterion_id);
      const newSubCriterion = manager.create(SubCriterion, createSubCriterionDto);
      const result = await manager.save(newSubCriterion);
      
      this.logger.log(`Created new sub-criterion: ${result.name} (ID: ${result.id}) for criterion ${createSubCriterionDto.criterion_id}`);
      
      return result;
    });
  }

  async updateSubCriterion(id: number, updateSubCriterionDto: UpdateSubCriterionDto) {
    const subCriterion = await this.findOneSubCriterion(id);
    if (updateSubCriterionDto.criterion_id) {
      await this.findOneCriterion(updateSubCriterionDto.criterion_id);
    }
    this.subCriterionRepo.merge(subCriterion, updateSubCriterionDto);
    return this.subCriterionRepo.save(subCriterion);
  }

  async updateSubCriterionState(id: number, updateStateDto: UpdateStateDto) {
    return this.updateEntityState(this.subCriterionRepo, id, updateStateDto, 'SubCriterion');
  }

  // --- CRUD for Metrics ---
  findAllMetrics(query: FindAllQueryDto, sub_criterion_id?: number) {
    const baseWhere = sub_criterion_id ? { sub_criterion_id } : {};
    const where = this.buildFindAllWhere(query, ['name', 'description'], baseWhere);
    const { page = 1, limit = 10 } = query;
    
    return this.metricRepo.find({
      where,
      order: { name: 'ASC' },
      relations: ['variables'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOneMetric(id: number) {
    return this.findOneOrFail(this.metricRepo, id, 'Metric');
  }

  async createMetric(createMetricDto: CreateMetricDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneSubCriterion(createMetricDto.sub_criterion_id);
      const newMetric = manager.create(Metric, createMetricDto);
      const result = await manager.save(newMetric);
      
      this.logger.log(`Created new metric: ${result.name} (ID: ${result.id}) for sub-criterion ${createMetricDto.sub_criterion_id}`);
      
      return result;
    });
  }

  async updateMetric(id: number, updateMetricDto: UpdateMetricDto) {
    const metric = await this.findOneMetric(id);
    if (updateMetricDto.sub_criterion_id) {
      await this.findOneSubCriterion(updateMetricDto.sub_criterion_id);
    }
    this.metricRepo.merge(metric, updateMetricDto);
    return this.metricRepo.save(metric);
  }

  async updateMetricState(id: number, updateStateDto: UpdateStateDto) {
    return this.updateEntityState(this.metricRepo, id, updateStateDto, 'Metric');
  }

  // --- CRUD for FormulaVariables ---
  findAllVariables(query: FindAllQueryDto, metric_id?: number) {
    const baseWhere = metric_id ? { metric_id } : {};
    const where = this.buildFindAllWhere(query, ['symbol', 'description'], baseWhere);
    const { page = 1, limit = 10 } = query;
    
    return this.variableRepo.find({ 
      where, 
      order: { symbol: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOneVariable(id: number) {
    return this.findOneOrFail(this.variableRepo, id, 'FormulaVariable');
  }

  async createVariable(createVariableDto: CreateFormulaVariableDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneMetric(createVariableDto.metric_id);
      const newVariable = manager.create(FormulaVariable, createVariableDto);
      const result = await manager.save(newVariable);
      
      this.logger.log(`Created new formula variable: ${result.symbol} (ID: ${result.id}) for metric ${createVariableDto.metric_id}`);
      
      return result;
    });
  }

  async updateVariable(id: number, updateVariableDto: UpdateFormulaVariableDto) {
    const variable = await this.findOneVariable(id);
    if (updateVariableDto.metric_id) {
      await this.findOneMetric(updateVariableDto.metric_id);
    }
    this.variableRepo.merge(variable, updateVariableDto);
    return this.variableRepo.save(variable);
  }

  async updateVariableState(id: number, updateStateDto: UpdateStateDto) {
    return this.updateEntityState(this.variableRepo, id, updateStateDto, 'FormulaVariable');
  }
}