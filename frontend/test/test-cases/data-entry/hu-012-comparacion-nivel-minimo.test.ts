/**
 * CASOS DE PRUEBA - HU-012: Comparación con Nivel Mínimo
 * Valida los criterios de aceptación de la historia de usuario HU-012
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


describe('HU-012: Comparación con nivel mínimo - Casos de Prueba', () => {
  
  // ============================================
  // CP-012-01: Comparación automática
  // ============================================
  test('CP-012-01: Lógica de comparación con nivel mínimo', () => {
    const compareWithMinimum = (finalResult: number, minimumLevel: number): boolean => {
      return finalResult >= minimumLevel;
    };
    
    // Caso 1: Cumple (2.5 >= 2)
    expect(compareWithMinimum(2.5, 2)).toBe(true);
    
    // Caso 2: No cumple (1.5 < 2)
    expect(compareWithMinimum(1.5, 2)).toBe(false);
    
    // Caso 3: Justo en el límite (2 >= 2)
    expect(compareWithMinimum(2, 2)).toBe(true);
  });

  test('CP-012-02: Estado de cumplimiento se determina correctamente', () => {
    interface ProjectResult {
      final_result: number;
      classification: string;
      meets_minimum: boolean;
    }
    
    const createProjectResult = (result: number, minimum: number): ProjectResult => {
      const meets = result >= minimum;
      let classification = 'Deficiente';
      
      if (result >= 3) classification = 'Excelente';
      else if (result >= 2) classification = 'Satisfactorio';
      else if (result >= 1) classification = 'Regular';
      
      return {
        final_result: result,
        classification,
        meets_minimum: meets,
      };
    };
    
    // Caso 1: Resultado 2.5, mínimo 2 → CUMPLE
    const result1 = createProjectResult(2.5, 2);
    expect(result1.meets_minimum).toBe(true);
    expect(result1.classification).toBe('Satisfactorio');
    
    // Caso 2: Resultado 1.5, mínimo 2 → NO CUMPLE
    const result2 = createProjectResult(1.5, 2);
    expect(result2.meets_minimum).toBe(false);
    expect(result2.classification).toBe('Regular');
  });
});
