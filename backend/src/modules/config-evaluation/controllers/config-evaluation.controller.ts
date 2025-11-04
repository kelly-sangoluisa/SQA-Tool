import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ROLES } from '../../../common/decorators/roles.decorator';
import { CURRENT_USER } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../users/entities/user.entity';
import { ConfigEvaluationService } from '../services/config-evaluation.service';

// DTOs
import { CreateProjectDto } from '../dto/project.dto';
import { CreateEvaluationDto } from '../dto/evaluation.dto';
import { CreateEvaluationCriterionDto, BulkCreateEvaluationCriteriaDto } from '../dto/evaluation-criterion.dto';

@ApiTags('Config Evaluation')
@ApiBearerAuth('bearer')
@Controller('config-evaluation')
export class ConfigEvaluationController {
  constructor(private readonly service: ConfigEvaluationService) {}

  /**
   * POST /config-evaluation/projects
   * Crea un nuevo proyecto
   * El ID del usuario se obtiene del token de autenticación
   */
  @Post('projects')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  createProject(
    @Body() createProjectDto: CreateProjectDto,
    @CURRENT_USER() user: User,
  ) {
    // Sobrescribir el creator_user_id con el ID del usuario autenticado
    createProjectDto.creator_user_id = user.id;
    return this.service.createProject(createProjectDto);
  }

  /**
   * POST /config-evaluation/evaluations
   * Crea una nueva evaluación
   * Debe ejecutarse después de crear el proyecto
   */
  @Post('evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Proyecto o estándar no encontrado.' })
  createEvaluation(@Body() createEvaluationDto: CreateEvaluationDto) {
    return this.service.createEvaluation(createEvaluationDto);
  }

  /**
   * POST /config-evaluation/evaluation-criteria
   * Crea un criterio de evaluación individual
   */
  @Post('evaluation-criteria')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Crear un criterio de evaluación' })
  @ApiResponse({ status: 201, description: 'Criterio de evaluación creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Evaluación o criterio no encontrado.' })
  createEvaluationCriterion(
    @Body() createDto: CreateEvaluationCriterionDto,
  ) {
    return this.service.createEvaluationCriterion(createDto);
  }

  /**
   * POST /config-evaluation/evaluation-criteria/bulk
   * Crea múltiples criterios de evaluación
   * Valida que la suma de porcentajes sea 100%
   */
  @Post('evaluation-criteria/bulk')
  @ROLES('admin', 'evaluator')
  @ApiOperation({
    summary: 'Crear múltiples criterios de evaluación',
    description: 'Crea múltiples criterios en una transacción. La suma de porcentajes debe ser 100%.'
  })
  @ApiResponse({ status: 201, description: 'Criterios de evaluación creados exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o la suma de porcentajes no es 100%.'
  })
  @ApiResponse({ status: 404, description: 'Evaluación o criterio no encontrado.' })
  bulkCreateEvaluationCriteria(
    @Body() bulkDto: BulkCreateEvaluationCriteriaDto,
  ) {
    return this.service.bulkCreateEvaluationCriteria(bulkDto);
  }

  /**
   * GET /config-evaluation/projects
   * Obtiene todos los proyectos
   */
  @Get('projects')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos.' })
  findAllProjects() {
    return this.service.findAllProjects();
  }

  /**
   * GET /config-evaluation/projects/:id
   * Obtiene un proyecto por ID
   */
  @Get('projects/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener un proyecto por ID' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  findProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findProjectById(id);
  }

  /**
   * GET /config-evaluation/evaluations
   * Obtiene todas las evaluaciones
   */
  @Get('evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener todas las evaluaciones' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones.' })
  findAllEvaluations() {
    return this.service.findAllEvaluations();
  }

  /**
   * GET /config-evaluation/evaluations/:id
   * Obtiene una evaluación por ID con todas sus relaciones
   */
  @Get('evaluations/:id')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener una evaluación por ID con relaciones completas' })
  @ApiResponse({ status: 200, description: 'Evaluación encontrada.' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada.' })
  findEvaluationById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findEvaluationById(id);
  }

  /**
   * GET /config-evaluation/projects/:projectId/evaluations
   * Obtiene evaluaciones por proyecto
   */
  @Get('projects/:projectId/evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener evaluaciones de un proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones del proyecto.' })
  findEvaluationsByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.service.findEvaluationsByProjectId(projectId);
  }

  /**
   * GET /config-evaluation/standards/:standardId/evaluations
   * Obtiene evaluaciones por estándar
   */
  @Get('standards/:standardId/evaluations')
  @ROLES('admin', 'evaluator')
  @ApiOperation({ summary: 'Obtener evaluaciones de un estándar' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones del estándar.' })
  findEvaluationsByStandard(@Param('standardId', ParseIntPipe) standardId: number) {
    return this.service.findEvaluationsByStandardId(standardId);
  }
}
