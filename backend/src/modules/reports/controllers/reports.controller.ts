import { Controller, Get, Param, ParseIntPipe, HttpStatus, Logger, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ROLES } from '../../../common/decorators/roles.decorator';
import { ReportsService } from '../services/reports.service';
import { 
  EvaluationReportDto, 
  EvaluationListItemDto,
  EvaluationStatsDto
} from '../dto/evaluation-report.dto';

@ApiTags('Reports - Visualización de Resultados')
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);
  
  constructor(private readonly reportsService: ReportsService) {}

  @Get('my-evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({
    summary: 'Listar mis evaluaciones',
    description: 'Obtiene las evaluaciones de los proyectos creados por el usuario actual'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de evaluaciones del usuario obtenida exitosamente',
    type: [EvaluationListItemDto]
  })
  async getMyEvaluations(@Request() req): Promise<EvaluationListItemDto[]> {
    this.logger.log(`🎯 Controller: getMyEvaluations llamado`);
    this.logger.log(`🎯 Controller: req.currentUser = ${JSON.stringify(req.currentUser)}`);
    const userId = req.currentUser?.id; // La propiedad es 'id' no 'user_id'
    if (!userId) {
      this.logger.error('❌ No se pudo obtener user_id del currentUser');
      throw new Error('User ID not found');
    }
    this.logger.log(`🎯 Controller: getMyEvaluations para usuario ${userId}`);
    const result = await this.reportsService.getEvaluationsByUserId(userId);
    this.logger.log(`🎯 Controller: Devolviendo ${result.length} evaluaciones del usuario`);
    return result;
  }

  @Get('evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({
    summary: 'Listar todas las evaluaciones',
    description: 'Obtiene una lista de todas las evaluaciones con información básica y sus resultados'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de evaluaciones obtenida exitosamente',
    type: [EvaluationListItemDto]
  })
  async getAllEvaluations(): Promise<EvaluationListItemDto[]> {
    this.logger.log('🎯 Controller: getAllEvaluations llamado');
    const result = await this.reportsService.getAllEvaluations();
    this.logger.log(`🎯 Controller: Devolviendo ${result.length} evaluaciones al cliente`);
    this.logger.log(`🎯 Controller: Primer elemento: ${JSON.stringify(result[0])}`);
    return result;
  }

  @Get('projects/:projectId/evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({
    summary: 'Listar evaluaciones por proyecto',
    description: 'Obtiene todas las evaluaciones asociadas a un proyecto específico'
  })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Evaluaciones del proyecto obtenidas exitosamente',
    type: [EvaluationListItemDto]
  })
  async getEvaluationsByProject(
    @Param('projectId', ParseIntPipe) projectId: number
  ): Promise<EvaluationListItemDto[]> {
    return await this.reportsService.getEvaluationsByProject(projectId);
  }

  @Get('evaluations/:evaluationId')
  @ROLES('admin', 'evaluator')
  @ApiOperation({
    summary: 'Obtener reporte completo de evaluación',
    description: 'Obtiene el reporte detallado de una evaluación incluyendo todos los criterios, métricas y resultados'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte de evaluación obtenido exitosamente',
    type: EvaluationReportDto
  })
  async getEvaluationReport(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ): Promise<EvaluationReportDto> {
    return await this.reportsService.getEvaluationReport(evaluationId);
  }

  @Get('evaluations/:evaluationId/stats')
  @ROLES('admin', 'evaluator')
  @ApiOperation({
    summary: 'Obtener estadísticas de evaluación',
    description: 'Obtiene estadísticas analíticas de una evaluación (promedios, mejores/peores criterios, etc.)'
  })
  @ApiParam({ name: 'evaluationId', description: 'ID de la evaluación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
    type: EvaluationStatsDto
  })
  async getEvaluationStats(
    @Param('evaluationId', ParseIntPipe) evaluationId: number
  ): Promise<EvaluationStatsDto> {
    return await this.reportsService.getEvaluationStats(evaluationId);
  }
}
