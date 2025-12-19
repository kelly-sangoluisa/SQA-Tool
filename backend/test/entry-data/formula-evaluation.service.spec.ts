import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { FormulaEvaluationService } from '../../src/modules/entry-data/services/formula-evaluation.service';

describe('FormulaEvaluationService', () => {
  let service: FormulaEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulaEvaluationService],
    }).compile();

    service = module.get<FormulaEvaluationService>(FormulaEvaluationService);
    
    // Silenciar logs durante los tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateFormula', () => {
    it('should evaluate simple division formula correctly', () => {
      // Arrange
      const formula = 'a/b';
      const variables = [
        { symbol: 'a', value: 10 },
        { symbol: 'b', value: 2 }
      ];

      // Act
      const result = service.evaluateFormula(formula, variables);

      // Assert
      expect(result).toBe(5);
    });

    it('should evaluate complex formula correctly', () => {
      // Arrange
      const formula = '(a + b) * c / d';
      const variables = [
        { symbol: 'a', value: 10 },
        { symbol: 'b', value: 5 },
        { symbol: 'c', value: 2 },
        { symbol: 'd', value: 3 }
      ];

      // Act
      const result = service.evaluateFormula(formula, variables);

      // Assert
      expect(result).toBe(10); // (10 + 5) * 2 / 3 = 30/3 = 10
    });

    it('should handle decimal results with proper rounding', () => {
      // Arrange
      const formula = 'a/b';
      const variables = [
        { symbol: 'a', value: 10 },
        { symbol: 'b', value: 3 }
      ];

      // Act
      const result = service.evaluateFormula(formula, variables);

      // Assert
      expect(result).toBe(3.3333); // Redondeado a 4 decimales
    });

    it('should handle single variable formulas', () => {
      // Arrange
      const formula = 'x * 2';
      const variables = [
        { symbol: 'x', value: 7.5 }
      ];

      // Act
      const result = service.evaluateFormula(formula, variables);

      // Assert
      expect(result).toBe(15);
    });

    it('should throw error for empty formula', () => {
      // Arrange
      const formula = '';
      const variables = [{ symbol: 'a', value: 10 }];

      // Act & Assert
      expect(() => service.evaluateFormula(formula, variables))
        .toThrow('Formula evaluation failed: Formula cannot be empty');
    });

    it('should throw error for formula with unreplaced variables', () => {
      // Arrange
      const formula = 'a + b + c';
      const variables = [
        { symbol: 'a', value: 10 },
        { symbol: 'b', value: 5 }
        // Falta 'c'
      ];

      // Act & Assert
      expect(() => service.evaluateFormula(formula, variables))
        .toThrow('Expression contains unreplaced variables');
    });

    it('should throw error for invalid characters in formula', () => {
      // Arrange
      const formula = 'a + b; DROP TABLE users;';
      const variables = [
        { symbol: 'a', value: 10 },
        { symbol: 'b', value: 5 }
      ];

      // Act & Assert
      expect(() => service.evaluateFormula(formula, variables))
        .toThrow('Expression contains invalid characters');
    });

    it('should handle zero division gracefully', () => {
      // Arrange
      const formula = 'a/b';
      const variables = [
        { symbol: 'a', value: 10 },
        { symbol: 'b', value: 0 }
      ];

      // Act & Assert
      expect(() => service.evaluateFormula(formula, variables))
        .toThrow('Formula evaluation failed: Calculation error: Division by zero');
    });

    it('should replace variables in order of precedence (longer symbols first)', () => {
      // Arrange
      const formula = 'abc + ab + a';
      const variables = [
        { symbol: 'a', value: 1 },
        { symbol: 'ab', value: 10 },
        { symbol: 'abc', value: 100 }
      ];

      // Act
      const result = service.evaluateFormula(formula, variables);

      // Assert
      expect(result).toBe(111); // 100 + 10 + 1
    });
  });

  describe('validateRequiredVariables', () => {
    it('should return empty array when all variables are provided', () => {
      // Arrange
      const formula = 'a + b * c';
      const providedVariables = [
        { symbol: 'a' },
        { symbol: 'b' },
        { symbol: 'c' }
      ];

      // Act
      const missing = service.validateRequiredVariables(formula, providedVariables);

      // Assert
      expect(missing).toEqual([]);
    });

    it('should return missing variables', () => {
      // Arrange
      const formula = 'a + b + c + d';
      const providedVariables = [
        { symbol: 'a' },
        { symbol: 'c' }
      ];

      // Act
      const missing = service.validateRequiredVariables(formula, providedVariables);

      // Assert
      expect(missing).toEqual(['b', 'd']);
    });

    it('should handle formulas with no variables', () => {
      // Arrange
      const formula = '2 + 3 * 4';
      const providedVariables = [];

      // Act
      const missing = service.validateRequiredVariables(formula, providedVariables);

      // Assert
      expect(missing).toEqual([]);
    });

    it('should handle duplicate variables in formula', () => {
      // Arrange
      const formula = 'a + a * b + a';
      const providedVariables = [
        { symbol: 'a' },
        { symbol: 'b' }
      ];

      // Act
      const missing = service.validateRequiredVariables(formula, providedVariables);

      // Assert
      expect(missing).toEqual([]);
    });
  });
});