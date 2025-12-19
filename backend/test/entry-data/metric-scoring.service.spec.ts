import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MetricScoringService } from '../../src/modules/entry-data/services/metric-scoring.service';
import { ThresholdParserService} from '../../src/modules/entry-data/services/threshold-parser.service';
import { FormulaEvaluationService } from '../../src/modules/entry-data/services/formula-evaluation.service';

describe('MetricScoringService', () => {
  let service: MetricScoringService;
  let thresholdParser: ThresholdParserService;
  let formulaEvaluation: FormulaEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricScoringService,
        ThresholdParserService,
        FormulaEvaluationService,
      ],
    }).compile();

    service = module.get<MetricScoringService>(MetricScoringService);
    
    // Silenciar logs durante los tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateScore - CASE 1: SIMPLE_BINARY', () => {
    it('should calculate score for simple binary case with formula', () => {
      // Arrange
      const formula = '1-(A/B)';
      const variables = [
        { symbol: 'A', value: 50 },
        { symbol: 'B', value: 100 }
      ];

      // Act
      const result = service.calculateScore(formula, variables, '1', null);

      // Assert
      expect(result.calculated_value).toBe(0.5); // 1 - (50/100)
      expect(result.weighted_value).toBe(5); // 0.5 * 10
    });
  });

  describe('calculateScore - CASE 2: RATIO_WITH_MIN_THRESHOLD', () => {
    it('should return max score when A >= D', () => {
      // Arrange
      const formula = 'A/T';
      const variables = [{ symbol: 'A', value: 12 }];

      // Act
      const result = service.calculateScore(formula, variables, '>=10/20min', '0/20min');

      // Assert
      expect(result.calculated_value).toBe(12);
      expect(result.weighted_value).toBe(10); // A >= D → 10
    });

    it('should calculate proportional score when A < D', () => {
      // Arrange
      const formula = 'A/T';
      const variables = [{ symbol: 'A', value: 8 }];

      // Act
      const result = service.calculateScore(formula, variables, '>=10/20min', '0/20min');

      // Assert
      expect(result.calculated_value).toBe(8);
      expect(result.weighted_value).toBe(8); // (8/10) * 10
    });
  });

  describe('calculateScore - CASE 3: INVERSE_RATIO_WITH_MAX', () => {
    it('should return 0 when A > W', () => {
      // Arrange
      const formula = 'A/T';
      const variables = [{ symbol: 'A', value: 15 }];

      // Act
      const result = service.calculateScore(formula, variables, '0/1min', '>=10/1min');

      // Assert
      expect(result.calculated_value).toBe(15);
      expect(result.weighted_value).toBe(0); // A > W → 0
    });

    it('should calculate inverse score when A <= W', () => {
      // Arrange
      const formula = 'A/T';
      const variables = [{ symbol: 'A', value: 5 }];

      // Act
      const result = service.calculateScore(formula, variables, '0/1min', '>=10/1min');

      // Assert
      expect(result.calculated_value).toBe(5);
      expect(result.weighted_value).toBe(5); // (1 - 5/10) * 10
    });
  });

  describe('calculateScore - CASE 4: TIME_THRESHOLD', () => {
    it('should return 0 when calculated > W', () => {
      // Arrange
      const formula = 'B-A';
      const variables = [
        { symbol: 'A', value: 5 },
        { symbol: 'B', value: 30 }
      ];

      // Act
      const result = service.calculateScore(formula, variables, '20min', '>20 min');

      // Assert
      expect(result.calculated_value).toBe(25); // 30 - 5
      expect(result.weighted_value).toBe(0); // 25 > 20 → 0
    });

    it('should calculate proportional score when calculated <= D', () => {
      // Arrange
      const formula = 'B-A';
      const variables = [
        { symbol: 'A', value: 5 },
        { symbol: 'B', value: 18 }
      ];

      // Act
      const result = service.calculateScore(formula, variables, '20min', '>20 min');

      // Assert
      expect(result.calculated_value).toBe(13); // 18 - 5
      expect(result.weighted_value).toBe(6.5); // (13/20) * 10
    });
  });

  describe('calculateScore - CASE 5: ZERO_WITH_MAX_THRESHOLD', () => {
    it('should return 0 when calculated > W', () => {
      // Arrange
      const formula = 'A/B';
      const variables = [
        { symbol: 'A', value: 80 },
        { symbol: 'B', value: 5 }
      ];

      // Act
      const result = service.calculateScore(formula, variables, '0seg', '>=15 seg');

      // Assert
      expect(result.calculated_value).toBe(16); // 80/5
      expect(result.weighted_value).toBe(0); // 16 > 15 → 0
    });

    it('should calculate inverse proportional score when calculated <= W', () => {
      // Arrange
      const formula = 'A/B';
      const variables = [
        { symbol: 'A', value: 30 },
        { symbol: 'B', value: 5 }
      ];

      // Act
      const result = service.calculateScore(formula, variables, '0seg', '>=15 seg');

      // Assert
      expect(result.calculated_value).toBe(6); // 30/5
      expect(result.weighted_value).toBe(6); // (1 - 6/15) * 10
    });
  });

  describe('calculateScore - CASE 6: PERCENTAGE_WITH_MAX', () => {
    it('should return 0 when calculated >= W', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 12 }];

      // Act
      const result = service.calculateScore(formula, variables, '0 %', '>=10%');

      // Assert
      expect(result.calculated_value).toBe(12);
      expect(result.weighted_value).toBe(0); // 12 >= 10 → 0
    });

    it('should return 10 when calculated == 1', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 1 }];

      // Act
      const result = service.calculateScore(formula, variables, '0 %', '>=10%');

      // Assert
      expect(result.calculated_value).toBe(1);
      expect(result.weighted_value).toBe(10); // calculated == 1 → 10
    });

    it('should calculate inverse proportional score otherwise', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 3 }];

      // Act
      const result = service.calculateScore(formula, variables, '0 %', '>=10%');

      // Assert
      expect(result.calculated_value).toBe(3);
      expect(result.weighted_value).toBe(7); // (1 - 3/10) * 10
    });
  });

  describe('calculateScore - CASE 7: NUMERIC_WITH_MAX', () => {
    it('should return 0 when calculated >= W', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 5 }];

      // Act
      const result = service.calculateScore(formula, variables, '1', '>=4');

      // Assert
      expect(result.calculated_value).toBe(5);
      expect(result.weighted_value).toBe(0); // 5 >= 4 → 0
    });

    it('should return 10 when calculated == D', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 1 }];

      // Act
      const result = service.calculateScore(formula, variables, '1', '>=4');

      // Assert
      expect(result.calculated_value).toBe(1);
      expect(result.weighted_value).toBe(10); // calculated == D → 10
    });

    it('should calculate inverse proportional score otherwise', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 2 }];

      // Act
      const result = service.calculateScore(formula, variables, '1', '>=4');

      // Assert
      expect(result.calculated_value).toBe(2);
      expect(result.weighted_value).toBe(5); // (1 - 2/4) * 10
    });
  });

  describe('calculateScore - CASE 8: NUMERIC_WITH_MIN', () => {
    it('should return 0 when calculated == W', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 0 }];

      // Act
      const result = service.calculateScore(formula, variables, '4', '0');

      // Assert
      expect(result.calculated_value).toBe(0);
      expect(result.weighted_value).toBe(0); // calculated == W → 0
    });

    it('should return 10 when calculated >= D', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 4 }];

      // Act
      const result = service.calculateScore(formula, variables, '4', '0');

      // Assert
      expect(result.calculated_value).toBe(4);
      expect(result.weighted_value).toBe(10); // calculated >= D → 10
    });

    it('should calculate proportional score otherwise', () => {
      // Arrange
      const formula = 'A';
      const variables = [{ symbol: 'A', value: 3 }];

      // Act
      const result = service.calculateScore(formula, variables, '4', '0');

      // Assert
      expect(result.calculated_value).toBe(3);
      expect(result.weighted_value).toBe(7.5); // (3/4) * 10
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
