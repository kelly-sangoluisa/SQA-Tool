import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { EntryDataService } from '../services/entry-data.service';
import { ROLES } from '../../../common/decorators/roles.decorator';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';

@ApiTags('Entry Data')
@ApiBearerAuth('bearer')
@Controller('entry-data')
export class EntryDataController {
  constructor(private readonly service: EntryDataService) {}

  // --- ENDPOINTS PARA EL FLUJO DEL FRONTEND ---

  /**
   * POST /entry-data/metrics/:metricId/variables
   * Guardar variables mientras el usuario evalúa
   */
  @Post('metrics/:metricId/variables')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Guardar variables de una métrica durante la evaluación',
    description: 'Permite al usuario guardar temporalmente los valores de las variables de una métrica específica'
  })
  @ApiResponse({ status: 201, description: 'Variables guardadas exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Métrica de evaluación no encontrada.' })
  saveMetricVariables(
    @Param('metricId', ParseIntPipe) metricId: number,
    @Body() dto: { variables: { variable_id: number; value: number }[] }
  ) {
    return this.service.saveMetricVariables(metricId, dto.variables);
  }

  /**
   * POST /entry-data/evaluations/:evaluationId/finalize
   * Calcular y guardar TODO cuando el usuario termina la evaluación
   */
  @Post('evaluations/:evaluationId/finalize')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Finalizar evaluación y calcular todos los resultados',
    description: 'Calcula todas las fórmulas, métricas y criterios. Cambia estados de evaluación y proyecto si es necesario.'
  })
  @ApiResponse({ status: 201, description: 'Evaluación finalizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en cálculos o datos faltantes.' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada.' })
  finalizeEvaluation(@Param('evaluationId', ParseIntPipe) evaluationId: number) {
    return this.service.finalizeEvaluation(evaluationId);
  }

  /**
   * GET /entry-data/evaluations/:evaluationId/progress
   * Ver progreso de una evaluación
   */
  @Get('evaluations/:evaluationId/progress')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener progreso de una evaluación',
    description: 'Muestra cuántas métricas han sido completadas y el porcentaje de progreso'
  })
  @ApiResponse({ status: 200, description: 'Progreso obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada.' })
  getEvaluationProgress(@Param('evaluationId', ParseIntPipe) evaluationId: number) {
    return this.service.getEvaluationProgress(evaluationId);
  }

  /**
   * GET /entry-data/evaluations/:evaluationId/summary
   * Resumen antes de finalizar evaluación
   */
  @Get('evaluations/:evaluationId/summary')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resumen de una evaluación antes de finalizar',
    description: 'Muestra todos los datos ingresados organizados por criterios para revisión final'
  })
  @ApiResponse({ status: 200, description: 'Resumen obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada.' })
  getEvaluationSummary(@Param('evaluationId', ParseIntPipe) evaluationId: number) {
    return this.service.getEvaluationSummary(evaluationId);
  }

  // --- ENDPOINTS PARA REPORTS (POR PROYECTO) ---

  /**
   * GET /entry-data/projects/:projectId/evaluation-results
   * Obtener resultados de evaluaciones de un proyecto específico
   */
  @Get('projects/:projectId/evaluation-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultados de evaluaciones de un proyecto',
    description: 'Retorna todos los resultados de las evaluaciones de un proyecto para reportes'
  })
  @ApiResponse({ status: 200, description: 'Resultados obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  findEvaluationResultsByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findEvaluationResultsByProject(projectId);
  }

  /**
   * GET /entry-data/projects/:projectId/criteria-results
   * Obtener resultados de criterios de un proyecto específico
   */
  @Get('projects/:projectId/criteria-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultados de criterios de un proyecto',
    description: 'Retorna todos los resultados de criterios de un proyecto para reportes'
  })
  @ApiResponse({ status: 200, description: 'Resultados obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  findCriteriaResultsByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findCriteriaResultsByProject(projectId);
  }

  /**
   * GET /entry-data/projects/:projectId/metric-results
   * Obtener resultados de métricas de un proyecto específico
   */
  @Get('projects/:projectId/metric-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultados de métricas de un proyecto',
    description: 'Retorna todos los resultados de métricas de un proyecto para reportes'
  })
  @ApiResponse({ status: 200, description: 'Resultados obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  findMetricResultsByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findMetricResultsByProject(projectId);
  }

  /**
   * GET /entry-data/projects/:projectId/evaluation-variables
   * Obtener variables evaluadas de un proyecto específico
   */
  @Get('projects/:projectId/evaluation-variables')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener variables evaluadas de un proyecto',
    description: 'Retorna todas las variables con sus valores de un proyecto para reportes'
  })
  @ApiResponse({ status: 200, description: 'Variables obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  findEvaluationVariablesByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findEvaluationVariablesByProject(projectId);
  }

  /**
   * GET /entry-data/projects/:projectId/project-result
   * Obtener resultado final de un proyecto específico
   */
  @Get('projects/:projectId/project-result')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultado final de un proyecto',
    description: 'Retorna el resultado consolidado final del proyecto'
  })
  @ApiResponse({ status: 200, description: 'Resultado obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto o resultado no encontrado.' })
  findProjectResult(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findProjectResult(projectId);
  }

  /**
   * GET /entry-data/projects/:projectId/complete-report
   * Obtener reporte completo de un proyecto (todas las 5 tablas)
   */
  @Get('projects/:projectId/complete-report')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener reporte completo de un proyecto',
    description: 'Retorna todas las tablas de resultados y estadísticas del proyecto en una sola respuesta'
  })
  @ApiResponse({ status: 200, description: 'Reporte completo obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  getProjectCompleteReport(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.getProjectCompleteReport(projectId);
  }
}