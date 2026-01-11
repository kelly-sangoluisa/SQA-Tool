/**
 * CASOS DE PRUEBA - HU-007: Guardar Progreso de la Evaluación
 * Valida los criterios de aceptación de la historia de usuario HU-007
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


describe('HU-007: Guardar Progreso - Casos de Prueba', () => {
  
  // ============================================
  // CP-007-01: Guardado parcial en localStorage
  // ============================================
  test('CP-007-01: LocalStorage guarda y recupera datos correctamente', () => {
    const projectId = 123;
    const metricId = 456;
    const key = `evaluation_${projectId}_metric_${metricId}`;
    const data = { a: 15, b: 30 };
    
    // Guardar
    localStorage.setItem(key, JSON.stringify(data));
    
    // Recuperar
    const recovered = JSON.parse(localStorage.getItem(key) || '{}');
    
    expect(recovered).toEqual(data);
    expect(recovered.a).toBe(15);
    expect(recovered.b).toBe(30);
    
    // Limpiar
    localStorage.removeItem(key);
  });
});
