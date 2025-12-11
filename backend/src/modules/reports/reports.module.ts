import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';

// Entities - importamos las entidades existentes
import { Evaluation } from '../config-evaluation/entities/evaluation.entity';
import { Project } from '../config-evaluation/entities/project.entity';
import { EvaluationResult } from '../entry-data/entities/evaluation_result.entity';
import { EvaluationCriteriaResult } from '../entry-data/entities/evaluation_criteria_result.entity';
import { EvaluationMetricResult } from '../entry-data/entities/evaluation_metric_result.entity';
import { EvaluationCriterion } from '../config-evaluation/entities/evaluation-criterion.entity';
import { EvaluationMetric } from '../config-evaluation/entities/evaluation_metric.entity';
import { Criterion } from '../parameterization/entities/criterion.entity';
import { Metric } from '../parameterization/entities/metric.entity';
import { Standard } from '../parameterization/entities/standard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evaluation,
      Project,
      EvaluationResult,
      EvaluationCriteriaResult,
      EvaluationMetricResult,
      EvaluationCriterion,
      EvaluationMetric,
      Criterion,
      Metric,
      Standard,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
