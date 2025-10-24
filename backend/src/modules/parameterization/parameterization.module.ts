import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controller
import { ParameterizationController } from './controllers/parameterization.controller';

// Service
import { ParameterizationService } from './services/parameterization.service';

// Entities
import { Standard } from './entities/standard.entity';
import { Criterion } from './entities/criterion.entity';
import { SubCriterion } from './entities/sub-criterion.entity';
import { Metric } from './entities/metric.entity';
import { FormulaVariable } from './entities/formula-variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Standard,
      Criterion,
      SubCriterion,
      Metric,
      FormulaVariable,
    ]),
  ],
  controllers: [ParameterizationController],
  providers: [ParameterizationService],
})
export class ParameterizationModule {}