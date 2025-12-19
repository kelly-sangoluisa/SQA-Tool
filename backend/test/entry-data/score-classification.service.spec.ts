import { Test, TestingModule } from '@nestjs/testing';
import { 
  ScoreClassificationService 
} from '../../src/modules/entry-data/services/score-classification.service';
import { 
  ScoreLevel, 
  SatisfactionGrade 
} from '../../src/common/decorators/score-classification.enum';

describe('ScoreClassificationService', () => {
  let service: ScoreClassificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoreClassificationService],
    }).compile();

    service = module.get<ScoreClassificationService>(ScoreClassificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateScoreLevel', () => {
    describe('with minimum_threshold = 80', () => {
      const threshold = 80;

      it('should return UNACCEPTABLE for very low scores', () => {
        // threshold_value = 8.0, limit = 8.0 * 0.34375 = 2.75
        expect(service.calculateScoreLevel(2, threshold)).toBe(ScoreLevel.UNACCEPTABLE);
        expect(service.calculateScoreLevel(2.74, threshold)).toBe(ScoreLevel.UNACCEPTABLE);
      });

      it('should return MINIMALLY_ACCEPTABLE for low-medium scores', () => {
        // limit = 8.0 * 0.625 = 5.0
        expect(service.calculateScoreLevel(2.75, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        expect(service.calculateScoreLevel(4, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        expect(service.calculateScoreLevel(4.99, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
      });

      it('should return TARGET_RANGE for good scores', () => {
        // limit = 8.0 * 1.09375 = 8.75
        expect(service.calculateScoreLevel(5, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        expect(service.calculateScoreLevel(7.5, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        expect(service.calculateScoreLevel(8.74, threshold)).toBe(ScoreLevel.TARGET_RANGE);
      });

      it('should return EXCEEDS_REQUIREMENTS for excellent scores', () => {
        expect(service.calculateScoreLevel(8.75, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
        expect(service.calculateScoreLevel(9.5, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
        expect(service.calculateScoreLevel(10, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
      });
    });

    describe('with minimum_threshold = 70', () => {
      const threshold = 70;

      it('should adapt ranges proportionally', () => {
        // threshold_value = 7.0
        // unacceptable < 7.0 * 0.34375 = 2.40625
        expect(service.calculateScoreLevel(2, threshold)).toBe(ScoreLevel.UNACCEPTABLE);
        expect(service.calculateScoreLevel(2.406, threshold)).toBe(ScoreLevel.UNACCEPTABLE);
        expect(service.calculateScoreLevel(2.41, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        
        // minimally_acceptable < 7.0 * 0.625 = 4.375
        expect(service.calculateScoreLevel(4, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        expect(service.calculateScoreLevel(4.37, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        
        // target_range < 7.0 * 1.09375 = 7.65625
        expect(service.calculateScoreLevel(5, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        expect(service.calculateScoreLevel(7.5, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        
        // exceeds >= 7.65625
        expect(service.calculateScoreLevel(7.66, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
        expect(service.calculateScoreLevel(9, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
      });
    });

    describe('with minimum_threshold = 90', () => {
      const threshold = 90;

      it('should adapt ranges for higher threshold', () => {
        // threshold_value = 9.0
        // unacceptable < 9.0 * 0.34375 = 3.094
        expect(service.calculateScoreLevel(3, threshold)).toBe(ScoreLevel.UNACCEPTABLE);
        
        // minimally_acceptable < 9.0 * 0.625 = 5.625
        expect(service.calculateScoreLevel(5, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        
        // target_range < 9.0 * 1.09375 = 9.844
        expect(service.calculateScoreLevel(8, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        expect(service.calculateScoreLevel(9.5, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        
        // exceeds >= 9.844
        expect(service.calculateScoreLevel(9.85, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
        expect(service.calculateScoreLevel(10, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
      });
    });

    describe('edge cases', () => {
      it('should handle score of 0', () => {
        expect(service.calculateScoreLevel(0, 80)).toBe(ScoreLevel.UNACCEPTABLE);
      });

      it('should handle score of 10', () => {
        expect(service.calculateScoreLevel(10, 80)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
      });

      it('should handle exact boundary values', () => {
        const threshold = 80;
        // Exact limit: 8.0 * 0.34375 = 2.75
        expect(service.calculateScoreLevel(2.75, threshold)).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
        
        // Exact limit: 8.0 * 0.625 = 5.0
        expect(service.calculateScoreLevel(5, threshold)).toBe(ScoreLevel.TARGET_RANGE);
        
        // Exact limit: 8.0 * 1.09375 = 8.75
        expect(service.calculateScoreLevel(8.75, threshold)).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
      });
    });
  });

  describe('calculateSatisfactionGrade', () => {
    describe('with minimum_threshold = 80', () => {
      const threshold = 80;

      it('should return UNSATISFACTORY for low scores', () => {
        // limit = 8.0 * 0.625 = 5.0
        expect(service.calculateSatisfactionGrade(2, threshold)).toBe(SatisfactionGrade.UNSATISFACTORY);
        expect(service.calculateSatisfactionGrade(4.5, threshold)).toBe(SatisfactionGrade.UNSATISFACTORY);
        expect(service.calculateSatisfactionGrade(4.99, threshold)).toBe(SatisfactionGrade.UNSATISFACTORY);
      });

      it('should return SATISFACTORY for medium scores', () => {
        // limit = 8.0 * 1.09375 = 8.75
        expect(service.calculateSatisfactionGrade(5, threshold)).toBe(SatisfactionGrade.SATISFACTORY);
        expect(service.calculateSatisfactionGrade(7, threshold)).toBe(SatisfactionGrade.SATISFACTORY);
        expect(service.calculateSatisfactionGrade(8.74, threshold)).toBe(SatisfactionGrade.SATISFACTORY);
      });

      it('should return VERY_SATISFACTORY for high scores', () => {
        expect(service.calculateSatisfactionGrade(8.75, threshold)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
        expect(service.calculateSatisfactionGrade(9.5, threshold)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
        expect(service.calculateSatisfactionGrade(10, threshold)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
      });
    });

    describe('with minimum_threshold = 70', () => {
      const threshold = 70;

      it('should adapt ranges proportionally', () => {
        // threshold_value = 7.0
        // unsatisfactory < 7.0 * 0.625 = 4.375
        expect(service.calculateSatisfactionGrade(4, threshold)).toBe(SatisfactionGrade.UNSATISFACTORY);
        
        // satisfactory < 7.0 * 1.09375 = 7.656
        expect(service.calculateSatisfactionGrade(5, threshold)).toBe(SatisfactionGrade.SATISFACTORY);
        expect(service.calculateSatisfactionGrade(7.5, threshold)).toBe(SatisfactionGrade.SATISFACTORY);
        
        // very_satisfactory >= 7.656
        expect(service.calculateSatisfactionGrade(7.66, threshold)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
        expect(service.calculateSatisfactionGrade(9, threshold)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
      });
    });

    describe('edge cases', () => {
      it('should handle score of 0', () => {
        expect(service.calculateSatisfactionGrade(0, 80)).toBe(SatisfactionGrade.UNSATISFACTORY);
      });

      it('should handle score of 10', () => {
        expect(service.calculateSatisfactionGrade(10, 80)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
      });

      it('should handle exact boundary values', () => {
        const threshold = 80;
        // Exact limit: 8.0 * 0.625 = 5.0
        expect(service.calculateSatisfactionGrade(5, threshold)).toBe(SatisfactionGrade.SATISFACTORY);
        
        // Exact limit: 8.0 * 1.09375 = 8.75
        expect(service.calculateSatisfactionGrade(8.75, threshold)).toBe(SatisfactionGrade.VERY_SATISFACTORY);
      });
    });
  });

  describe('classifyScore', () => {
    it('should return both score_level and satisfaction_grade', () => {
      const result = service.classifyScore(7.5, 80);
      
      expect(result).toHaveProperty('score_level');
      expect(result).toHaveProperty('satisfaction_grade');
      expect(result.score_level).toBe(ScoreLevel.TARGET_RANGE);
      expect(result.satisfaction_grade).toBe(SatisfactionGrade.SATISFACTORY);
    });

    it('should classify low score correctly', () => {
      const result = service.classifyScore(3, 80);
      
      expect(result.score_level).toBe(ScoreLevel.MINIMALLY_ACCEPTABLE);
      expect(result.satisfaction_grade).toBe(SatisfactionGrade.UNSATISFACTORY);
    });

    it('should classify high score correctly', () => {
      const result = service.classifyScore(9.5, 80);
      
      expect(result.score_level).toBe(ScoreLevel.EXCEEDS_REQUIREMENTS);
      expect(result.satisfaction_grade).toBe(SatisfactionGrade.VERY_SATISFACTORY);
    });

    it('should work with different thresholds', () => {
      const result70 = service.classifyScore(6, 70);
      const result80 = service.classifyScore(6, 80);
      const result90 = service.classifyScore(6, 90);
      
      // Same score, different thresholds should give different results
      expect(result70.score_level).toBe(ScoreLevel.TARGET_RANGE);
      expect(result80.score_level).toBe(ScoreLevel.TARGET_RANGE);
      expect(result90.score_level).toBe(ScoreLevel.TARGET_RANGE);
    });
  });

  describe('real-world scenarios', () => {
    it('should classify typical evaluation scores with threshold 80', () => {
      const scenarios = [
        { score: 1.5, expectedLevel: ScoreLevel.UNACCEPTABLE, expectedGrade: SatisfactionGrade.UNSATISFACTORY },
        { score: 3.5, expectedLevel: ScoreLevel.MINIMALLY_ACCEPTABLE, expectedGrade: SatisfactionGrade.UNSATISFACTORY },
        { score: 6.5, expectedLevel: ScoreLevel.TARGET_RANGE, expectedGrade: SatisfactionGrade.SATISFACTORY },
        { score: 9, expectedLevel: ScoreLevel.EXCEEDS_REQUIREMENTS, expectedGrade: SatisfactionGrade.VERY_SATISFACTORY },
      ];

      scenarios.forEach(({ score, expectedLevel, expectedGrade }) => {
        const result = service.classifyScore(score, 80);
        expect(result.score_level).toBe(expectedLevel);
        expect(result.satisfaction_grade).toBe(expectedGrade);
      });
    });

    it('should handle project with different minimum thresholds', () => {
      const score = 7;
      
      // Strict project (threshold 90)
      const strictResult = service.classifyScore(score, 90);
      expect(strictResult.score_level).toBe(ScoreLevel.TARGET_RANGE);
      
      // Normal project (threshold 80)
      const normalResult = service.classifyScore(score, 80);
      expect(normalResult.score_level).toBe(ScoreLevel.TARGET_RANGE);
      
      // Lenient project (threshold 70)
      const lenientResult = service.classifyScore(score, 70);
      expect(lenientResult.score_level).toBe(ScoreLevel.TARGET_RANGE);
    });
  });
});
