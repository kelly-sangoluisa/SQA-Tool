import {
  Controller, Get, Post, Body, Patch, Param,
  ParseIntPipe, Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ROLES } from '../../../common/decorators/roles.decorator';
import { ParameterizationService } from '../services/parameterization.service';

// DTOs
import { CreateStandardDto, UpdateStandardDto } from '../dto/standard.dto';
import { CreateCriterionDto, UpdateCriterionDto } from '../dto/criterion.dto';
import { CreateSubCriterionDto, UpdateSubCriterionDto } from '../dto/sub-criterion.dto';
import { CreateMetricDto, UpdateMetricDto } from '../dto/metric.dto';
import { CreateFormulaVariableDto, UpdateFormulaVariableDto } from '../dto/formula-variable.dto';
import { UpdateStateDto } from '../dto/update-state.dto'; 
import { FindAllQueryDto } from '../dto/find-all-query.dto'; 
import { SearchQueryDto } from '../dto/search.dto'; 

@ApiTags('Parameterization')
@ApiBearerAuth('bearer')
@Controller('parameterization')
export class ParameterizationController {
  constructor(private readonly service: ParameterizationService) {}

  // --- Standards Endpoints ---
  @Post('standards')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear un nuevo estándar de calidad' })
  @ApiResponse({ status: 201, description: 'Estándar creado exitosamente.' })
  createStandard(@Body() createStandardDto: CreateStandardDto) {
    return this.service.createStandard(createStandardDto);
  }

  @Get('standards')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todos los estándares de calidad (con filtro de estado)' })
  findAllStandards(@Query() query: FindAllQueryDto) { 
    return this.service.findAllStandards(query);
  }

