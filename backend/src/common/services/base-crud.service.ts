import { Repository, FindOptionsWhere, ObjectLiteral, ILike } from 'typeorm';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { FindAllQueryDto } from '../../modules/parameterization/dto/find-all-query.dto';
import { UpdateStateDto } from '../../modules/parameterization/dto/update-state.dto';

/**
 * Servicio base con operaciones CRUD comunes
 */
export abstract class BaseCrudService<T extends ObjectLiteral> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityName: string,
  ) {}

  /**
   * Busca una entidad por ID o lanza excepción si no existe
   */
  protected async findOneOrFail(id: number): Promise<T> {
    if (!id || id <= 0) {
      throw new BadRequestException(`Invalid ${this.entityName} ID: ${id}`);
    }
    
    const entity = await this.repository.findOneBy({ id: id } as any);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * Construye condiciones WHERE para búsquedas con filtros
   */
  protected buildFindAllWhere<E>(
    query: FindAllQueryDto,
    searchFields: string[],
    baseWhere: FindOptionsWhere<E> = {},
  ): FindOptionsWhere<E> | FindOptionsWhere<E>[] {
    const { state, search } = query;

    const baseConditions: FindOptionsWhere<E> = { ...baseWhere };

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
      } as FindOptionsWhere<E>;
    });

    return whereClauses;
  }

  /**
   * Actualiza el estado de una entidad (para entidades que extienden BaseNamedEntity)
   */
  protected async updateEntityState(id: number, updateStateDto: UpdateStateDto): Promise<T> {
    const entity = await this.findOneOrFail(id) as any;
    const oldState = entity.state;
    entity.state = updateStateDto.state;

    const result = await this.repository.save(entity);
    
    this.logger.log(`${this.entityName} ${id} state changed from ${oldState} to ${updateStateDto.state}`);
    
    return result;
  }

  /**
   * Encuentra una entidad por ID
   */
  async findOne(id: number): Promise<T> {
    return this.findOneOrFail(id);
  }

  /**
   * Crea una nueva entidad
   */
  async create(createDto: any): Promise<T> {
    const newEntity = this.repository.create(createDto);
    const result = await this.repository.save(newEntity);
    
    this.logger.log(`Created new ${this.entityName}: ${(result as any).name || 'N/A'} (ID: ${(result as any).id})`);
    
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Actualiza una entidad existente
   */
  async update(id: number, updateDto: any): Promise<T> {
    const entity = await this.findOneOrFail(id);
    this.repository.merge(entity, updateDto);
    const result = await this.repository.save(entity);
    return Array.isArray(result) ? result[0] : result;
  }
}