import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { EntryDataController } from './controllers/entry-data.controller';

// Services
import { EntryDataService } from './services/entry-data.service';

// Entities - Entry Data
import { EvaluationCriteriaResult } from './entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from './entities/evaluation_metric_result.entity';
import { EvaluationResult } from './entities/evaluation_result.entity';
import { EvaluationVariable } from './entities/evaluation_variable.entity';
import { ProjectResult } from './entities/project_result.entity';

// Entities - Related modules (needed for validations and relationships)
import { EvaluationCriterion } from '../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../config-evaluation/entities/evaluation_metric.entity';
import { Evaluation } from '../config-evaluation/entities/evaluation.entity';
import { Project } from '../config-evaluation/entities/project.entity';
import { FormulaVariable } from '../parameterization/entities/formula-variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entry Data entities
      EvaluationCriteriaResult,
      EvaluationMetricResult,
      EvaluationResult,
      EvaluationVariable,
      ProjectResult,
      
      // Related entities for validations
      EvaluationCriterion,
      EvaluationMetric,
      Evaluation,
      Project,
      FormulaVariable,
    ]),
  ],
  controllers: [EntryDataController],
  providers: [EntryDataService],
  exports: [EntryDataService], // Exportar el servicio para que otros módulos puedan usarlo
})
export class EntryDataModule {}