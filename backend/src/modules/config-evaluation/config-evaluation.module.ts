import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Project } from './entities/project.entity';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationCriterion } from './entities/evaluation-criterion.entity';
import { Standard } from '../parameterization/entities/standard.entity';
import { Criterion } from '../parameterization/entities/criterion.entity';
import { User } from '../../users/entities/user.entity';

// Services
import { ConfigEvaluationService } from './services/config-evaluation.service';

// Controllers
import { ConfigEvaluationController } from './controllers/config-evaluation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Evaluation,
      EvaluationCriterion,
      Standard,
      Criterion,
      User,
    ]),
  ],
  controllers: [ConfigEvaluationController],
  providers: [ConfigEvaluationService],
  exports: [ConfigEvaluationService],
})
export class ConfigEvaluationModule {}
