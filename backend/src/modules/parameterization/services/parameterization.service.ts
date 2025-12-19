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
import { 
  SearchQueryDto, 
  CriterionSearchResultDto, 
  SubCriterionSearchResultDto, 
  MetricSearchResultDto 
} from '../dto/search.dto';

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
  async findAllCriteria(query: FindAllQueryDto, standard_id?: number) {
    const { state, search, page = 1, limit = 10 } = query;

    const queryBuilder = this.criterionRepo.createQueryBuilder('criterion')
      .leftJoinAndSelect('criterion.sub_criteria', 'sub_criterion', 'sub_criterion.state = :activeState', { activeState: 'active' })
      .leftJoinAndSelect('sub_criterion.metrics', 'metric', 'metric.state = :activeState')
      .leftJoinAndSelect('metric.variables', 'variable', 'variable.state = :activeState')
      .orderBy('criterion.name', 'ASC');

    // Filtrar por standard_id si se proporciona
    if (standard_id) {
      queryBuilder.andWhere('criterion.standard_id = :standard_id', { standard_id });
    }

    // Filtrar por estado del criterio
    if (state && state !== 'all') {
      queryBuilder.andWhere('criterion.state = :state', { state });
    }

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(criterion.name ILIKE :search OR criterion.description ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

    // Paginación
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
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
      
      // Crear el subcriterio
      const newSubCriterion = manager.create(SubCriterion, {
        name: createSubCriterionDto.name,
        description: createSubCriterionDto.description,
        criterion_id: createSubCriterionDto.criterion_id,
      });
      const savedSubCriterion = await manager.save(newSubCriterion);
      
      // Si se proporcionaron IDs de métricas para copiar, copiarlas con sus variables
      if (createSubCriterionDto.metric_ids_to_copy && createSubCriterionDto.metric_ids_to_copy.length > 0) {
        await this.copyMetricsToSubCriterion(
          manager,
          createSubCriterionDto.metric_ids_to_copy,
          savedSubCriterion.id
        );
        this.logger.log(`Copied ${createSubCriterionDto.metric_ids_to_copy.length} metrics to sub-criterion ${savedSubCriterion.id}`);
      }
      
      this.logger.log(`Created new sub-criterion: ${savedSubCriterion.name} (ID: ${savedSubCriterion.id}) for criterion ${createSubCriterionDto.criterion_id}`);
      
      return savedSubCriterion;
    });
  }

  /**
   * Copia múltiples métricas existentes a un subcriterio
   */
  private async copyMetricsToSubCriterion(
    manager: any,
    metricIds: number[],
    newSubCriterionId: number
  ): Promise<void> {
    // Obtener las métricas originales con sus variables
    const originalMetrics = await manager.find(Metric, {
      where: metricIds.map(id => ({ id })),
      relations: ['variables']
    });

    // Copiar cada métrica y sus variables
    for (const originalMetric of originalMetrics) {
      // Crear la nueva métrica
      const newMetric = manager.create(Metric, {
        name: originalMetric.name,
        description: originalMetric.description,
        code: originalMetric.code,
        formula: originalMetric.formula,
        desired_threshold: originalMetric.desired_threshold,
        worst_case: originalMetric.worst_case,
        sub_criterion_id: newSubCriterionId,
      });
      const savedMetric = await manager.save(newMetric);

      // Copiar las variables de la métrica si existen
      if (originalMetric.variables && originalMetric.variables.length > 0) {
        const newVariables = originalMetric.variables.map(variable =>
          manager.create(FormulaVariable, {
            symbol: variable.symbol,
            description: variable.description,
            metric_id: savedMetric.id,
          })
        );
        await manager.save(newVariables);
      }
    }
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

  async deleteVariable(id: number): Promise<void> {
    const variable = await this.findOneVariable(id);
    await this.variableRepo.remove(variable);
    this.logger.log(`Deleted formula variable with ID: ${id}`);
  }

  // --- SEARCH METHODS FOR INTELLIGENT AUTOCOMPLETE ---

  /**
   * Buscar criterios por nombre (para autocompletado)
   * Devuelve criterios de CUALQUIER estándar para reutilización
   */
  async searchCriteria(query: SearchQueryDto): Promise<CriterionSearchResultDto[]> {
    const { search } = query;
    
    if (!search || search.trim().length < 2) {
      return [];
    }

    const searchPattern = `%${search.trim()}%`;
    
    const results = await this.criterionRepo
      .createQueryBuilder('criterion')
      .leftJoinAndSelect('criterion.standard', 'standard')
      .where('criterion.name ILIKE :search', { search: searchPattern })
      .andWhere('criterion.state = :state', { state: 'active' })
      .andWhere('standard.state = :state', { state: 'active' })
      .orderBy('criterion.name', 'ASC')
      .take(10) // Limitar resultados para el autocomplete
      .getMany();

    return results.map(criterion => ({
      criterion_id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      standard_id: criterion.standard_id,
      standard_name: criterion.standard?.name || '',
    }));
  }

  /**
   * Buscar subcriterios por nombre (para autocompletado)
   * INCLUYE sus métricas asociadas CON sus variables para el caso complejo de selección
   */
  async searchSubCriteria(query: SearchQueryDto): Promise<SubCriterionSearchResultDto[]> {
    const { search } = query;
    
    if (!search || search.trim().length < 2) {
      return [];
    }

    const searchPattern = `%${search.trim()}%`;
    
    const results = await this.subCriterionRepo
      .createQueryBuilder('sub_criterion')
      .leftJoinAndSelect('sub_criterion.criterion', 'criterion')
      .leftJoinAndSelect('criterion.standard', 'standard')
      .leftJoinAndSelect('sub_criterion.metrics', 'metrics')
      .leftJoinAndSelect('metrics.variables', 'variables')
      .where('sub_criterion.name ILIKE :search', { search: searchPattern })
      .andWhere('sub_criterion.state = :state', { state: 'active' })
      .andWhere('criterion.state = :state', { state: 'active' })
      .andWhere('standard.state = :state', { state: 'active' })
      .orderBy('sub_criterion.name', 'ASC')
      .take(10)
      .getMany();

    return results.map(subCriterion => {
      const activeMetrics = subCriterion.metrics?.filter(m => m.state === 'active') || [];
      
      return {
        sub_criterion_id: subCriterion.id,
        name: subCriterion.name,
        description: subCriterion.description,
        criterion_id: subCriterion.criterion_id,
        criterion_name: subCriterion.criterion?.name || '',
        standard_id: subCriterion.criterion?.standard_id || 0,
        standard_name: subCriterion.criterion?.standard?.name || '',
        metrics: activeMetrics.map(metric => {
          const activeVariables = metric.variables?.filter(v => v.state === 'active') || [];
          
          return {
            metric_id: metric.id,
            code: metric.code,
            name: metric.name,
            description: metric.description,
            formula: metric.formula,
            desired_threshold: metric.desired_threshold,
            worst_case: metric.worst_case,
            variables: activeVariables.map(variable => ({
              variable_id: variable.id,
              symbol: variable.symbol,
              description: variable.description,
            })),
          };
        }),
        metrics_count: activeMetrics.length,
      };
    });
  }

  /**
   * Buscar métricas por nombre (para autocompletado)
   * Incluye las variables de fórmula asociadas
   */
  async searchMetrics(query: SearchQueryDto): Promise<MetricSearchResultDto[]> {
    const { search } = query;
    
    if (!search || search.trim().length < 2) {
      return [];
    }

    const searchPattern = `%${search.trim()}%`;
    
    const results = await this.metricRepo
      .createQueryBuilder('metric')
      .leftJoinAndSelect('metric.sub_criterion', 'sub_criterion')
      .leftJoinAndSelect('sub_criterion.criterion', 'criterion')
      .leftJoinAndSelect('criterion.standard', 'standard')
      .leftJoinAndSelect('metric.variables', 'variables')
      .where('metric.name ILIKE :search', { search: searchPattern })
      .andWhere('metric.state = :state', { state: 'active' })
      .andWhere('sub_criterion.state = :state', { state: 'active' })
      .andWhere('criterion.state = :state', { state: 'active' })
      .andWhere('standard.state = :state', { state: 'active' })
      .orderBy('metric.name', 'ASC')
      .take(10)
      .getMany();

    return results.map(metric => {
      const activeVariables = metric.variables?.filter(v => v.state === 'active') || [];
      
      return {
        metric_id: metric.id,
        code: metric.code,
        name: metric.name,
        description: metric.description,
        formula: metric.formula,
        desired_threshold: metric.desired_threshold,
        worst_case: metric.worst_case,
        variables: activeVariables.map(variable => ({
          variable_id: variable.id,
          symbol: variable.symbol,
          description: variable.description,
        })),
      };
    });
  }
}