  @Get('standards/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener un estándar por su ID' })
  findOneStandard(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStandard(id);
  }

  @Patch('standards/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar un estándar existente' })
  updateStandard(@Param('id', ParseIntPipe) id: number, @Body() updateStandardDto: UpdateStandardDto) {
    return this.service.updateStandard(id, updateStandardDto);
  }

  @Patch('standards/:id/state') 
  @ROLES('admin')
  @ApiOperation({ summary: 'Activar o inactivar un estándar (causa cascada)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  updateStandardState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.service.updateStandardState(id, updateStateDto);
  }

  // --- Criteria Endpoints ---
  @Post('criteria')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear un nuevo criterio' })
  createCriterion(@Body() createCriterionDto: CreateCriterionDto) {
    return this.service.createCriterion(createCriterionDto);
  }

  @Get('standards/:standard_id/criteria')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener criterios de un estándar (con filtro de estado)' })
  findAllCriteriaForStandard(
    @Param('standard_id', ParseIntPipe) standard_id: number,
    @Query() query: FindAllQueryDto, 
  ) {
    return this.service.findAllCriteria(query, standard_id);
  }

  @Get('criteria/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener un criterio por su ID' })
  findOneCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneCriterion(id);
  }

  @Patch('criteria/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar un criterio existente' })
  updateCriterion(@Param('id', ParseIntPipe) id: number, @Body() updateCriterionDto: UpdateCriterionDto) {
    return this.service.updateCriterion(id, updateCriterionDto);
  }

  @Patch('criteria/:id/state')
  @ROLES('admin')
  @ApiOperation({ summary: 'Activar o inactivar un criterio (causa cascada)' })
  updateCriterionState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.service.updateCriterionState(id, updateStateDto);
  }

  // --- SubCriteria Endpoints ---
  @Post('sub-criteria')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear un nuevo sub-criterio' })
  createSubCriterion(@Body() createSubCriterionDto: CreateSubCriterionDto) {
    return this.service.createSubCriterion(createSubCriterionDto);
  }

  @Get('criteria/:criterionId/sub-criteria')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener sub-criterios de un criterio (con filtro de estado)' })
  findAllSubCriteriaForCriterion(
    @Param('criterionId', ParseIntPipe) criterion_id: number,
    @Query() query: FindAllQueryDto, 
  ) {
    return this.service.findAllSubCriteria(query, criterion_id);
  }

  @Get('sub-criteria/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener un sub-criterio por ID' })
  findOneSubCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSubCriterion(id);
  }

  @Patch('sub-criteria/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar un sub-criterio' })
  updateSubCriterion(@Param('id', ParseIntPipe) id: number, @Body() updateSubCriterionDto: UpdateSubCriterionDto) {
    return this.service.updateSubCriterion(id, updateSubCriterionDto);
  }

  @Patch('sub-criteria/:id/state') 
  @ROLES('admin')
  @ApiOperation({ summary: 'Activar o inactivar un sub-criterio (causa cascada)' })
  updateSubCriterionState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.service.updateSubCriterionState(id, updateStateDto);
  }

  // --- Metrics Endpoints ---
  @Post('metrics')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear una nueva métrica' })
  createMetric(@Body() createMetricDto: CreateMetricDto) {
    return this.service.createMetric(createMetricDto);
  }

  @Get('sub-criteria/:subCriterionId/metrics')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener métricas de un sub-criterio (con filtro de estado)' })
  findAllMetricsForSubCriterion(
    @Param('subCriterionId', ParseIntPipe) sub_criterion_id: number,
    @Query() query: FindAllQueryDto,
  ) {
    return this.service.findAllMetrics(query, sub_criterion_id);
  }

  @Get('metrics/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener una métrica por ID' })
  findOneMetric(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneMetric(id);
  }

  @Patch('metrics/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar una métrica' })
  updateMetric(@Param('id', ParseIntPipe) id: number, @Body() updateMetricDto: UpdateMetricDto) {
    return this.service.updateMetric(id, updateMetricDto);
  }

  @Patch('metrics/:id/state')
  @ROLES('admin')
  @ApiOperation({ summary: 'Activar o inactivar una métrica (causa cascada)' })
  updateMetricState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.service.updateMetricState(id, updateStateDto);
  }

  // --- Formula Variables Endpoints ---
  @Post('variables')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear una nueva variable de fórmula' })
  createVariable(@Body() createDto: CreateFormulaVariableDto) {
    return this.service.createVariable(createDto);
  }

  @Get('metrics/:metricId/variables')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener variables de una métrica (con filtro de estado)' })
  findAllVariablesForMetric(
    @Param('metricId', ParseIntPipe) metric_id: number,
    @Query() query: FindAllQueryDto,
  ) {
    return this.service.findAllVariables(query, metric_id);
  }

  @Get('variables/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener una variable por ID' })
  findOneVariable(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneVariable(id);
  }

  @Patch('variables/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar una variable' })
  updateVariable(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateFormulaVariableDto) {
    return this.service.updateVariable(id, updateDto);
  }

  @Patch('variables/:id/state')
  @ROLES('admin')
  @ApiOperation({ summary: 'Activar o inactivar una variable' })
  updateVariableState(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.service.updateVariableState(id, updateStateDto);
  }

  // --- SEARCH ENDPOINTS FOR INTELLIGENT AUTOCOMPLETE ---

  @Get('search/criteria')
  @ROLES('admin')
  @ApiOperation({ 
    summary: 'Buscar criterios por nombre (para autocompletado)', 
    description: 'Retorna criterios de cualquier estándar para reutilización. Mínimo 2 caracteres.' 
  })
  @ApiResponse({ status: 200, description: 'Lista de criterios encontrados' })
  searchCriteria(@Query() query: SearchQueryDto) {
    return this.service.searchCriteria(query);
  }

  @Get('search/sub-criteria')
  @ROLES('admin')
  @ApiOperation({ 
    summary: 'Buscar subcriterios por nombre (para autocompletado)', 
    description: 'Retorna subcriterios CON sus métricas asociadas para selección inteligente. Mínimo 2 caracteres.' 
  })
  @ApiResponse({ status: 200, description: 'Lista de subcriterios con métricas' })
  searchSubCriteria(@Query() query: SearchQueryDto) {
    return this.service.searchSubCriteria(query);
  }

  @Get('search/metrics')
  @ROLES('admin')
  @ApiOperation({ 
    summary: 'Buscar métricas por nombre (para autocompletado)', 
    description: 'Retorna métricas de cualquier estándar para reutilización. Mínimo 2 caracteres.' 
  })
  @ApiResponse({ status: 200, description: 'Lista de métricas encontradas' })
  searchMetrics(@Query() query: SearchQueryDto) {
    return this.service.searchMetrics(query);
  }
}