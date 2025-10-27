import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ROLES } from '../../../common/decorators/roles.decorator';
import { ParameterizationService } from '../services/parameterization.service';

// DTOs
import { CreateStandardDto, UpdateStandardDto } from '../dto/standard.dto';
import { CreateCriterionDto, UpdateCriterionDto } from '../dto/criterion.dto';
import { CreateSubCriterionDto, UpdateSubCriterionDto } from '../dto/sub-criterion.dto';
import { CreateMetricDto, UpdateMetricDto } from '../dto/metric.dto';
import { CreateFormulaVariableDto, UpdateFormulaVariableDto } from '../dto/formula-variable.dto';

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
  @ApiOperation({ summary: 'Obtener todos los estándares de calidad' })
  findAllStandards() {
    return this.service.findAllStandards();
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

  @Delete('standards/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Eliminar un estándar' })
  @HttpCode(HttpStatus.OK)
  removeStandard(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStandard(id);
  }

  // --- Criteria Endpoints (anidados y directos) ---
  @Post('criteria')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear un nuevo criterio' })
  @ApiResponse({ status: 201, description: 'Criterio creado exitosamente.' })
  createCriterion(@Body() createCriterionDto: CreateCriterionDto) {
    return this.service.createCriterion(createCriterionDto);
  }
  
  @Get('standards/:standard_id/criteria')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todos los criterios para un estándar específico' })
  @ApiResponse({ status: 200, description: 'Lista de criterios obtenida exitosamente.' })
  findAllCriteriaForStandard(@Param('standard_id', ParseIntPipe) standard_id: number) {
    return this.service.findAllCriteria(standard_id);
  }

  @Get('criteria/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener un criterio por su ID' })
  @ApiResponse({ status: 200, description: 'Criterio obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Criterio no encontrado.' })
  findOneCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneCriterion(id);
  }

  @Patch('criteria/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar un criterio existente' })
  @ApiResponse({ status: 200, description: 'Criterio actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Criterio no encontrado.' })
  updateCriterion(@Param('id', ParseIntPipe) id: number, @Body() updateCriterionDto: UpdateCriterionDto) {
    return this.service.updateCriterion(id, updateCriterionDto);
  }
  
  @Delete('criteria/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Eliminar un criterio' })
  @ApiResponse({ status: 200, description: 'Criterio eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Criterio no encontrado.' })
  @HttpCode(HttpStatus.OK)
  removeCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeCriterion(id);
  }
  
  // --- Sub-criteria, Metrics, and Variables seguirían un patrón similar ---
  // A continuación se implementan para ser completos.
  
  // --- SubCriteria Endpoints ---
  @Post('sub-criteria')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear un nuevo sub-criterio' })
  @ApiResponse({ status: 201, description: 'Sub-criterio creado exitosamente.' })
  createSubCriterion(@Body() createSubCriterionDto: CreateSubCriterionDto) {
    return this.service.createSubCriterion(createSubCriterionDto);
  }

  @Get('criteria/:criterionId/sub-criteria')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todos los sub-criterios para un criterio específico' })
  @ApiResponse({ status: 200, description: 'Lista de sub-criterios obtenida exitosamente.' })
  findAllSubCriteriaForCriterion(@Param('criterionId', ParseIntPipe) criterion_id: number) {
    return this.service.findAllSubCriteria(criterion_id);
  }

  @Get('sub-criteria/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener un sub-criterio por ID' })
  @ApiResponse({ status: 200, description: 'Sub-criterio obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sub-criterio no encontrado.' })
  findOneSubCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSubCriterion(id);
  }
  
  @Patch('sub-criteria/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar un sub-criterio' })
  @ApiResponse({ status: 200, description: 'Sub-criterio actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sub-criterio no encontrado.' })
  updateSubCriterion(@Param('id', ParseIntPipe) id: number, @Body() updateSubCriterionDto: UpdateSubCriterionDto) {
    return this.service.updateSubCriterion(id, updateSubCriterionDto);
  }
  
  @Delete('sub-criteria/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Eliminar un sub-criterio' })
  @ApiResponse({ status: 200, description: 'Sub-criterio eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sub-criterio no encontrado.' })
  @HttpCode(HttpStatus.OK)
  removeSubCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSubCriterion(id);
  }
  
  // --- Metrics Endpoints ---
  @Post('metrics')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear una nueva métrica' })
  @ApiResponse({ status: 201, description: 'Métrica creada exitosamente.' })
  createMetric(@Body() createMetricDto: CreateMetricDto) {
    return this.service.createMetric(createMetricDto);
  }

  @Get('sub-criteria/:subCriterionId/metrics')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todas las métricas para un sub-criterio' })
  @ApiResponse({ status: 200, description: 'Lista de métricas obtenida exitosamente.' })
  findAllMetricsForSubCriterion(@Param('subCriterionId', ParseIntPipe) sub_criterion_id: number) {
    return this.service.findAllMetrics(sub_criterion_id);
  }
  
  @Get('metrics/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener una métrica por ID' })
  @ApiResponse({ status: 200, description: 'Métrica obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Métrica no encontrada.' })
  findOneMetric(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneMetric(id);
  }
  
  @Patch('metrics/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar una métrica' })
  @ApiResponse({ status: 200, description: 'Métrica actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Métrica no encontrada.' })
  updateMetric(@Param('id', ParseIntPipe) id: number, @Body() updateMetricDto: UpdateMetricDto) {
    return this.service.updateMetric(id, updateMetricDto);
  }
  
  @Delete('metrics/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Eliminar una métrica' })
  @ApiResponse({ status: 200, description: 'Métrica eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Métrica no encontrada.' })
  @HttpCode(HttpStatus.OK)
  removeMetric(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeMetric(id);
  }
  
  // --- Formula Variables Endpoints ---
  @Post('variables')
  @ROLES('admin')
  @ApiOperation({ summary: 'Crear una nueva variable de fórmula' })
  @ApiResponse({ status: 201, description: 'Variable creada exitosamente.' })
  createVariable(@Body() createDto: CreateFormulaVariableDto) {
    return this.service.createVariable(createDto);
  }
  
  @Get('metrics/:metricId/variables')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todas las variables para una métrica' })
  @ApiResponse({ status: 200, description: 'Lista de variables obtenida exitosamente.' })
  findAllVariablesForMetric(@Param('metricId', ParseIntPipe) metric_id: number) {
    return this.service.findAllVariables(metric_id);
  }
  
  @Get('variables/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener una variable por ID' })
  @ApiResponse({ status: 200, description: 'Variable obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Variable no encontrada.' })
  findOneVariable(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneVariable(id);
  }
  
  @Patch('variables/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Actualizar una variable' })
  @ApiResponse({ status: 200, description: 'Variable actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Variable no encontrada.' })
  updateVariable(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateFormulaVariableDto) {
    return this.service.updateVariable(id, updateDto);
  }
  
  @Delete('variables/:id')
  @ROLES('admin')
  @ApiOperation({ summary: 'Eliminar una variable' })
  @ApiResponse({ status: 200, description: 'Variable eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Variable no encontrada.' })
  @HttpCode(HttpStatus.OK)
  removeVariable(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeVariable(id);
  }
}