import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
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
import { ItemStatus } from '../types/parameterization.types';

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

  // --- Helper genérico ---
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

  // --- Helper genérico para DTO de consulta ---
  private buildFindAllWhere<T>(
    query: FindAllQueryDto,
    searchFields: string[], // Campos en los que se buscará (ej: ['name', 'description'])
    baseWhere: FindOptionsWhere<T> = {},
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    const { state, search } = query;

    // 1. Iniciar con las condiciones base (ej: { standard_id: 1 })
    const baseConditions: FindOptionsWhere<T> = { ...baseWhere };

    // 2. Añadir filtro de estado (si no es 'all')
    if (state && state !== 'all') {
      (baseConditions as any).state = state;
    }

    // 3. Si no hay término de búsqueda, devolver solo las condiciones base
    if (!search || search.trim() === '') {
      return baseConditions;
    }

    // 4. Si hay búsqueda, construir un array de cláusulas OR
    const searchPattern = ILike(`%${search.trim()}%`);

    // Esto crea: [ {state: 'active', name: ILike(...) }, {state: 'active', description: ILike(...)} ]
    // TypeORM lo traduce a: state = 'active' AND (name ILike '...' OR description ILike '...')
    const whereClauses = searchFields.map((field) => {
      return {
        ...baseConditions,
        [field]: searchPattern,
      } as FindOptionsWhere<T>;
    });

    return whereClauses;
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
  createStandard(create_standard_dto: CreateStandardDto) {
    const newStandard = this.standardRepo.create(create_standard_dto);
    return this.standardRepo.save(newStandard);
  }
  async updateStandard(id: number, update_standard_dto: UpdateStandardDto) {
    const standard = await this.findOneStandard(id);
    this.standardRepo.merge(standard, update_standard_dto);
    return this.standardRepo.save(standard);
  }
  async updateStandardState(id: number, update_state_dto: UpdateStateDto) {
    const standard = await this.findOneStandard(id);
    const oldState = standard.state;
    standard.state = update_state_dto.state;

    const result = await this.standardRepo.save(standard);
    
    this.logger.log(`Standard ${id} state changed from ${oldState} to ${update_state_dto.state}`);
    
    return result;
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
  async createCriterion(create_criterion_dto: CreateCriterionDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneStandard(create_criterion_dto.standard_id);
      const newCriterion = manager.create(Criterion, create_criterion_dto);
      const result = await manager.save(newCriterion);
      
      this.logger.log(`Created new criterion: ${result.name} (ID: ${result.id}) for standard ${create_criterion_dto.standard_id}`);
      
      return result;
    });
  }
  async updateCriterion(id: number, update_criterion_dto: UpdateCriterionDto) {
    const criterion = await this.findOneCriterion(id);
    if (update_criterion_dto.standard_id)
      await this.findOneStandard(update_criterion_dto.standard_id);
    this.criterionRepo.merge(criterion, update_criterion_dto);
    return this.criterionRepo.save(criterion);
  }
  async updateCriterionState(id: number, update_state_dto: UpdateStateDto) {
    const criterion = await this.findOneCriterion(id);
    const oldState = criterion.state;
    criterion.state = update_state_dto.state;
    const result = await this.criterionRepo.save(criterion);
    
    this.logger.log(`Criterion ${id} state changed from ${oldState} to ${update_state_dto.state}`);
    
    return result;
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
  async createSubCriterion(create_sub_criterion_dto: CreateSubCriterionDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneCriterion(create_sub_criterion_dto.criterion_id);
      const newSubCriterion = manager.create(SubCriterion, create_sub_criterion_dto);
      const result = await manager.save(newSubCriterion);
      
      this.logger.log(`Created new sub-criterion: ${result.name} (ID: ${result.id}) for criterion ${create_sub_criterion_dto.criterion_id}`);
      
      return result;
    });
  }
  async updateSubCriterion(
    id: number,
    update_sub_criterion_dto: UpdateSubCriterionDto,
  ) {
    const subCriterion = await this.findOneSubCriterion(id);
    if (update_sub_criterion_dto.criterion_id)
      await this.findOneCriterion(update_sub_criterion_dto.criterion_id);
    this.subCriterionRepo.merge(subCriterion, update_sub_criterion_dto);
    return this.subCriterionRepo.save(subCriterion);
  }
  async updateSubCriterionState(id: number, update_state_dto: UpdateStateDto) {
    const subCriterion = await this.findOneSubCriterion(id);
    const oldState = subCriterion.state;
    subCriterion.state = update_state_dto.state;
    const result = await this.subCriterionRepo.save(subCriterion);
    
    this.logger.log(`SubCriterion ${id} state changed from ${oldState} to ${update_state_dto.state}`);
    
    return result;
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
  async createMetric(create_metric_dto: CreateMetricDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneSubCriterion(create_metric_dto.sub_criterion_id);
      const newMetric = manager.create(Metric, create_metric_dto);
      const result = await manager.save(newMetric);
      
      this.logger.log(`Created new metric: ${result.name} (ID: ${result.id}) for sub-criterion ${create_metric_dto.sub_criterion_id}`);
      
      return result;
    });
  }
  async updateMetric(id: number, update_metric_dto: UpdateMetricDto) {
    const metric = await this.findOneMetric(id);
    if (update_metric_dto.sub_criterion_id)
      await this.findOneSubCriterion(update_metric_dto.sub_criterion_id);
    this.metricRepo.merge(metric, update_metric_dto);
    return this.metricRepo.save(metric);
  }
  async updateMetricState(id: number, update_state_dto: UpdateStateDto) {
    const metric = await this.findOneMetric(id);
    const oldState = metric.state;
    metric.state = update_state_dto.state;
    const result = await this.metricRepo.save(metric);
    
    this.logger.log(`Metric ${id} state changed from ${oldState} to ${update_state_dto.state}`);
    
    return result;
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
  async createVariable(create_variable_dto: CreateFormulaVariableDto) {
    return this.dataSource.transaction(async manager => {
      await this.findOneMetric(create_variable_dto.metric_id);
      const newVariable = manager.create(FormulaVariable, create_variable_dto);
      const result = await manager.save(newVariable);
      
      this.logger.log(`Created new formula variable: ${result.symbol} (ID: ${result.id}) for metric ${create_variable_dto.metric_id}`);
      
      return result;
    });
  }
  async updateVariable(id: number, update_variable_dto: UpdateFormulaVariableDto) {
    const variable = await this.findOneVariable(id);
    if (update_variable_dto.metric_id)
      await this.findOneMetric(update_variable_dto.metric_id);
    this.variableRepo.merge(variable, update_variable_dto);
    return this.variableRepo.save(variable);
  }
  async updateVariableState(id: number, update_state_dto: UpdateStateDto) {
    const variable = await this.findOneVariable(id);
    const oldState = variable.state;
    
    variable.state = update_state_dto.state;
    const result = await this.variableRepo.save(variable);
    
    this.logger.log(`FormulaVariable ${id} state changed from ${oldState} to ${update_state_dto.state}`);
    
    return result;
  }
}