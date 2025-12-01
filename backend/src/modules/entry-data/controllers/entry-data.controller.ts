import {Controller,Post,Get,Delete,Body,Param,ParseIntPipe,Query, HttpStatus, } from '@nestjs/common';
import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,ApiParam,ApiQuery,} from '@nestjs/swagger';
import { ROLES } from '../../../common/decorators/roles.decorator';

// DTOs
import { CreateEvaluationVariableDto } from '../dto/evaluation-variable.dto';

// Services
import { EntryDataService } from '../services/entry-data.service';

@ApiTags('Entry Data - Procesamiento de Datos de Evaluación')
@Controller('entry-data')
@ApiBearerAuth()
export class EntryDataController {
  constructor(private readonly entryDataService: EntryDataService) {}

  // ==========================================================================
  // POST ENDPOINTS - FLUJO PRINCIPAL
  // ==========================================================================

  @Post('evaluations/:evaluationId/submit-data')
    @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Enviar datos de evaluación (Botón "Siguiente")',
    description: 'Guarda datos de variables en memoria del servidor. NO calcula resultados finales.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Datos guardados exitosamente',
    schema: {
      example: {
        message: 'Evaluation data processed successfully',
        variables_saved: 5,
        evaluation_id: 1
      }
    }
  })
  async submitEvaluationData(
    @Param('evaluationId', ParseIntPipe) evaluationId: number,
    @Body() data: {
      evaluation_variables: CreateEvaluationVariableDto[]
    }
  ) {
    const result = await this.entryDataService.receiveEvaluationData(evaluationId, data);
    
    return {
      ...result,
      evaluation_id: evaluationId,
      timestamp: new Date().toISOString()
    };
  }

  @Post('evaluations/:evaluationId/finalize')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: ' Finalizar evaluación individual (Botón "Terminar Evaluación")',
    description: 'Calcula todos los resultados de la evaluación: métricas → criterios → evaluación final.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Evaluación finalizada exitosamente',
    schema: {
      example: {
        message: 'Evaluation finalized successfully',
        evaluation_id: 1,
        metric_results: 8,
        criteria_results: 3,
        final_score: 85.67,
        finalized_at: '2024-01-15T10:30:00Z'
      }
    }
  })
  async finalizeEvaluation(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    return await this.entryDataService.finalizeEvaluation(evaluationId);
  }

  @Post('projects/:projectId/finalize')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Finalizar proyecto completo (Automatico ultima evaluación)',
    description: 'Calcula el resultado final del proyecto basado en todas las evaluaciones completadas.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Proyecto finalizado exitosamente',
    schema: {
      example: {
        message: 'Project finalized successfully',
        project_id: 1,
        final_score: 88.23,
        finalized_at: '2024-01-15T10:35:00Z'
      }
    }
  })
  async finalizeProject(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return await this.entryDataService.finalizeProject(projectId);
  }

  // ==========================================================================
  // GET ENDPOINTS - CONSULTA DE RESULTADOS COMPLETOS
  // ==========================================================================

  @Get('evaluations/:evaluationId/complete-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resumen completo de evaluación',
    description: 'Retorna todas las tablas de resultados de una evaluación específica.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Resumen completo de la evaluación',
    schema: {
      example: {
        evaluation_id: 1,
        variables: { count: 12, data: [] },
        metric_results: { count: 8, data: [] },
        final_result: { evaluation_score: 85.67 },
        status: 'completed'
      }
    }
  })
  async getEvaluationCompleteResults(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    return await this.entryDataService.getEvaluationSummary(evaluationId);
  }

  @Get('projects/:projectId/complete-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultados completos del proyecto',
    description: 'Retorna todas las tablas de resultados de todas las evaluaciones del proyecto.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Resultados completos del proyecto'
  })
  async getProjectCompleteResults(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    // Implementar método en el servicio
    return await this.entryDataService.getProjectCompleteResults(projectId);
  }

  // ==========================================================================
  // GET ENDPOINTS - CONSULTAS INDIVIDUALES POR EVALUACIÓN
  // ==========================================================================

  @Get('evaluations/:evaluationId/evaluation-variables')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener variables de evaluación',
    description: 'Variables capturadas del frontend para una evaluación específica.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  async getEvaluationVariables(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    const variables = await this.entryDataService.getEvaluationVariables(evaluationId);
    
    return {
      evaluation_id: evaluationId,
      count: variables.length,
      variables: variables
    };
  }

  @Get('evaluations/:evaluationId/metric-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultados de métricas',
    description: 'Resultados calculados de todas las métricas de una evaluación.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  async getEvaluationMetricResults(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    const results = await this.entryDataService.getMetricResults(evaluationId);
    
    return {
      evaluation_id: evaluationId,
      count: results.length,
      metric_results: results
    };
  }

  @Get('evaluations/:evaluationId/criteria-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultados de criterios',
    description: 'Resultados calculados de todos los criterios de una evaluación.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  async getEvaluationCriteriaResults(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    const results = await this.entryDataService.getCriteriaResults(evaluationId);
    
    return {
      evaluation_id: evaluationId,
      count: results.length,
      criteria_results: results
    };
  }

  @Get('evaluations/:evaluationId/evaluation-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultado final de evaluación',
    description: 'Resultado final calculado de la evaluación.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  async getEvaluationResult(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    const result = await this.entryDataService.getEvaluationResult(evaluationId);
    
    return {
      evaluation_id: evaluationId,
      result: result
    };
  }

  // ==========================================================================
  // GET ENDPOINTS - CONSULTAS INDIVIDUALES POR PROYECTO
  // ==========================================================================

  @Get('projects/:projectId/project-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener resultado final del proyecto',
    description: 'Resultado final calculado del proyecto completo.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  async getProjectResult(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    const result = await this.entryDataService.getProjectResult(projectId);
    
    return {
      project_id: projectId,
      result: result
    };
  }

  @Get('projects/:projectId/evaluation-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener todos los resultados de evaluaciones del proyecto',
    description: 'Todos los resultados finales de las evaluaciones que pertenecen al proyecto.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  async getProjectEvaluationResults(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    const results = await this.entryDataService.getProjectEvaluationResults(projectId);
    
    return {
      project_id: projectId,
      count: results.length,
      evaluation_results: results
    };
  }

  @Get('projects/:projectId/criteria-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener todos los resultados de criterios del proyecto',
    description: 'Todos los resultados de criterios de todas las evaluaciones del proyecto.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  async getProjectCriteriaResults(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    const results = await this.entryDataService.getProjectCriteriaResults(projectId);
    
    return {
      project_id: projectId,
      count: results.length,
      criteria_results: results
    };
  }

  @Get('projects/:projectId/metric-results')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener todos los resultados de métricas del proyecto',
    description: 'Todos los resultados de métricas de todas las evaluaciones del proyecto.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  async getProjectMetricResults(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    const results = await this.entryDataService.getProjectMetricResults(projectId);
    
    return {
      project_id: projectId,
      count: results.length,
      metric_results: results
    };
  }

  @Get('projects/:projectId/evaluation-variables')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener todas las variables del proyecto',
    description: 'Todas las variables capturadas en todas las evaluaciones del proyecto.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  async getProjectEvaluationVariables(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    const variables = await this.entryDataService.getProjectEvaluationVariables(projectId);
    
    return {
      project_id: projectId,
      count: variables.length,
      evaluation_variables: variables
    };
  }

  // ==========================================================================
  // DELETE ENDPOINTS - UTILIDADES ADMINISTRATIVAS
  // ==========================================================================

  @Delete('evaluations/:evaluationId/reset')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Reiniciar evaluación (Posiblemente se borre)',
    description: 'Elimina todos los resultados y variables de una evaluación. Solo para administradores.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  async resetEvaluation(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    await this.entryDataService.resetEvaluation(evaluationId);
    
    return {
      message: 'Evaluation reset successfully',
      evaluation_id: evaluationId,
      timestamp: new Date().toISOString()
    };
  }

  @Delete('variables/:evalMetricId/:variableId')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Eliminar variable específica (Posiblemente se borre)',
    description: 'Elimina una variable específica de una métrica de evaluación.'
  })
  @ApiParam({ name: 'evalMetricId', description: 'ID de la métrica de evaluación', example: 1 })
  @ApiParam({ name: 'variableId', description: 'ID de la variable', example: 1 })
  async deleteVariable(
    @Param('evalMetricId', ParseIntPipe) evalMetricId: number,
    @Param('variableId', ParseIntPipe) variableId: number
  ) {
    await this.entryDataService.deleteVariable(evalMetricId, variableId);
    
    return {
      message: 'Variable deleted successfully',
      eval_metric_id: evalMetricId,
      variable_id: variableId
    };
  }

  // ==========================================================================
  // STATUS ENDPOINTS - INFORMACIÓN DE PROGRESO
  // ==========================================================================

  @Get('evaluations/:evaluationId/status')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener estado de la evaluación',
    description: 'Información del progreso y estado actual de una evaluación.'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación', example: 1 })
  async getEvaluationStatus(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ) {
    return await this.entryDataService.getEvaluationStatus(evaluationId);
  }

  @Get('projects/:projectId/progress')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ 
    summary: 'Obtener progreso del proyecto',
    description: 'Información del progreso general del proyecto y sus evaluaciones.'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto', example: 1 })
  async getProjectProgress(
    @Param('projectId', ParseIntPipe) projectId: number
  ) {
    return await this.entryDataService.getProjectProgress(projectId);
  }
}