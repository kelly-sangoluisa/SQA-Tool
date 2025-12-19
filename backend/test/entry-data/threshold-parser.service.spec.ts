import { Test, TestingModule } from '@nestjs/testing';
import { 
  ThresholdParserService,
  ThresholdCaseType,
  ParsedThreshold 
} from '../../src/modules/entry-data/services/threshold-parser.service';

describe('ThresholdParserService', () => {
  let service: ThresholdParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThresholdParserService],
    }).compile();

    service = module.get<ThresholdParserService>(ThresholdParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseThreshold', () => {
    it('should parse simple numeric threshold', () => {
      // Act
      const result = service.parseThreshold('20');

      // Assert
      expect(result).toEqual({
        operator: undefined,
        value: 20,
        unit: undefined
      });
    });

    it('should parse threshold with operator', () => {
      // Act
      const result = service.parseThreshold('>=10');

      // Assert
      expect(result).toEqual({
        operator: '>=',
        value: 10,
        unit: undefined
      });
    });

    it('should parse threshold with unit (min)', () => {
      // Act
      const result = service.parseThreshold('20min');

      // Assert
      expect(result).toEqual({
        operator: undefined,
        value: 20,
        unit: 'min'
      });
    });

    it('should parse threshold with unit and spaces', () => {
      // Act
      const result = service.parseThreshold('20 min');

      // Assert
      expect(result).toEqual({
        operator: undefined,
        value: 20,
        unit: 'min'
      });
    });

    it('should parse threshold with percentage', () => {
      // Act
      const result = service.parseThreshold('10%');

      // Assert
      expect(result).toEqual({
        operator: undefined,
        value: 10,
        unit: '%'
      });
    });

    it('should parse ratio threshold without spaces', () => {
      // Act
      const result = service.parseThreshold('10/20');

      // Assert
      expect(result).toEqual({
        operator: undefined,
        value: 0.5,
        numerator: 10,
        denominator: 20,
        unit: undefined
      });
    });

    it('should parse ratio threshold with spaces', () => {
      // Act
      const result = service.parseThreshold('10 / 20');

      // Assert
      expect(result).toEqual({
        operator: undefined,
        value: 0.5,
        numerator: 10,
        denominator: 20,
        unit: undefined
      });
    });

    it('should parse complex threshold with operator, ratio and unit', () => {
      // Act
      const result = service.parseThreshold('>=10/20min');

      // Assert
      expect(result).toEqual({
        operator: '>=',
        value: 0.5,
        numerator: 10,
        denominator: 20,
        unit: 'min'
      });
    });

    it('should parse complex threshold with spaces', () => {
      // Act
      const result = service.parseThreshold('>= 10 / 20 min');

      // Assert
      expect(result).toEqual({
        operator: '>=',
        value: 0.5,
        numerator: 10,
        denominator: 20,
        unit: 'min'
      });
    });

    it('should throw error for empty threshold', () => {
      // Act & Assert
      expect(() => service.parseThreshold('')).toThrow('Threshold cannot be empty');
    });

    it('should throw error for invalid threshold value', () => {
      // Act & Assert
      expect(() => service.parseThreshold('invalid')).toThrow('Cannot parse threshold value');
    });
  });

  describe('classifyCase', () => {
    it('should classify SIMPLE_BINARY case (desired=1, worst=null)', () => {
      // Act
      const result = service.classifyCase('1', null);

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.SIMPLE_BINARY);
      expect(result.desired.value).toBe(1);
      expect(result.worst).toBeNull();
    });

    it('should classify SIMPLE_BINARY case (desired=0, worst=null)', () => {
      // Act
      const result = service.classifyCase('0', null);

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.SIMPLE_BINARY);
      expect(result.desired.value).toBe(0);
      expect(result.worst).toBeNull();
    });

    it('should classify RATIO_WITH_MIN_THRESHOLD case', () => {
      // Act
      const result = service.classifyCase('>=10/20min', '0/20min');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.RATIO_WITH_MIN_THRESHOLD);
      expect(result.desired.operator).toBe('>=');
      expect(result.desired.numerator).toBe(10);
      expect(result.desired.denominator).toBe(20);
      expect(result.worst?.numerator).toBe(0);
    });

    it('should classify INVERSE_RATIO_WITH_MAX case', () => {
      // Act
      const result = service.classifyCase('0/1min', '>=10/1min');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.INVERSE_RATIO_WITH_MAX);
      expect(result.desired.numerator).toBe(0);
      expect(result.worst?.operator).toBe('>=');
      expect(result.worst?.numerator).toBe(10);
    });

    it('should classify TIME_THRESHOLD case', () => {
      // Act
      const result = service.classifyCase('20min', '>20 min');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.TIME_THRESHOLD);
      expect(result.desired.value).toBe(20);
      expect(result.desired.unit).toBe('min');
      expect(result.worst?.operator).toBe('>');
    });

    it('should classify ZERO_WITH_MAX_THRESHOLD case', () => {
      // Act
      const result = service.classifyCase('0seg', '>=15 seg');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.ZERO_WITH_MAX_THRESHOLD);
      expect(result.desired.value).toBe(0);
      expect(result.desired.unit).toBe('seg');
      expect(result.worst?.value).toBe(15);
    });

    it('should classify PERCENTAGE_WITH_MAX case', () => {
      // Act
      const result = service.classifyCase('0 %', '>=10%');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.PERCENTAGE_WITH_MAX);
      expect(result.desired.value).toBe(0);
      expect(result.desired.unit).toBe('%');
      expect(result.worst?.value).toBe(10);
    });

    it('should classify NUMERIC_WITH_MAX case', () => {
      // Act
      const result = service.classifyCase('1', '>=4');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.NUMERIC_WITH_MAX);
      expect(result.desired.value).toBe(1);
      expect(result.worst?.value).toBe(4);
      expect(result.worst?.operator).toBe('>=');
    });

    it('should classify NUMERIC_WITH_MIN case', () => {
      // Act
      const result = service.classifyCase('4', '0');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.NUMERIC_WITH_MIN);
      expect(result.desired.value).toBe(4);
      expect(result.worst?.value).toBe(0);
    });

    it('should default to SIMPLE_BINARY when no case matches', () => {
      // Act
      const result = service.classifyCase('100', '50');

      // Assert
      expect(result.caseType).toBe(ThresholdCaseType.SIMPLE_BINARY);
    });
  });
});
