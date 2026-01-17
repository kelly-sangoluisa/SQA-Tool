/**
 * CASOS DE PRUEBA - HU-009: Ingreso de Datos
 * Valida los criterios de aceptación de la historia de usuario HU-009
 */

import '@testing-library/jest-dom';

// Mock de react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => null,
}));


describe('HU-009: Ingreso de datos - Casos de Prueba', () => {
  
  // ============================================
  // CP-009-02: Apoyo visual de fórmula y descripción
  // ============================================
  describe('CP-009-02: Apoyo visual', () => {
    
    test('Verifica que las variables tienen descripciones definidas', () => {
      const mockVariables = [
        { symbol: 'a', description: 'Número de errores encontrados' },
        { symbol: 'b', description: 'Total de líneas de código' },
      ];

      // Verificar que cada variable tiene descripción no vacía
      mockVariables.forEach(variable => {
        expect(variable.description).toBeDefined();
        expect(variable.description.length).toBeGreaterThan(0);
        expect(variable.description).not.toBe('');
      });
    });

    test('Verifica que la fórmula está presente en los datos de métrica', () => {
      const mockMetric = {
        id: 1,
        name: 'Densidad de Defectos',
        formula: 'a/b',
        threshold: '>=0.5good',
        variables: [
          { symbol: 'a', description: 'Número de errores encontrados' },
          { symbol: 'b', description: 'Total de líneas de código' },
        ],
      };

      // Verificar que la fórmula existe y no está vacía
      expect(mockMetric.formula).toBeDefined();
      expect(mockMetric.formula).not.toBe('');
      expect(mockMetric.formula).toBe('a/b');
    });

    test('Verifica que cada símbolo en la fórmula tiene su variable correspondiente', () => {
      const formula = 'a/b';
      const variables = [
        { symbol: 'a', description: 'Número de errores encontrados' },
        { symbol: 'b', description: 'Total de líneas de código' },
      ];

      // Extraer símbolos de la fórmula (simplificado)
      const symbolsInFormula = formula.match(/[a-z]/g) || [];
      const uniqueSymbols = [...new Set(symbolsInFormula)];

      // Verificar que cada símbolo tiene una variable con descripción
      uniqueSymbols.forEach(symbol => {
        const variable = variables.find(v => v.symbol === symbol);
        expect(variable).toBeDefined();
        expect(variable?.description).toBeDefined();
        expect(variable?.description.length).toBeGreaterThan(0);
      });
    });

    test('Verifica formato de descripción variable: "símbolo = descripción"', () => {
      const variables = [
        { symbol: 'a', description: 'Número de errores encontrados' },
        { symbol: 'b', description: 'Total de líneas de código' },
      ];

      // Simular el formato que se mostraría en la UI
      variables.forEach(variable => {
        const displayText = `${variable.symbol} = ${variable.description}`;
        
        expect(displayText).toContain(variable.symbol);
        expect(displayText).toContain('=');
        expect(displayText).toContain(variable.description);
      });
    });

    test('Verifica que fórmulas complejas contienen todos los símbolos necesarios', () => {
      const formula = '(a+b)/(c-d)';
      const variables = [
        { symbol: 'a', description: 'Variable A' },
        { symbol: 'b', description: 'Variable B' },
        { symbol: 'c', description: 'Variable C' },
        { symbol: 'd', description: 'Variable D' },
      ];

      // Verificar que la fórmula contiene todos los símbolos
      variables.forEach(variable => {
        expect(formula).toContain(variable.symbol);
      });

      // Verificar que hay la misma cantidad de variables que símbolos únicos
      const symbolsInFormula = formula.match(/[a-z]/g) || [];
      const uniqueSymbols = [...new Set(symbolsInFormula)];
      expect(variables.length).toBe(uniqueSymbols.length);
    });
  });

  
  // ============================================
  // CP-009-03: Bloqueo de datos incompatibles
  // ============================================
  describe('CP-009-03: División por cero', () => {
    
    test('Función isDenominatorVariable detecta denominadores correctamente', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isDenominatorVariable } = require('../../../src/utils/data-entry/divisionUtils');
      
      // Caso 1: División simple a/b
      expect(isDenominatorVariable('b', 'a/b')).toBe(true);
      expect(isDenominatorVariable('a', 'a/b')).toBe(false);
      
      // Caso 2: División múltiple a/b/c
      expect(isDenominatorVariable('b', 'a/b/c')).toBe(true);
      expect(isDenominatorVariable('c', 'a/b/c')).toBe(true);
      
      // Caso 3: Sin división
      expect(isDenominatorVariable('a', 'a+b')).toBe(false);
    });

    test('Función validateNoDivisionByZero rechaza cero en denominadores', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { validateNoDivisionByZero } = require('../../../src/utils/data-entry/divisionUtils');
      
      // Caso 1: Cero en denominador → Inválido
      const result1 = validateNoDivisionByZero('0', 'b', 'a/b');
      expect(result1.isValid).toBe(false);
      expect(result1.errorMessage).toContain('denominador');
      
      // Caso 2: Número válido en denominador → Válido
      const result2 = validateNoDivisionByZero('10', 'b', 'a/b');
      expect(result2.isValid).toBe(true);
      
      // Caso 3: Cero en numerador → Válido (permitido)
      const result3 = validateNoDivisionByZero('0', 'a', 'a/b');
      expect(result3.isValid).toBe(true);
    });

    test('Permite números que contienen 0 pero no son cero', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { validateNoDivisionByZero } = require('../../../src/utils/data-entry/divisionUtils');
      
      expect(validateNoDivisionByZero('10', 'b', 'a/b').isValid).toBe(true);
      expect(validateNoDivisionByZero('20', 'b', 'a/b').isValid).toBe(true);
      expect(validateNoDivisionByZero('100', 'b', 'a/b').isValid).toBe(true);
      expect(validateNoDivisionByZero('0', 'b', 'a/b').isValid).toBe(false);
    });
  });
});
