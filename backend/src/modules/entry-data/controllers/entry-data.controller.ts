import {Controller,Post,Get,Body,Param,ParseIntPipe, HttpStatus, } from '@nestjs/common';
import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,ApiParam,} from '@nestjs/swagger';
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
        score_level: 'target_range',
        satisfaction_grade: 'satisfactory',
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