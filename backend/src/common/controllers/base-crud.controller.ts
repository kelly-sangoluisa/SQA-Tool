import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ROLES } from '../decorators/roles.decorator';
import { FindAllQueryDto } from '../../modules/parameterization/dto/find-all-query.dto';
import { UpdateStateDto } from '../../modules/parameterization/dto/update-state.dto';

/**
 * Controlador base con operaciones CRUD comunes
 */
export abstract class BaseCrudController<Service, CreateDto, UpdateDto> {
  constructor(
    protected readonly service: Service,
    protected readonly entityName: string,
  ) {}

  /**
   * Crear una nueva entidad
   */
  @Post()
  @ROLES('admin')
  @ApiOperation({ summary: `Crear una nueva entidad` })
  @ApiResponse({ status: 201, description: `Entidad creada exitosamente.` })
  create(@Body() createDto: CreateDto) {
    return (this.service as any).create(createDto);
  }

  /**
   * Obtener una entidad por ID
   */
  @Get(':id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: `Obtener una entidad por su ID` })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return (this.service as any).findOne(id);
  }

  /**
   * Actualizar una entidad existente
   */
  @Patch(':id')
  @ROLES('admin')
  @ApiOperation({ summary: `Actualizar una entidad existente` })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateDto) {
    return (this.service as any).update(id, updateDto);
  }

  /**
   * Activar o inactivar una entidad
   */
  @Patch(':id/state')
  @ROLES('admin')
  @ApiOperation({ summary: `Activar o inactivar una entidad` })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  updateState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return (this.service as any).updateState(id, updateStateDto);
  }
}