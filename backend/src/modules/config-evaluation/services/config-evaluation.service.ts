import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

// Entities
import { Project, ProjectStatus } from '../entities/project.entity';
import { Evaluation } from '../entities/evaluation.entity';
import { EvaluationCriterion } from '../entities/evaluation-criterion.entity';
import { Standard } from '../../parameterization/entities/standard.entity';
import { Criterion } from '../../parameterization/entities/criterion.entity';
import { User } from '../../../users/entities/user.entity';

// DTOs
import { CreateProjectDto } from '../dto/project.dto';
import { CreateEvaluationDto } from '../dto/evaluation.dto';
import { CreateEvaluationCriterionDto, BulkCreateEvaluationCriteriaDto } from '../dto/evaluation-criterion.dto';

@Injectable()
export class ConfigEvaluationService {
  private readonly logger = new Logger(ConfigEvaluationService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(EvaluationCriterion)
    private readonly evaluationCriterionRepo: Repository<EvaluationCriterion>,
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @InjectRepository(Criterion)
    private readonly criterionRepo: Repository<Criterion>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un nuevo proyecto
   * Se ejecuta primero en el flujo de configuración de evaluación
   */
  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.dataSource.transaction(async manager => {
      // Verificar que el usuario existe
      const user = await this.userRepo.findOneBy({ id: createProjectDto.creator_user_id });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createProjectDto.creator_user_id} not found`
        );
      }

      // Crear el proyecto
      const projectRepo = manager.getRepository(Project);
      const newProject = projectRepo.create({
        name: createProjectDto.name,
        description: createProjectDto.description,
        creator_user_id: createProjectDto.creator_user_id,
        status: ProjectStatus.IN_PROGRESS,
      });

      const savedProject = await projectRepo.save(newProject);

      this.logger.log(
        `Project created: ${savedProject.name} (ID: ${savedProject.id}) by user ${createProjectDto.creator_user_id}`
      );

      return savedProject;
    });
  }

  /**
   * Crea una nueva evaluación
   * Se ejecuta después de crear el proyecto
   */
  async createEvaluation(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    return this.dataSource.transaction(async manager => {
      // Verificar que el proyecto existe
      const project = await this.projectRepo.findOneBy({ id: createEvaluationDto.project_id });
      if (!project) {
        throw new NotFoundException(
          `Project with ID ${createEvaluationDto.project_id} not found`
        );
      }

      // Verificar que el estándar existe
      const standard = await this.standardRepo.findOneBy({ id: createEvaluationDto.standard_id });
      if (!standard) {
        throw new NotFoundException(
          `Standard with ID ${createEvaluationDto.standard_id} not found`
        );
      }

      // Crear la evaluación
      const evaluationRepo = manager.getRepository(Evaluation);
      const newEvaluation = evaluationRepo.create({
        project_id: createEvaluationDto.project_id,
        standard_id: createEvaluationDto.standard_id,
      });

      const savedEvaluation = await evaluationRepo.save(newEvaluation);

      this.logger.log(
        `Evaluation created (ID: ${savedEvaluation.id}) for project ${createEvaluationDto.project_id} with standard ${createEvaluationDto.standard_id}`
      );

      return savedEvaluation;
    });
  }

  /**
   * Crea criterios de evaluación (puede crear múltiples a la vez)
   * Se ejecuta después de crear la evaluación
   */
  async createEvaluationCriterion(
    createDto: CreateEvaluationCriterionDto
  ): Promise<EvaluationCriterion> {
    return this.dataSource.transaction(async manager => {
      // Verificar que la evaluación existe
      const evaluation = await this.evaluationRepo.findOneBy({ id: createDto.evaluation_id });
      if (!evaluation) {
        throw new NotFoundException(
          `Evaluation with ID ${createDto.evaluation_id} not found`
        );
      }

      // Verificar que el criterio existe
      const criterion = await this.criterionRepo.findOneBy({ id: createDto.criterion_id });
      if (!criterion) {
        throw new NotFoundException(
          `Criterion with ID ${createDto.criterion_id} not found`
        );
      }

      // Crear el criterio de evaluación
      const evaluationCriterionRepo = manager.getRepository(EvaluationCriterion);
      const newEvaluationCriterion = evaluationCriterionRepo.create(createDto);
      const savedCriterion = await evaluationCriterionRepo.save(newEvaluationCriterion);

      this.logger.log(
        `Evaluation criterion created (ID: ${savedCriterion.id}) for evaluation ${createDto.evaluation_id}`
      );

      return savedCriterion;
    });
  }

  /**
   * Crea múltiples criterios de evaluación en una sola transacción
   * Valida que la suma de porcentajes sea 100
   */
  async bulkCreateEvaluationCriteria(
    bulkDto: BulkCreateEvaluationCriteriaDto
  ): Promise<EvaluationCriterion[]> {
    return this.dataSource.transaction(async manager => {
      // Validar que la suma de porcentajes sea 100
      const totalPercentage = bulkDto.criteria.reduce(
        (sum, criterion) => sum + Number(criterion.importance_percentage),
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new BadRequestException(
          `Sum of importance percentages must be 100%. Current sum: ${totalPercentage}%`
        );
      }

      // Verificar que todos los criterios pertenecen a la misma evaluación
      const evaluationIds = [...new Set(bulkDto.criteria.map(c => c.evaluation_id))];
      if (evaluationIds.length > 1) {
        throw new BadRequestException(
          'All criteria must belong to the same evaluation'
        );
      }

      const evaluationId = bulkDto.criteria[0].evaluation_id;

      // Verificar que la evaluación existe
      const evaluation = await this.evaluationRepo.findOneBy({ id: evaluationId });
      if (!evaluation) {
        throw new NotFoundException(`Evaluation with ID ${evaluationId} not found`);
      }

      // Verificar que todos los criterios existen
      const criterionIds = bulkDto.criteria.map(c => c.criterion_id);
      const criteria = await this.criterionRepo.find({
        where: criterionIds.map(id => ({ id })),
      });
      if (criteria.length !== criterionIds.length) {
        throw new BadRequestException('One or more criterion IDs are invalid');
      }

      // Crear todos los criterios de evaluación
      const evaluationCriteria: EvaluationCriterion[] = [];

      for (const criterionDto of bulkDto.criteria) {
        this.logger.log(`Creating criterion: ${JSON.stringify(criterionDto)}`);

        const newCriterion = manager.create(EvaluationCriterion, {
          evaluation_id: criterionDto.evaluation_id,
          criterion_id: criterionDto.criterion_id,
          importance_level: criterionDto.importance_level,
          importance_percentage: criterionDto.importance_percentage,
        });

        const savedCriterion = await manager.save(EvaluationCriterion, newCriterion);
        evaluationCriteria.push(savedCriterion);

        this.logger.log(`Criterion created with ID: ${savedCriterion.id}`);
      }

      this.logger.log(
        `Bulk created ${evaluationCriteria.length} evaluation criteria for evaluation ${evaluationId}`
      );

      return evaluationCriteria;
    });
  }

  /**
   * Obtiene un proyecto por ID
   */
  async findProjectById(id: number): Promise<Project> {
    const project = await this.projectRepo.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  /**
   * Obtiene todas las evaluaciones
   */
  async findAllEvaluations(): Promise<Evaluation[]> {
    return this.evaluationRepo.find({
      relations: ['project', 'standard', 'evaluation_criteria', 'evaluation_criteria.criterion'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtiene una evaluación por ID con todas sus relaciones
   */
  async findEvaluationById(id: number): Promise<Evaluation> {
    const evaluation = await this.evaluationRepo.findOne({
      where: { id },
      relations: [
        'project',
        'project.creator',
        'standard',
        'evaluation_criteria',
        'evaluation_criteria.criterion',
      ],
    });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  /**
   * Obtiene evaluaciones por proyecto
   */
  async findEvaluationsByProjectId(projectId: number): Promise<Evaluation[]> {
    return this.evaluationRepo.find({
      where: { project_id: projectId },
      relations: ['standard', 'evaluation_criteria', 'evaluation_criteria.criterion'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtiene evaluaciones por estándar
   */
  async findEvaluationsByStandardId(standardId: number): Promise<Evaluation[]> {
    return this.evaluationRepo.find({
      where: { standard_id: standardId },
      relations: ['project', 'evaluation_criteria', 'evaluation_criteria.criterion'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtiene todos los proyectos
   */
  async findAllProjects(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['creator', 'evaluations'],
      order: { created_at: 'DESC' },
    });
  }
}
