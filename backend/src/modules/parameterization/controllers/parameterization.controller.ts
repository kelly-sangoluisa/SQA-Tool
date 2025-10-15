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

@ApiTags('⚙️ Parameterization (Admin)')
@ApiBearerAuth('bearer')
@ROLES('admin')
@Controller('parameterization')
export class ParameterizationController {
  constructor(private readonly service: ParameterizationService) {}

  // --- Standards Endpoints ---
  @Post('standards')
  @ApiOperation({ summary: 'Crear un nuevo estándar de calidad' })
  @ApiResponse({ status: 201, description: 'Estándar creado exitosamente.' })
  createStandard(@Body() createStandardDto: CreateStandardDto) {
    return this.service.createStandard(createStandardDto);
  }

  @Get('standards')
  @ApiOperation({ summary: 'Obtener todos los estándares de calidad' })
  findAllStandards() {
    return this.service.findAllStandards();
  }

  @Get('standards/:id')
  @ApiOperation({ summary: 'Obtener un estándar por su ID' })
  findOneStandard(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStandard(id);
  }

  @Patch('standards/:id')
  @ApiOperation({ summary: 'Actualizar un estándar existente' })
  updateStandard(@Param('id', ParseIntPipe) id: number, @Body() updateStandardDto: UpdateStandardDto) {
    return this.service.updateStandard(id, updateStandardDto);
  }

  @Delete('standards/:id')
  @ApiOperation({ summary: 'Eliminar un estándar' })
  @HttpCode(HttpStatus.OK)
  removeStandard(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStandard(id);
  }

  // --- Criteria Endpoints (anidados y directos) ---
  @Post('criteria')
  @ApiOperation({ summary: 'Crear un nuevo criterio' })
  createCriterion(@Body() createCriterionDto: CreateCriterionDto) {
    return this.service.createCriterion(createCriterionDto);
  }
  
  @Get('standards/:standard_id/criteria')
  @ApiOperation({ summary: 'Obtener todos los criterios para un estándar específico' })
  findAllCriteriaForStandard(@Param('standard_id', ParseIntPipe) standard_id: number) {
    return this.service.findAllCriteria(standard_id);
  }

  @Get('criteria/:id')
  @ApiOperation({ summary: 'Obtener un criterio por su ID' })
  findOneCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneCriterion(id);
  }

  @Patch('criteria/:id')
  @ApiOperation({ summary: 'Actualizar un criterio existente' })
  updateCriterion(@Param('id', ParseIntPipe) id: number, @Body() updateCriterionDto: UpdateCriterionDto) {
    return this.service.updateCriterion(id, updateCriterionDto);
  }
  
  @Delete('criteria/:id')
  @ApiOperation({ summary: 'Eliminar un criterio' })
  @HttpCode(HttpStatus.OK)
  removeCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeCriterion(id);
  }
  
  // --- Sub-criteria, Metrics, and Variables seguirían un patrón similar ---
  // A continuación se implementan para ser completos.
  
  // --- SubCriteria Endpoints ---
  @Post('sub-criteria')
  @ApiOperation({ summary: 'Crear un nuevo sub-criterio' })
  createSubCriterion(@Body() createSubCriterionDto: CreateSubCriterionDto) {
    return this.service.createSubCriterion(createSubCriterionDto);
  }

  @Get('criteria/:criterionId/sub-criteria')
  @ApiOperation({ summary: 'Obtener todos los sub-criterios para un criterio específico' })
  findAllSubCriteriaForCriterion(@Param('criterionId', ParseIntPipe) criterion_id: number) {
    return this.service.findAllSubCriteria(criterion_id);
  }

  @Get('sub-criteria/:id')
  @ApiOperation({ summary: 'Obtener un sub-criterio por ID' })
  findOneSubCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneSubCriterion(id);
  }
  
  @Patch('sub-criteria/:id')
  @ApiOperation({ summary: 'Actualizar un sub-criterio' })
  updateSubCriterion(@Param('id', ParseIntPipe) id: number, @Body() updateSubCriterionDto: UpdateSubCriterionDto) {
    return this.service.updateSubCriterion(id, updateSubCriterionDto);
  }
  
  @Delete('sub-criteria/:id')
  @ApiOperation({ summary: 'Eliminar un sub-criterio' })
  @HttpCode(HttpStatus.OK)
  removeSubCriterion(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeSubCriterion(id);
  }
  
  // --- Metrics Endpoints ---
  @Post('metrics')
  @ApiOperation({ summary: 'Crear una nueva métrica' })
  createMetric(@Body() createMetricDto: CreateMetricDto) {
    return this.service.createMetric(createMetricDto);
  }

  @Get('sub-criteria/:subCriterionId/metrics')
  @ApiOperation({ summary: 'Obtener todas las métricas para un sub-criterio' })
  findAllMetricsForSubCriterion(@Param('subCriterionId', ParseIntPipe) sub_criterion_id: number) {
    return this.service.findAllMetrics(sub_criterion_id);
  }
  
  @Get('metrics/:id')
  @ApiOperation({ summary: 'Obtener una métrica por ID' })
  findOneMetric(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneMetric(id);
  }
  
  @Patch('metrics/:id')
  @ApiOperation({ summary: 'Actualizar una métrica' })
  updateMetric(@Param('id', ParseIntPipe) id: number, @Body() updateMetricDto: UpdateMetricDto) {
    return this.service.updateMetric(id, updateMetricDto);
  }
  
  @Delete('metrics/:id')
  @ApiOperation({ summary: 'Eliminar una métrica' })
  @HttpCode(HttpStatus.OK)
  removeMetric(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeMetric(id);
  }
  
  // --- Formula Variables Endpoints ---
  @Post('variables')
  @ApiOperation({ summary: 'Crear una nueva variable de fórmula' })
  createVariable(@Body() createDto: CreateFormulaVariableDto) {
    return this.service.createVariable(createDto);
  }
  
  @Get('metrics/:metricId/variables')
  @ApiOperation({ summary: 'Obtener todas las variables para una métrica' })
  findAllVariablesForMetric(@Param('metricId', ParseIntPipe) metric_id: number) {
    return this.service.findAllVariables(metric_id);
  }
  
  @Get('variables/:id')
  @ApiOperation({ summary: 'Obtener una variable por ID' })
  findOneVariable(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneVariable(id);
  }
  
  @Patch('variables/:id')
  @ApiOperation({ summary: 'Actualizar una variable' })
  updateVariable(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateFormulaVariableDto) {
    return this.service.updateVariable(id, updateDto);
  }
  
  @Delete('variables/:id')
  @ApiOperation({ summary: 'Eliminar una variable' })
  @HttpCode(HttpStatus.OK)
  removeVariable(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeVariable(id);
  }
}