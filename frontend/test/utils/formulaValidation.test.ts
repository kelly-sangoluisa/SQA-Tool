import { 
  extractVariablesFromFormula, 
  validateFormula,
  validateVariablesMatchFormula 
} from '../../src/utils/parameterization-validation';

describe('extractVariablesFromFormula', () => {
  it('debe extraer variables de fórmulas simples', () => {
    expect(extractVariablesFromFormula('A/B')).toEqual(['A', 'B']);
    expect(extractVariablesFromFormula('A + B')).toEqual(['A', 'B']);
    expect(extractVariablesFromFormula('A * B + C')).toEqual(['A', 'B', 'C']);
  });

  it('debe extraer variables con guiones bajos', () => {
    expect(extractVariablesFromFormula('N_EXITO / N_TOTAL')).toEqual(['N_EXITO', 'N_TOTAL']);
    expect(extractVariablesFromFormula('VAR_A + VAR_B')).toEqual(['VAR_A', 'VAR_B']);
  });

  it('debe extraer variables de fórmulas complejas', () => {
    expect(extractVariablesFromFormula('1-(A/B)')).toEqual(['A', 'B']);
    expect(extractVariablesFromFormula('(N_EXITO / N_TOTAL) * 100')).toEqual(['N_EXITO', 'N_TOTAL']);
    expect(extractVariablesFromFormula('((A + B) / C) * 100')).toEqual(['A', 'B', 'C']);
  });

  it('debe eliminar duplicados', () => {
    expect(extractVariablesFromFormula('A + A + B')).toEqual(['A', 'B']);
    expect(extractVariablesFromFormula('(A * B) / (A + B)')).toEqual(['A', 'B']);
  });

  it('debe devolver array vacío para fórmulas sin variables', () => {
    expect(extractVariablesFromFormula('100')).toEqual([]);
    expect(extractVariablesFromFormula('1 + 2 + 3')).toEqual([]);
    expect(extractVariablesFromFormula('')).toEqual([]);
  });

  it('debe ignorar minúsculas', () => {
    expect(extractVariablesFromFormula('a + b')).toEqual([]);
    expect(extractVariablesFromFormula('A + b')).toEqual(['A']);
  });
});

describe('validateFormula', () => {
  describe('cuando es obligatoria', () => {
    it('debe rechazar fórmulas vacías', () => {
      const result = validateFormula('', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('obligatoria');
    });

    it('debe rechazar fórmulas sin variables', () => {
      const result = validateFormula('100 + 200', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('al menos una variable');
    });
  });

  describe('validaciones de formato', () => {
    it('debe rechazar paréntesis desbalanceados', () => {
      const result = validateFormula('(A + B', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Paréntesis desbalanceados');
    });

    it('debe rechazar caracteres no permitidos', () => {
      const result = validateFormula('A @ B', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('caracteres no permitidos');
    });

    it('debe aceptar guiones bajos en variables', () => {
      const result = validateFormula('N_TOTAL + N_EXITO', true);
      expect(result.valid).toBe(true);
    });
  });

  describe('detección de patrones', () => {
    it('debe detectar fórmulas con división', () => {
      const result = validateFormula('A/B', true);
      expect(result.valid).toBe(true);
      expect(result.success).toContain('división detectada');
      expect(result.success).toContain('2 variables');
    });

    it('debe detectar fórmulas de porcentaje', () => {
      const result = validateFormula('(A/B)*100', true);
      expect(result.valid).toBe(true);
      expect(result.success).toContain('porcentaje detectada');
    });

    it('debe listar las variables encontradas', () => {
      const result = validateFormula('N_EXITO / N_TOTAL', true);
      expect(result.valid).toBe(true);
      expect(result.success).toContain('N_EXITO');
      expect(result.success).toContain('N_TOTAL');
    });
  });
});

describe('validateVariablesMatchFormula', () => {
  describe('coincidencia exacta', () => {
    it('debe validar cuando las variables coinciden exactamente', () => {
      const result = validateVariablesMatchFormula('A/B', [
        { symbol: 'A', description: 'Variable A' },
        { symbol: 'B', description: 'Variable B' }
      ]);
      expect(result.valid).toBe(true);
      expect(result.success).toContain('correctamente definidas');
    });

    it('debe validar independientemente del orden', () => {
      const result = validateVariablesMatchFormula('A/B', [
        { symbol: 'B', description: 'Variable B' },
        { symbol: 'A', description: 'Variable A' }
      ]);
      expect(result.valid).toBe(true);
    });
  });

  describe('variables faltantes', () => {
    it('debe detectar variables faltantes', () => {
      const result = validateVariablesMatchFormula('A/B', [
        { symbol: 'A', description: 'Variable A' }
      ]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Faltan definir');
      expect(result.error).toContain('B');
    });

    it('debe listar todas las variables faltantes', () => {
      const result = validateVariablesMatchFormula('A + B + C', [
        { symbol: 'A', description: 'Variable A' }
      ]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('B');
      expect(result.error).toContain('C');
    });
  });

  describe('variables extras', () => {
    it('debe detectar variables no usadas', () => {
      const result = validateVariablesMatchFormula('A/B', [
        { symbol: 'A', description: 'Variable A' },
        { symbol: 'B', description: 'Variable B' },
        { symbol: 'C', description: 'Variable C' }
      ]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no usadas');
      expect(result.error).toContain('C');
    });
  });

  describe('sin fórmula', () => {
    it('debe rechazar variables si no hay fórmula', () => {
      const result = validateVariablesMatchFormula('', [
        { symbol: 'A', description: 'Variable A' }
      ]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('sin una fórmula');
    });

    it('debe validar si no hay fórmula ni variables', () => {
      const result = validateVariablesMatchFormula('', []);
      expect(result.valid).toBe(true);
    });
  });

  describe('casos complejos', () => {
    it('debe validar fórmulas con variables con guiones bajos', () => {
      const result = validateVariablesMatchFormula('(N_EXITO / N_TOTAL) * 100', [
        { symbol: 'N_EXITO', description: 'Número de éxitos' },
        { symbol: 'N_TOTAL', description: 'Total de casos' }
      ]);
      expect(result.valid).toBe(true);
    });

    it('debe validar fórmulas con paréntesis complejos', () => {
      const result = validateVariablesMatchFormula('1-(A/B)', [
        { symbol: 'A', description: 'Variable A' },
        { symbol: 'B', description: 'Variable B' }
      ]);
      expect(result.valid).toBe(true);
    });
  });

  describe('manejo de espacios', () => {
    it('debe ignorar espacios en los símbolos', () => {
      const result = validateVariablesMatchFormula('A/B', [
        { symbol: ' A ', description: 'Variable A' },
        { symbol: ' B ', description: 'Variable B' }
      ]);
      expect(result.valid).toBe(true);
    });

    it('debe ignorar variables vacías', () => {
      const result = validateVariablesMatchFormula('A/B', [
        { symbol: 'A', description: 'Variable A' },
        { symbol: '', description: '' },
        { symbol: 'B', description: 'Variable B' }
      ]);
      expect(result.valid).toBe(true);
    });
  });
});
