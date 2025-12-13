import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { AIAnalysisService } from './services/ai-analysis.service';

// Entities - importamos las entidades existentes
import { Evaluation } from '../config-evaluation/entities/evaluation.entity';
import { Project } from '../config-evaluation/entities/project.entity';
import { EvaluationResult } from '../entry-data/entities/evaluation_result.entity';
import { ProjectResult } from '../entry-data/entities/project_result.entity';
import { EvaluationCriteriaResult } from '../entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriterion } from '../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../config-evaluation/entities/evaluation_metric.entity';
import { Criterion } from '../parameterization/entities/criterion.entity';
import { Metric } from '../parameterization/entities/metric.entity';
import { Standard } from '../parameterization/entities/standard.entity';
import { EvaluationVariable } from '../entry-data/entities/evaluation_variable.entity';
import { FormulaVariable } from '../parameterization/entities/formula-variable.entity';
import { User } from '../../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evaluation,
      Project,
      EvaluationResult,
      ProjectResult,
      EvaluationCriteriaResult,
      EvaluationMetricResult,
      EvaluationCriterion,
      EvaluationMetric,
      Criterion,
      Metric,
      Standard,
      EvaluationVariable,
      FormulaVariable,
      User,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, AIAnalysisService],
  exports: [ReportsService, AIAnalysisService],
})
export class ReportsModule {}
